import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { TipPin } from "@/backend/database/models";
import { MapPin, ApiResponse } from "@/types/app";
import mongoose from "mongoose";

type TipPinDocument = mongoose.HydratedDocument<InstanceType<typeof TipPin>>;

function transformTipToMapPin(tip: TipPinDocument): MapPin {
  return {
    id: tip._id.toString(),
    authorId: tip.authorId.toString(),
    communityId: tip.communityId.toString(),
    type: tip.type,
    title: tip.title,
    description: tip.description,
    location: {
      point: tip.location.point,
      radius: tip.location.radius,
    },
    address: tip.address || '',
    picture: tip.picture,
    colour: tip.colour,
    startDate: tip.startDate?.toISOString(),
    duration: tip.duration,
    comments: (tip.comments || []).map((id: mongoose.Types.ObjectId) => id.toString()),
    likedBy: (tip.likedBy || []).map((id: mongoose.Types.ObjectId) => id.toString()),
    dislikedBy: (tip.dislikedBy || []).map((id: mongoose.Types.ObjectId) => id.toString()),
    createdAt: tip.createdAt.toISOString(),
    updatedAt: tip.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    await initializeMongoDb({});
    
    const pinTips = await TipPin.find({});
    
    const pins: MapPin[] = pinTips.map(transformTipToMapPin);
    
    const response: ApiResponse<MapPin[]> = {
      success: true,
      data: pins,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch map pins",
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

