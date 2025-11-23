import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/generate-profile
 * Generates a 256x256 profile image from a description (DALL-E 2 native size)
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

    console.log("Generating profile image (256x256):", { description });

    // Generate profile image using DALL-E 2 at 256x256 (perfect for profiles)
    const result = await openai.images.generate({
      model: "dall-e-2",
      prompt: `Profile picture, centered portrait, face-focused: ${description.trim()}. Professional headshot style`,
      size: "256x256",
      n: 1,
      response_format: "b64_json",
    });

    if (!result.data || !result.data[0]?.b64_json) {
      throw new Error("No image data received from OpenAI");
    }

    console.log("Profile image generated successfully");

    return NextResponse.json(
      {
        success: true,
        data: {
          b64_json: result.data[0].b64_json,
          size: "256x256",
          type: "profile",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile image generation error:", error);

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
      { error: `Failed to generate profile image: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);
