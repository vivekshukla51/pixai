// @ts-nocheck
import { getUploadAuthParams } from "@imagekit/next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // Get request body to make each request unique
    const body = await request.text();
    
    // Generate authentication parameters using ImageKit SDK
    // Let ImageKit handle token generation and signature calculation
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      // Set expire to 30 minutes from now (1800 seconds)
      expire: Math.floor(Date.now() / 1000) + 1800,
      // Add unique fileName to ensure uniqueness without interfering with signature
      fileName: `upload_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Upload auth error:", error);
    return Response.json(
      { error: "Failed to generate upload authentication" },
      { status: 500 }
    );
  }
}

// Keep GET method for backward compatibility
export async function GET() {
  try {
    // Generate authentication parameters using ImageKit SDK
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      // Set expire to 30 minutes from now (1800 seconds)
      expire: Math.floor(Date.now() / 1000) + 1800,
      // Add unique fileName to ensure uniqueness
      fileName: `upload_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Upload auth error:", error);
    return Response.json(
      { error: "Failed to generate upload authentication" },
      { status: 500 }
    );
  }
}
