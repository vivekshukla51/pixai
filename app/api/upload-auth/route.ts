// @ts-nocheck
import { getUploadAuthParams } from "@imagekit/next/server";
import crypto from "crypto";

export async function GET() {
  try {
    // Generate a unique token manually to prevent reuse
    const uniqueToken = crypto.randomUUID();
    
    // Generate authentication parameters using ImageKit SDK
    const { expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      // Set expire to 30 minutes from now (1800 seconds)
      expire: Math.floor(Date.now() / 1000) + 1800,
      // Use our custom unique token
      token: uniqueToken,
    });

    return Response.json({
      token: uniqueToken,
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
