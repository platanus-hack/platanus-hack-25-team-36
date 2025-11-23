import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { TipPin } from "@/backend/database/models";
import { MapPin, ApiResponse, MapPinType, PinSubtype } from "@/types/app";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import mongoose from "mongoose";

type TipPinDocument = mongoose.HydratedDocument<InstanceType<typeof TipPin>>;
type TipPinLean = Record<string, unknown>;

function transformTipToMapPin(tip: TipPinLean | TipPinDocument): MapPin {
  const tipObj: Record<string, unknown> =
    typeof (
      tip as TipPinDocument & { toObject?: () => Record<string, unknown> }
    ).toObject === "function"
      ? (
          tip as TipPinDocument & { toObject: () => Record<string, unknown> }
        ).toObject()
      : (tip as Record<string, unknown>);

  const convertObjectId = (id: unknown): string => {
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
  };

  const convertDate = (date: unknown): string | undefined => {
    if (!date) return undefined;
    if (date instanceof Date) return date.toISOString();
    if (typeof date === "string") return new Date(date).toISOString();
    return undefined;
  };

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
    startDate: convertDate(tipObj.startDate),
    duration: tipObj.duration as number | undefined,
    contact: tipObj.contact || {},
    comments: comments.map(convertObjectId),
    likedBy: likedBy.map(convertObjectId),
    dislikedBy: dislikedBy.map(convertObjectId),
    createdAt: convertDate(tipObj.createdAt) || new Date().toISOString(),
    updatedAt: convertDate(tipObj.updatedAt) || new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to access this resource." },
      { status: 401 }
    );
  }

  try {
    await initializeMongoDb({});

    const { searchParams } = new URL(request.url);
    const southwestParam = searchParams.get("southwest");
    const northeastParam = searchParams.get("northeast");

    let query: mongoose.FilterQuery<InstanceType<typeof TipPin>> = {};

    if (southwestParam && northeastParam) {
      const parseCoordinates = (
        coordString: string,
        paramName: string
      ): [number, number] => {
        const trimmed = coordString.trim();
        const parts = trimmed.split(",").map((part) => part.trim());

        if (parts.length !== 2) {
          throw new TypeError(
            `Invalid ${paramName} format. Expected format: longitude,latitude (got: "${coordString}")`
          );
        }

        const lng = Number.parseFloat(parts[0]);
        const lat = Number.parseFloat(parts[1]);

        if (Number.isNaN(lng) || Number.isNaN(lat)) {
          throw new TypeError(
            `Invalid ${paramName} format. Expected format: longitude,latitude (got: "${coordString}")`
          );
        }

        if (lng < -180 || lng > 180) {
          throw new TypeError(
            `Invalid longitude in ${paramName}. Must be between -180 and 180 (got: ${lng})`
          );
        }

        if (lat < -90 || lat > 90) {
          throw new TypeError(
            `Invalid latitude in ${paramName}. Must be between -90 and 90 (got: ${lat})`
          );
        }

        return [lng, lat];
      };

      try {
        const southwest = parseCoordinates(southwestParam, "southwest");
        const northeast = parseCoordinates(northeastParam, "northeast");

        if (southwest[0] >= northeast[0] || southwest[1] >= northeast[1]) {
          throw new TypeError(
            "Invalid bounding box: southwest coordinates must be less than northeast coordinates"
          );
        }

        query = {
          "location.point": {
            $geoWithin: {
              $box: [
                southwest, // [minLng, minLat]
                northeast, // [maxLng, maxLat]
              ],
            },
          },
        };
      } catch (parseError) {
        const response: ApiResponse = {
          success: false,
          error:
            parseError instanceof Error
              ? parseError.message
              : "Invalid bounding box parameters",
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // @ts-expect-error - TypeScript union type issue with mongoose lean()
    const pinTips = (await TipPin.find(
      query
    ).lean()) as unknown as TipPinLean[];

    const pins: MapPin[] = pinTips
      .filter((tip) => tip != null)
      .map((tip) => {
        try {
          const transformedTip = transformTipToMapPin(tip);
          return transformedTip;
        } catch (transformError) {
          throw new Error(
            `Failed to transform tip ${tip?._id}: ${
              transformError instanceof Error
                ? transformError.message
                : "Unknown error"
            }`
          );
        }
      });

    const response: ApiResponse<MapPin[]> = {
      success: true,
      data: pins,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch map pins",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
