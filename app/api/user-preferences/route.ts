import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { UserPreferences } from "@/backend/database/models";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";

async function getHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const userPreferences = await UserPreferences.find().limit(100);
    return NextResponse.json(userPreferences);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const userId = request.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Use user ID as the document _id to associate preferences with user
    const userPreferences = await UserPreferences.findByIdAndUpdate(
      userId,
      { ...body, _id: userId },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(userPreferences, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
