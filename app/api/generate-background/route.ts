import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/generate-background
 * Generates a 1024x1024 background image from a description
 * Note: DALL-E 2 max size is 1024x1024. For 3000x1000, consider using DALL-E 3 or external upscaling.
 */
async function postHandler(request: AuthenticatedRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { description } = body;

    // Validate description
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Valid description is required" },
        { status: 400 }
      );
    }

    console.log("Generating background image (1024x1024):", { description });

    // Generate wide background image using DALL-E 2 at maximum resolution
    const result = await openai.images.generate({
      model: "dall-e-2",
      prompt: `Wide panoramic landscape background: ${description.trim()}. Ultra wide aspect ratio, scenic vista`,
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
    });

    if (!result.data || !result.data[0]?.b64_json) {
      throw new Error("No image data received from OpenAI");
    }

    console.log("Background image generated successfully");

    return NextResponse.json(
      {
        success: true,
        data: {
          b64_json: result.data[0].b64_json,
          size: "1024x1024",
          type: "background",
          description: "Generated at max DALL-E 2 resolution",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Background image generation error:", error);

    // Handle OpenAI specific errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
          code: error.code,
        },
        { status: error.status || 500 }
      );
    }

    // Handle generic errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate background image: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);
