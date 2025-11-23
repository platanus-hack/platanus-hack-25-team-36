import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Tip, TipPin, TipText, Community } from "@/backend/database/models";
import { MapPin, TextTip, MapPinType, PinSubtype } from "@/types/app";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";
import mongoose from "mongoose";

type TipPinDocument = mongoose.HydratedDocument<InstanceType<typeof TipPin>>;
type TipTextDocument = mongoose.HydratedDocument<InstanceType<typeof TipText>>;
type TipPinLean = Record<string, unknown>;
type TipTextLean = Record<string, unknown>;

function convertObjectId(id: unknown): string {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (
    id &&
    typeof id === "object" &&
    "toString" in id &&
    typeof id.toString === "function"
  ) {
    return id.toString();
  }
  if (id && typeof id === "object") {
    return JSON.stringify(id);
  }
  return "";
}

function convertDate(date: unknown): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === "string") return new Date(date).toISOString();
  return new Date().toISOString();
}

function transformTipToMapPin(tip: TipPinLean | TipPinDocument): MapPin {
  const tipObj: Record<string, unknown> =
    typeof (
      tip as TipPinDocument & { toObject?: () => Record<string, unknown> }
    ).toObject === "function"
      ? (
          tip as TipPinDocument & { toObject: () => Record<string, unknown> }
        ).toObject()
      : (tip as Record<string, unknown>);

  const location = tipObj.location as
    | {
        point?: { type: "Point"; coordinates: [number, number] };
        radius?: number;
      }
    | undefined;
  const comments = Array.isArray(tipObj.comments) ? tipObj.comments : [];
  const likedBy = Array.isArray(tipObj.likedBy) ? tipObj.likedBy : [];
  const dislikedBy = Array.isArray(tipObj.dislikedBy) ? tipObj.dislikedBy : [];
  const tags = Array.isArray(tipObj.tags)
    ? tipObj.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    id: convertObjectId(tipObj._id),
    authorId: convertObjectId(tipObj.authorId),
    communityId: convertObjectId(tipObj.communityId),
    type: (tipObj.type as MapPinType) || MapPinType.PIN,
    subtype: tipObj.subtype ? (tipObj.subtype as PinSubtype) : undefined,
    title: (tipObj.title as string) || "",
    description: (tipObj.description as string) || "",
    tags,
    background_image: tipObj.background_image as string | undefined,
    location: {
      point: location?.point || { type: "Point", coordinates: [0, 0] },
      radius: location?.radius || 0,
    },
    address: (tipObj.address as string) || "",
    picture: tipObj.picture as string | undefined,
    colour: tipObj.colour as string | undefined,
    icon: tipObj.icon as string | undefined,
    startDate: convertDate(tipObj.startDate),
    duration: tipObj.duration as number | undefined,
    contact:
      (tipObj.contact as {
        phone?: string;
        instagram?: string;
        tiktok?: string;
        facebook?: string;
      }) || {},
    comments: comments.map(convertObjectId),
    likedBy: likedBy.map(convertObjectId),
    dislikedBy: dislikedBy.map(convertObjectId),
    createdAt: convertDate(tipObj.createdAt),
    updatedAt: convertDate(tipObj.updatedAt),
  };
}

function transformTipToTipText(tip: TipTextLean | TipTextDocument): TextTip {
  const tipObj: Record<string, unknown> =
    typeof (
      tip as TipTextDocument & { toObject?: () => Record<string, unknown> }
    ).toObject === "function"
      ? (
          tip as TipTextDocument & { toObject: () => Record<string, unknown> }
        ).toObject()
      : (tip as Record<string, unknown>);

  const comments = Array.isArray(tipObj.comments) ? tipObj.comments : [];
  const likedBy = Array.isArray(tipObj.likedBy) ? tipObj.likedBy : [];
  const dislikedBy = Array.isArray(tipObj.dislikedBy) ? tipObj.dislikedBy : [];
  const tags = Array.isArray(tipObj.tags)
    ? tipObj.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    id: convertObjectId(tipObj._id),
    authorId: convertObjectId(tipObj.authorId),
    communityId: convertObjectId(tipObj.communityId),
    type: "text" as const,
    title: (tipObj.title as string) || "",
    description: (tipObj.description as string) || "",
    tags,
    background_image: tipObj.background_image as string | undefined,
    comments: comments.map(convertObjectId),
    likedBy: likedBy.map(convertObjectId),
    dislikedBy: dislikedBy.map(convertObjectId),
    createdAt: convertDate(tipObj.createdAt),
    updatedAt: convertDate(tipObj.updatedAt),
  };
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const tip = await Tip.findById(id);
      if (!tip)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(tip);
    }

    const searchQuery = searchParams.get("search");
    const updatedAtParam = searchParams.get("updatedAt");
    const longitudeParam = searchParams.get("longitude");
    const latitudeParam = searchParams.get("latitude");

    const hasSearchQuery = searchQuery !== null && searchQuery.trim() !== "";
    const hasUpdatedAt = updatedAtParam !== null;
    const hasLocation = longitudeParam !== null && latitudeParam !== null;

    if (hasSearchQuery || hasUpdatedAt || hasLocation) {
      const updatedAt = updatedAtParam ? new Date(updatedAtParam) : undefined;

      let communityIds: string[] = [];

      if (longitudeParam && latitudeParam) {
        const longitude = Number.parseFloat(longitudeParam);
        const latitude = Number.parseFloat(latitudeParam);

        if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
          return NextResponse.json(
            {
              error:
                "Invalid location parameters. longitude, latitude, and radius must be numbers.",
            },
            { status: 400 }
          );
        }

        if (longitude < -180 || longitude > 180) {
          return NextResponse.json(
            { error: "Invalid longitude. Must be between -180 and 180." },
            { status: 400 }
          );
        }

        if (latitude < -90 || latitude > 90) {
          return NextResponse.json(
            { error: "Invalid latitude. Must be between -90 and 90." },
            { status: 400 }
          );
        }

        const point = {
          type: "Point" as const,
          coordinates: [longitude, latitude] as [number, number],
        };

        const intersectingCommunities =
          await Community.findIntersectingWithLocation(point);

        communityIds = intersectingCommunities.map((community) =>
          community._id.toString()
        );
      }

      const trimmedSearchQuery = hasSearchQuery ? searchQuery.trim() : undefined;
      
      const result = await Tip.searchTips({
        searchQuery: trimmedSearchQuery,
        updatedAt,
        communityIds: communityIds.map((id) => new mongoose.Types.ObjectId(id)),
      });

      const pins: MapPin[] = result.pins.map((pin) =>
        transformTipToMapPin(pin)
      );
      const nonPins: TextTip[] = result.nonPins.map((nonPin) =>
        transformTipToTipText(nonPin)
      );

      return NextResponse.json({
        pins,
        nonPins,
      });
    }

    // Default: return all tips without filters
    const tips = (await Tip.find().limit(100).lean()) as unknown as (
      | TipPinLean
      | TipTextLean
    )[];
    const pins: MapPin[] = [];
    const nonPins: TextTip[] = [];

    for (const tip of tips) {
      if (tip.type === "pin") {
        pins.push(transformTipToMapPin(tip as TipPinLean));
      } else {
        nonPins.push(transformTipToTipText(tip as TipTextLean));
      }
    }

    return NextResponse.json({
      pins,
      nonPins,
    });
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
    const { type } = body;

    let tip;
    if (type === "pin") {
      // @ts-expect-error - TypeScript union type issue with mongoose create()
      tip = await TipPin.create(body);
    } else if (type === "text") {
      // @ts-expect-error - TypeScript union type issue with mongoose create()
      tip = await TipText.create(body);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be pin or text" },
        { status: 400 }
      );
    }

    return NextResponse.json(tip, { status: 201 });
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
    const tip = await Tip.findByIdAndUpdate(id, body, { new: true });
    if (!tip) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tip);
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

    await Tip.findByIdAndDelete(id);
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
