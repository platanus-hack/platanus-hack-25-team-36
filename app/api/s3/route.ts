import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3ClientConfig } from "@aws-sdk/client-s3/dist-types/S3Client";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";

// --- Configuration ---
// IMPORTANT: Use environment variables for all sensitive data.
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

// Determine if we have environment credentials
const hasCredentials =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

// Configure the client
const clientConfig: S3ClientConfig = {
  region: REGION,
  // If no environment credentials are found, provide dummy values to stop the SDK's
  // default credential provider chain from failing. This effectively allows the client
  // to proceed with anonymous access, which works for public reads.
  credentials: hasCredentials
    ? undefined
    : {
        accessKeyId: "ANONYMOUS_ACCESS_KEY_ID",
        secretAccessKey: "ANONYMOUS_SECRET_ACCESS_KEY",
      },
};

// Initialize the S3 client
const s3Client = new S3Client(clientConfig);

/**
 * Handles GET requests to retrieve PNG icons from S3.
 * Example URL: /api/s3?key=restaurant.png (will look in icons/ folder)
 * Example URL: /api/s3?key=icons/restaurant.png (explicit path)
 *
 * @param request The incoming Next.js request object.
 */
async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Missing 'key' parameter" },
        { status: 400 }
      );
    }

    // Determine the S3 key:
    // - For pins (pins/image/*, pins/background_image/*): use key as-is
    // - For icons without folder: prepend 'icons/' for backwards compatibility
    const s3Key =
      key.startsWith("pins/") || key.includes("/") ? key : `icons/${key}`;

    // Command to get the PNG image from S3
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    try {
      // Try to get the actual object data for PNG images
      const response = await s3Client.send(getCommand);

      if (response.Body) {
        // Convert the stream to a buffer
        const chunks: Uint8Array[] = [];
        const reader = response.Body.transformToWebStream().getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const buffer = new Uint8Array(
          chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        );
        let offset = 0;
        for (const chunk of chunks) {
          buffer.set(chunk, offset);
          offset += chunk.length;
        }

        // Return the PNG image with proper headers
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": response.ContentType || "image/png",
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
            "Content-Length": buffer.length.toString(),
          },
        });
      }
    } catch (directAccessError) {
      console.log(
        "Direct access failed, falling back to signed URL:",
        directAccessError
      );

      // Fallback: Generate a signed URL if direct access fails
      const signedUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 3600,
      });

      return NextResponse.json(
        {
          key: s3Key,
          signedUrl,
          source: "signed-url",
          message: "Direct access failed, returning signed URL",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "No data received from S3" },
      { status: 404 }
    );
  } catch (error) {
    console.error("S3 GET Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to retrieve PNG icon from S3",
        details: errorMessage,
        suggestion: "Check if the icon exists in s3://pasaeldato-s3/icons/",
      },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to upload data to S3.
 * Expects a JSON body with { key: string, data: string (the content) }.
 *
 * NOTE: This function requires valid AWS credentials to be set in the environment,
 * as uploads (PutObjectCommand) are privileged operations.
 *
 * @param request The incoming Next.js request object.
 */
async function postHandler(request: AuthenticatedRequest) {
  try {
    // SECURITY CHECK: Ensure credentials are present before attempting upload.
    if (!hasCredentials) {
      return NextResponse.json(
        {
          error:
            "Upload failed. AWS credentials (ID and Key) are required for POST operations.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, imageBase64 } = body;

    if (!filename || !imageBase64) {
      return NextResponse.json(
        { error: "Missing 'filename' or 'imageBase64' in request body" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Determine content type from base64 string
    const contentTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : "image/png";

    // Create the S3 key (path in bucket)
    // If filename already contains a folder path, use it as-is
    // Otherwise, default to pins folder
    const s3Key = filename.includes("/") ? filename : `pins/${filename}`;

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      // ACL: "public-read", // REMOVED: This bucket does not support ACLs due to Object Ownership configuration.
    });

    const response = await s3Client.send(putCommand);

    return NextResponse.json(
      {
        message: `Successfully uploaded ${filename} to S3`,
        s3Key,
        eTag: response.ETag,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("S3 POST Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload object to S3", details: errorMessage },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
