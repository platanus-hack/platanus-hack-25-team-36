import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Community } from "@/backend/database/models";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";

/**
 * Transform MongoDB community document to frontend format
 * Maps _id to id and name to title for frontend compatibility
 */
function transformCommunity(community: any) {
  return {
    id: community._id.toString(),
    title: community.name,
    description: community.description,
    locationId: community.location?._id?.toString() || "",
    memberIds: community.members?.map((m: any) => m.toString()) || [],
    pinIds: [], // Not stored in current schema
    tags: community.tags || [],
    createdAt: community.createdAt?.toISOString() || new Date().toISOString(),
  };
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const community = await Community.findById(id);
      if (!community)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(community);
    }

    const longitudeParam = searchParams.get("longitude");
    const latitudeParam = searchParams.get("latitude");

    if (longitudeParam && latitudeParam) {
      const longitude = Number.parseFloat(longitudeParam);
      const latitude = Number.parseFloat(latitudeParam);

      if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
        return NextResponse.json(
          { error: "Invalid longitude or latitude" },
          { status: 400 }
        );
      }

      const communities = await Community.findIntersectingWithLocation({
        type: "Point",
        coordinates: [longitude, latitude],
      });
      return NextResponse.json(communities.map(transformCommunity));
    }

    const communities = await Community.find().limit(100);
    return NextResponse.json(communities.map(transformCommunity));
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
    const body = await request.json();
    const community = await Community.create(body);
    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}

async function putHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await request.json();
    const community = await Community.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!community)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(community);
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    await Community.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
