import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { UserPreferences } from "@/backend/database/models";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";

async function getHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const id = request.user?.id;
    const userPreference = await UserPreferences.findById(id);
    if (!userPreference)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(userPreference);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

async function putHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const id = request.user?.id;
    const body = await request.json();
    const userPreference = await UserPreferences.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!userPreference)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(userPreference);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}

async function deleteHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const id = request.user?.id;
    await UserPreferences.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
