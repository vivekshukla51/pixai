// @ts-nocheck
import { getUploadAuthParams } from "@imagekit/next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // Get request body to make each request unique
    const body = await request.text();
    
    // Generate a unique token with request-specific data
    const uniqueToken = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Generate authentication parameters using ImageKit SDK
    const { expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      // Set expire to 30 minutes from now (1800 seconds)
      expire: Math.floor(timestamp / 1000) + 1800,
      // Use our custom unique token with additional entropy
      token: `${uniqueToken}_${timestamp}_${crypto.randomBytes(8).toString('hex')}`,
    });

    return Response.json({
      token: `${uniqueToken}_${timestamp}_${crypto.randomBytes(8).toString('hex')}`,
      expire: Math.floor(timestamp / 1000) + 1800,
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

// Keep GET method for backward compatibility but make it unique too
export async function GET() {
  try {
    // Generate a unique token with timestamp and random data
    const uniqueToken = crypto.randomUUID();
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    
    // Generate authentication parameters using ImageKit SDK
    const { expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      // Set expire to 30 minutes from now (1800 seconds)
      expire: Math.floor(timestamp / 1000) + 1800,
      // Use our custom unique token with maximum entropy
      token: `${uniqueToken}_${timestamp}_${randomBytes}`,
    });

    return Response.json({
      token: `${uniqueToken}_${timestamp}_${randomBytes}`,
      expire: Math.floor(timestamp / 1000) + 1800,
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
