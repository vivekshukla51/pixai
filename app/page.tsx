"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Download,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
  Eraser,
  Wand2,
  ZoomIn,
  Crop,
  User,
  Star,
  Github,
  Mail,
  ArrowRight,
  Play,
  Settings,
  Users,
  Zap,
  Palette,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { upload } from "@imagekit/next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  transformationOptions,
  demoImages,
  buildTransformationUrl,
} from "@/config/imagekit";

// Icon mapping for transformations
const iconMap = {
  eraser: Eraser,
  scissors: Eraser,
  shadow: Wand2,
  sparkles: Sparkles,
  "zoom-in": ZoomIn,
  crop: Crop,
  user: User,
  copy: Sparkles,
  palette: Wand2,
  edit: Sparkles,
};

// Feature cards data
const featureCards = [
  {
    id: "ai-background-removal",
    title: "AI Background Removal",
    description: "Remove backgrounds instantly with advanced AI",
    icon: Eraser,
    color: "from-gray-600 to-gray-800",
    status: "Popular",
  },
  {
    id: "smart-cropping",
    title: "Smart Cropping",
    description: "Auto-crop to perfect squares with face detection",
    icon: Crop,
    color: "from-gray-700 to-gray-900",
    status: "New",
  },
  {
    id: "image-enhancement",
    title: "Image Enhancement",
    description: "Sharpen, contrast, and optimize your images",
    icon: Sparkles,
    color: "from-gray-600 to-gray-800",
    status: "Free",
  },
  {
    id: "resize-optimize",
    title: "Resize & Optimize",
    description: "Resize images with quality optimization",
    icon: ZoomIn,
    color: "from-gray-700 to-gray-900",
    status: "Fast",
  },
  {
    id: "face-cropping",
    title: "Face Cropping",
    description: "Intelligent face detection and cropping",
    icon: User,
    color: "from-gray-600 to-gray-800",
    status: "AI-Powered",
  },
  {
    id: "drop-shadow",
    title: "Drop Shadow",
    description: "Add realistic shadows to your images",
    icon: Wand2,
    color: "from-gray-700 to-gray-900",
    status: "Premium",
  },
];

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedTransformations, setSelectedTransformations] = useState<
    string[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentDemoImage, setCurrentDemoImage] = useState<string>("");
  const [isUsingDemo, setIsUsingDemo] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"features" | "studio">("features");

  // Add test function to window for debugging
  useEffect(() => {
    (window as any).testTransformation = (
      imageUrl: string,
      transformation: string
    ) => {
      console.log("🧪 Testing transformation:", transformation);
      console.log("📸 Original URL:", imageUrl);

      const testUrl = buildTransformationUrl(imageUrl, [transformation]);
      console.log("🔗 Transformed URL:", testUrl);

      // Test if the transformation URL loads
      const img = new Image();
      img.onload = () => {
        console.log(
          "✅ Transformation successful! Image dimensions:",
          img.width,
          "x",
          img.height
        );
      };
      img.onerror = () => {
        console.error("❌ Transformation failed to load");
      };
      img.src = testUrl;

      return testUrl;
    };

    console.log(
      "🛠️ Debug tools loaded! Try: testTransformation('your-image-url', 'e-bgremove')"
    );
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setProcessedImageUrl("");
      setSelectedTransformations([]);
      setCurrentDemoImage("");
      setIsUsingDemo(false);
      setUploadedImageUrl("");
      setActiveSection("studio");

      // Upload to ImageKit using the official SDK
      setIsUploading(true);
      try {
        // Get fresh authentication parameters with unique request data
        const uniqueData = {
          timestamp: Date.now(),
          fileId: crypto.randomUUID(),
          fileName: file.name
        };
        
        const authResponse = await fetch("/api/upload-auth", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uniqueData)
        });
        
        if (!authResponse.ok) {
          throw new Error("Failed to get upload authentication");
        }

        const { token, expire, signature, publicKey } =
          await authResponse.json();

        // Upload using ImageKit SDK
        const uploadResponse = await upload({
          file,
          fileName: file.name,
          token,
          expire,
          signature,
          publicKey,
          // Optional: Track upload progress
          onProgress: (event) => {
            // Could add progress tracking here if needed
            console.log(
              `Upload progress: ${(event.loaded / event.total) * 100}%`
            );
          },
        });

        if (uploadResponse.url) {
          setUploadedImageUrl(uploadResponse.url);
          console.log("Image uploaded to ImageKit:", uploadResponse.url);
        } else {
          throw new Error("Upload response missing URL");
        }
      } catch (error) {
        console.error("Upload error:", error);
        // Upload failed, but we can still continue with demo
      } finally {
        setIsUploading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const applyTransformations = async () => {
    if (!uploadedImage || selectedTransformations.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setIsImageLoading(false); // Reset any previous loading state

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    try {
      const transformationParams = selectedTransformations
        .map((id) => {
          const option = transformationOptions.find((opt) => opt.id === id);
          return option?.transformation;
        })
        .filter((param): param is string => Boolean(param));

      let baseImageUrl = "";

      if (isUsingDemo) {
        // Use demo image
        baseImageUrl = currentDemoImage;
      } else if (uploadedImageUrl) {
        // Use uploaded image
        baseImageUrl = uploadedImageUrl;
      } else {
        // Fallback to demo if upload failed
        baseImageUrl = demoImages[0].url;
        console.log("Fallback: Using demo image since upload failed");
      }

      const transformedUrl = buildTransformationUrl(
        baseImageUrl,
        transformationParams
      );

      console.log(
        "Transformation applied to:",
        isUsingDemo
          ? "Demo image"
          : uploadedImageUrl
          ? "Your uploaded image"
          : "Demo fallback"
      );
      console.log("Transformed URL:", transformedUrl);

      // AI transformations can take 10-60 seconds to process
      // Show immediate result, but it might take time to load
      console.log(
        "⏱️ Note: AI transformations can take 10-60 seconds to process"
      );

      setProcessedImageUrl(transformedUrl);
      setIsImageLoading(true); // Start loading state for transformed image
      setProcessingProgress(100);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error applying transformations:", error);
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const useDemoImage = () => {
    const randomDemo =
      demoImages[Math.floor(Math.random() * demoImages.length)];
    setCurrentDemoImage(randomDemo.url);
    setImagePreview(randomDemo.url);
    setUploadedImage(new File([""], "demo-image.jpg", { type: "image/jpeg" }));
    setProcessedImageUrl("");
    setSelectedTransformations([]);
    setIsUsingDemo(true);
    setActiveSection("studio");
  };

  const toggleTransformation = (transformationId: string) => {
    setSelectedTransformations((prev) => {
      if (prev.includes(transformationId)) {
        return prev.filter((id) => id !== transformationId);
      } else {
        return [...prev, transformationId];
      }
    });

    // Reset processed image and loading state when changing selections
    if (processedImageUrl) {
      setProcessedImageUrl("");
      setIsImageLoading(false);
    }
  };

  const downloadImage = () => {
    if (processedImageUrl) {
      const link = document.createElement("a");
      link.href = processedImageUrl;
      link.download = "ai-transformed-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setImagePreview("");
    setProcessedImageUrl("");
    setSelectedTransformations([]);
    setIsProcessing(false);
    setProcessingProgress(0);
    setCurrentDemoImage("");
    setIsUsingDemo(false);
    setUploadedImageUrl("");
    setIsUploading(false);
    setIsImageLoading(false);
    setActiveSection("features");
  };

  // Get main transformations (most popular ones)
  const mainTransformations = transformationOptions.filter((t) =>
    [
      "bg-removal",
      "bg-remove-shadow",
      "smart-crop",
      "face-crop",
      "resize-optimize",
      "enhance-basic",
    ].includes(t.id)
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PixAI</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => setActiveSection("features")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {activeSection === "features" ? (
          <div className="space-y-16">
            {/* Features Section */}
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Transform your images with{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  AI magic
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Introducing the AI-powered image transformation system. Remove backgrounds, 
                enhance quality, and create stunning visuals with just a few clicks.
              </p>
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                  onClick={() => setActiveSection("studio")}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((feature) => (
                <Card key={feature.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                        {feature.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to transform your images?</h2>
              <p className="text-gray-400">Try our AI Studio now and see the magic happen</p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                onClick={() => setActiveSection("studio")}
              >
                <Play className="w-4 h-4 mr-2" />
                Launch AI Studio
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* AI Studio Section */}
            {/* Studio Header */}
                         <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 <h1 className="text-3xl font-bold">AI Studio</h1>
               </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Settings className="w-4 h-4" />
                <span>Powered by ImageKit AI</span>
              </div>
            </div>

            {!uploadedImage ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8">
                  <div
                    {...getRootProps()}
                    className={`p-12 text-center cursor-pointer border-2 border-dashed rounded-lg transition-colors ${
                      isDragActive
                        ? "border-gray-500 bg-gray-500/10"
                        : "border-gray-700 hover:border-gray-500/50"
                    }`}
                  >
                    <input {...getInputProps()} />

                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {isDragActive ? "Drop your image" : "Upload an image"}
                        </h3>
                        <p className="text-gray-400">
                          JPG, PNG, WEBP up to 10MB
                        </p>
                      </div>

                      <div className="flex gap-4 justify-center pt-4">
                        <Button onClick={(e) => e.stopPropagation()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            useDemoImage();
                          }}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Try Demo
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : isProcessing ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Processing
                  </h3>
                  <div className="space-y-2 mb-4">
                    <Progress value={processingProgress} className="h-2" />
                    <p className="text-sm text-gray-400">
                      {processingProgress}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Image and Controls */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Image Preview */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Your Image</CardTitle>
                      {isUploading && (
                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                          <p className="text-sm text-blue-300">
                            📤 Uploading to ImageKit...
                          </p>
                        </div>
                      )}
                      {!isUsingDemo &&
                        uploadedImage &&
                        !isUploading &&
                        uploadedImageUrl && (
                          <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                            <p className="text-sm text-green-300">
                              ✅ Image uploaded! AI transformations will work on
                              your actual image.
                            </p>
                          </div>
                        )}
                      {!isUsingDemo &&
                        uploadedImage &&
                        !isUploading &&
                        !uploadedImageUrl && (
                          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                            <p className="text-sm text-red-300">
                              ❌ Upload failed. Transformations will use demo image.
                            </p>
                          </div>
                        )}
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-800 rounded-lg p-4 aspect-square flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transformations */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">AI Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mainTransformations.map((option) => {
                        const Icon =
                          iconMap[option.icon as keyof typeof iconMap] || Sparkles;
                        const isSelected = selectedTransformations.includes(
                          option.id
                        );
                        return (
                          <div
                            key={option.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "border-gray-500 bg-gray-500/10"
                                : "border-gray-700 hover:border-gray-500/50"
                            }`}
                            onClick={() => toggleTransformation(option.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Icon className="w-5 h-5 text-gray-400" />
                                <span className="font-medium text-white">
                                  {option.name}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Action Button */}
                {selectedTransformations.length > 0 && (
                  <div className="text-center">
                    <Button
                      onClick={applyTransformations}
                      size="lg"
                      className="px-8 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                      disabled={isUploading}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isUploading ? "Uploading..." : "Apply AI Tools"} (
                      {selectedTransformations.length})
                    </Button>
                  </div>
                )}

                {/* Results */}
                {processedImageUrl && (
                  <div className="space-y-6">
                    <Card className="border-green-700 bg-green-900/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-4">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-white">
                          AI Transformation Complete!
                        </h3>
                        <p className="text-gray-300">
                          {isUsingDemo
                            ? "Demo image has been transformed"
                            : uploadedImageUrl
                            ? "Your uploaded image has been transformed"
                            : "Transformation demonstrated on sample image"}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-lg text-white">
                            Original
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-800 rounded p-4 aspect-square flex items-center justify-center">
                            <img
                              src={imagePreview}
                              alt="Original"
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-lg text-white flex items-center">
                            AI Transformed
                            <Badge className="ml-auto bg-gradient-to-r from-gray-600 to-gray-800">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {isUsingDemo
                                ? "Demo"
                                : uploadedImageUrl
                                ? "Your Image"
                                : "Sample"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-800 rounded p-4 aspect-square flex items-center justify-center relative">
                            {/* Loading spinner overlay */}
                            {isImageLoading && (
                              <div className="absolute inset-0 bg-black/80 rounded flex items-center justify-center z-10">
                                <div className="text-center space-y-3">
                                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                                  <div className="text-sm text-gray-300">
                                    <p className="font-medium">
                                      Processing transformation...
                                    </p>
                                    <p className="text-xs">
                                      This may take 10-60 seconds
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <img
                              src={processedImageUrl}
                              alt="Transformed"
                              className="max-w-full max-h-full object-contain rounded"
                              onLoad={() => {
                                setIsImageLoading(false);
                              }}
                              onError={(e) => {
                                console.error(
                                  "❌ Transformed image failed to load:",
                                  processedImageUrl
                                );
                                console.error("Error event:", e);
                                setIsImageLoading(false);
                                e.currentTarget.style.border = "2px solid red";
                                e.currentTarget.style.background =
                                  "rgba(255,0,0,0.1)";
                                e.currentTarget.alt =
                                  "Transformation failed to load";
                              }}
                            />
                          </div>

                          {/* Debug info */}
                          <div
                            className={`mt-3 p-2 rounded text-center ${
                              isImageLoading
                                ? "bg-yellow-900/20 border border-yellow-700"
                                : "bg-blue-900/20 border border-blue-700"
                            }`}
                          >
                            {isImageLoading ? (
                              <p className="text-xs text-yellow-300">
                                ⏳ ImageKit is processing your transformation...
                              </p>
                            ) : (
                              <p className="text-xs text-blue-300 font-mono break-all">
                                🔗 Transformation URL: {processedImageUrl}
                              </p>
                            )}
                          </div>

                          {!isUsingDemo && !uploadedImageUrl && (
                            <div className="mt-3 p-2 bg-amber-900/20 border border-amber-700 rounded text-center">
                              <p className="text-xs text-amber-300">
                                Demo result - upload failed, showing sample
                                transformation
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button onClick={downloadImage} size="lg" className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={reset} variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        New Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .bg-transparent-pattern {
          background-image: linear-gradient(
              45deg,
              hsl(var(--muted)) 25%,
              transparent 25%
            ),
            linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
            linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}
