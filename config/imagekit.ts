export const imagekitConfig = {
  urlEndpoint: "https://ik.imagekit.io/f6hvmvq5b",
  publicKey: "public_Bev5BZyoDzsi/+JiERvJe7DHnVc=",
  // Note: Private key should be used server-side only
};

export const transformations = {
  backgroundRemoval: {
    standard: "e-removedotbg", // 130 units
    efficient: "e-bgremove", // 10 units
  },
  enhance: {
    retouch: "e-retouch", // 5 units
    upscale: "e-upscale", // 5 units
  },
  effects: {
    dropShadow: "e-dropshadow", // 1 unit
    generateVar: "e-genvar", // 25 units
  },
  smart: {
    faceCrop: "fo-face", // Free
    smartCrop: "fo-auto", // Free
  },
};

export const transformationOptions = [
  {
    id: "bg-removal",
    name: "Background Removal",
    description: "Remove background instantly with AI",
    icon: "eraser",
    transformation: "e-bgremove",
    cost: 10,
    category: "background",
  },
  {
    id: "bg-removal-premium",
    name: "Premium Background Removal",
    description: "Higher quality background removal",
    icon: "scissors",
    transformation: "e-removedotbg",
    cost: 130,
    category: "background",
  },
  {
    id: "bg-remove-shadow",
    name: "Remove Background + Drop Shadow",
    description: "Remove background and add realistic shadow",
    icon: "shadow",
    transformation: "e-bgremove:e-dropshadow",
    cost: 11,
    category: "effects",
  },
  {
    id: "smart-crop",
    name: "Smart Crop Square",
    description: "Auto-crop to 400x400 square",
    icon: "crop",
    transformation: "w-400,h-400,fo-auto",
    cost: 0,
    category: "smart",
  },
  {
    id: "face-crop",
    name: "Face Crop Square",
    description: "Crop to face 300x300",
    icon: "user",
    transformation: "w-300,h-300,fo-face",
    cost: 0,
    category: "smart",
  },
  {
    id: "resize-optimize",
    name: "Optimize & Resize",
    description: "Resize to 800px width with quality optimization",
    icon: "zoom-in",
    transformation: "w-800,q-80,f-auto",
    cost: 0,
    category: "optimize",
  },
  {
    id: "enhance-basic",
    name: "Enhance Quality",
    description: "Basic image enhancement",
    icon: "sparkles",
    transformation: "e-sharpen,e-contrast",
    cost: 0,
    category: "enhance",
  },
];

// Working demo images for testing transformations
export const demoImages = [
  {
    url: "https://ik.imagekit.io/demo/img/image4.jpeg",
    name: "Person with background",
  },
  {
    url: "https://ik.imagekit.io/demo/img/image1.jpeg",
    name: "Portrait",
  },
  {
    url: "https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg",
    name: "Cafe scene",
  },
  {
    url: "https://ik.imagekit.io/demo/img/image10.jpeg",
    name: "Group photo",
  },
  {
    url: "https://ik.imagekit.io/demo/img/image2.jpeg",
    name: "Outdoor scene",
  },
];

// Helper function to build transformation URL
export const buildTransformationUrl = (
  imageUrl: string,
  transformations: string[]
) => {
  if (!imageUrl || transformations.length === 0) return imageUrl;

  console.log("Building transformation for URL:", imageUrl);
  console.log("Transformations to apply:", transformations);

  // Build transformation string
  const transformationStr = transformations.join(",");

  // Check if it's a demo image or user-uploaded image
  if (imageUrl.includes("/demo/")) {
    // Handle demo images
    const urlParts = imageUrl.split("/");
    const demoIndex = urlParts.findIndex((part) => part === "demo");

    if (demoIndex === -1) {
      console.error("Invalid demo image URL:", imageUrl);
      return imageUrl;
    }

    // Get the path after /demo/
    const imagePath = urlParts.slice(demoIndex + 1).join("/");

    // Construct the transformed URL for demo images
    const transformedUrl = `https://ik.imagekit.io/demo/tr:${transformationStr}/${imagePath}`;

    console.log("Demo transformed URL:", transformedUrl);
    return transformedUrl;
  } else {
    // Handle user-uploaded images from your ImageKit account
    try {
      const url = new URL(imageUrl);
      const pathname = url.pathname;

      // Extract the file path (remove leading slash)
      let filePath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

      // For ImageKit transformations, we need to extract just the filename
      // URLs are like: https://ik.imagekit.io/f6hvmvq5b/filename.jpg
      // So pathname is: /f6hvmvq5b/filename.jpg
      // We need to extract just: filename.jpg
      const accountId = "f6hvmvq5b";
      if (filePath.startsWith(accountId + "/")) {
        filePath = filePath.substring(accountId.length + 1);
      }

      // For ImageKit transformations, the correct format is: 
      // https://ik.imagekit.io/f6hvmvq5b/tr:transformation/filename
      const transformedUrl = `${imagekitConfig.urlEndpoint}/tr:${transformationStr}/${filePath}`;

      console.log("User image transformed URL:", transformedUrl);
      return transformedUrl;
    } catch (error) {
      console.error("Error parsing image URL:", error);
      return imageUrl;
    }
  }
};
