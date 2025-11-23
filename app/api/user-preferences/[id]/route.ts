import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { UserPreferences } from "@/backend/database/models";
import { withAuth } from "@/app/lib/auth-utils";

async function getHandler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMongoDb({});
    const { id } = await params;
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

async function putHandler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMongoDb({});
    const { id } = await params;
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

async function deleteHandler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMongoDb({});
    const { id } = await params;
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
