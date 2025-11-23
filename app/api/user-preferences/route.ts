import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { UserPreferences } from "@/backend/database/models";
import { withAuth } from "@/app/lib/auth-utils";

async function getHandler(request: Request) {
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

async function postHandler(request: Request) {
  try {
    await initializeMongoDb({});
    const body = await request.json();
    const userPreferences = await UserPreferences.create(body);
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
