// @ts-nocheck
import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  try {
    // Generate authentication parameters using ImageKit SDK
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      // Set expire to 30 minutes from now (1800 seconds)
      expire: Math.floor(Date.now() / 1000) + 1800,
      // Add unique identifier to prevent token reuse
      fileName: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Upload auth error:", error);
    return Response.json(
      { error: "Failed to generate upload authentication" },
      { status: 500 }
    );
  }
}
