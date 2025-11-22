import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3ClientConfig } from "@aws-sdk/client-s3/dist-types/S3Client";

// --- Configuration ---
// IMPORTANT: Use environment variables for all sensitive data.
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

// Determine if we have environment credentials
const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

// Configure the client
const clientConfig: S3ClientConfig = {
  region: REGION,
  // If no environment credentials are found, provide dummy values to stop the SDK's 
  // default credential provider chain from failing. This effectively allows the client
  // to proceed with anonymous access, which works for public reads.
  credentials: hasCredentials ? undefined : {
    accessKeyId: "ANONYMOUS_ACCESS_KEY_ID",
    secretAccessKey: "ANONYMOUS_SECRET_ACCESS_KEY",
  }
};

// Initialize the S3 client
const s3Client = new S3Client(clientConfig);

/**
 * Handles GET requests to retrieve data or a signed URL for an object.
 * Example URL: /api/s3-data-route?key=my-file.txt
 *
 * @param request The incoming Next.js request object.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing 'key' parameter" }, { status: 400 });
    }

    // Command to get the object metadata or content.
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // We proceed to generate a signed URL. Since the bucket is public, 
    // the anonymous client can successfully execute this command for public objects.
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 }); // URL expires in 1 hour

    return NextResponse.json({ key, signedUrl, source: "signed-url" }, { status: 200 });

  } catch (error) {
    console.error("S3 GET Error:", error);
    // Be more specific if the error is due to a policy denial (which would happen
    // if the object is NOT public, even with anonymous access).
    return NextResponse.json({ error: "Failed to retrieve object from S3. Check bucket policy and key.", details: error.message }, { status: 500 });
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
export async function POST(request: Request) {
  try {
    // SECURITY CHECK: Ensure credentials are present before attempting upload.
    if (!hasCredentials) {
        return NextResponse.json({ error: "Upload failed. AWS credentials (ID and Key) are required for POST operations." }, { status: 401 });
    }

    const { key, data } = await request.json();

    if (!key || !data) {
      return NextResponse.json({ error: "Missing 'key' or 'data' in request body" }, { status: 400 });
    }
    
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key, // The file path/name in the bucket
      Body: data, // The content to upload
      ContentType: "text/plain", // Set the correct MIME type
      // ACL: "public-read", // REMOVED: This bucket does not support ACLs due to Object Ownership configuration.
    });

    const response = await s3Client.send(putCommand);

    return NextResponse.json({ 
        message: `Successfully uploaded ${key} to S3`, 
        eTag: response.ETag 
    }, { status: 201 });

  } catch (error) {
    console.error("S3 POST Error:", error);
    return NextResponse.json({ error: "Failed to upload object to S3", details: error.message }, { status: 500 });
  }
}