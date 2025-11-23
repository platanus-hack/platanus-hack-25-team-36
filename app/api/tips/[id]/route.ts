import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import {
  AuthenticatedRequest,
  withAuth,
  RouteContext,
} from "@/app/lib/auth-utils";
import { Tip } from "@/backend/database/models";

async function getHandler(
  request: AuthenticatedRequest,
  context?: RouteContext
) {
  try {
    await initializeMongoDb({});
    const params = await context?.params;
    const id = params?.id;
    const tip = await Tip.findById(id);
    if (!tip) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tip);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
