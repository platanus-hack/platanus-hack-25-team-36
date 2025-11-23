import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Community } from "@/backend/database/models";
import { AuthenticatedRequest, withAuth, RouteContext } from "@/app/lib/auth-utils";

/**
 * POST /api/communities/[id]/join
 * Adds the current user to the community's members array
 */
async function postHandler(
  request: AuthenticatedRequest,
  context?: RouteContext
) {
  try {
    await initializeMongoDb({});

    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const params = await context?.params;
    const communityId = params?.id;
    if (!communityId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Add user to community members array (using $addToSet to avoid duplicates)
    const community = await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!community) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      community: {
        id: community._id.toString(),
        memberCount: community.members?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communities/[id]/join
 * Removes the current user from the community's members array
 */
async function deleteHandler(
  request: AuthenticatedRequest,
  context?: RouteContext
) {
  try {
    await initializeMongoDb({});

    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const params = await context?.params;
    const communityId = params?.id;
    if (!communityId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Remove user from community members array
    const community = await Community.findByIdAndUpdate(
      communityId,
      { $pull: { members: userId } },
      { new: true }
    );

    if (!community) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      community: {
        id: community._id.toString(),
        memberCount: community.members?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);
export const DELETE = withAuth(deleteHandler);
