import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { User } from "@/backend/database/models";
import {
  AuthenticatedRequest,
  RouteContext,
  withAuth,
} from "@/app/lib/auth-utils";

async function getHandler(
  request: AuthenticatedRequest,
  context?: RouteContext
) {
  try {
    await initializeMongoDb({});
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const user = await User.findById(id).select("image").lean();
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return NextResponse.json({ image: user.image });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
