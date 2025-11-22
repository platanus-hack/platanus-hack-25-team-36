import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { TipPin } from "@/backend/database/models";
import { MapPin, ApiResponse } from "@/types/app";
import mongoose from "mongoose";

type TipPinDocument = mongoose.HydratedDocument<InstanceType<typeof TipPin>>;

function transformTipToMapPin(tip: TipPinDocument): MapPin {
  return {
    id: tip._id?.toString() || '',
    authorId: tip.authorId?.toString() || '',
    communityId: tip.communityId?.toString() || '',
    type: tip.type,
    title: tip.title,
    description: tip.description,
    location: {
      point: tip.location?.point || { type: 'Point', coordinates: [0, 0] },
      radius: tip.location?.radius || 0,
    },
    address: tip.address || '',
    picture: tip.picture,
    colour: tip.colour,
    startDate: tip.startDate?.toISOString(),
    duration: tip.duration,
    contact: tip.contact || {},
    comments: (tip.comments || []).map((id: mongoose.Types.ObjectId) => id?.toString() || ''),
    likedBy: (tip.likedBy || []).map((id: mongoose.Types.ObjectId) => id?.toString() || ''),
    dislikedBy: (tip.dislikedBy || []).map((id: mongoose.Types.ObjectId) => id?.toString() || ''),
    createdAt: tip.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: tip.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    await initializeMongoDb({});
    
    const { searchParams } = new URL(request.url);
    const southwestParam = searchParams.get('southwest');
    const northeastParam = searchParams.get('northeast');
    
    let query: mongoose.FilterQuery<InstanceType<typeof TipPin>> = {};
    
    if (southwestParam && northeastParam) {
      const parseCoordinates = (coordString: string, paramName: string): [number, number] => {
        const trimmed = coordString.trim();
        const parts = trimmed.split(',').map(part => part.trim());
        
        if (parts.length !== 2) {
          throw new TypeError(`Invalid ${paramName} format. Expected format: longitude,latitude (got: "${coordString}")`);
        }
        
        const lng = Number.parseFloat(parts[0]);
        const lat = Number.parseFloat(parts[1]);
        
        if (Number.isNaN(lng) || Number.isNaN(lat)) {
          throw new TypeError(`Invalid ${paramName} format. Expected format: longitude,latitude (got: "${coordString}")`);
        }
        
        if (lng < -180 || lng > 180) {
          throw new TypeError(`Invalid longitude in ${paramName}. Must be between -180 and 180 (got: ${lng})`);
        }
        
        if (lat < -90 || lat > 90) {
          throw new TypeError(`Invalid latitude in ${paramName}. Must be between -90 and 90 (got: ${lat})`);
        }
        
        return [lng, lat];
      };
      
      try {
        const southwest = parseCoordinates(southwestParam, 'southwest');
        const northeast = parseCoordinates(northeastParam, 'northeast');
        
        if (southwest[0] >= northeast[0] || southwest[1] >= northeast[1]) {
          throw new TypeError('Invalid bounding box: southwest coordinates must be less than northeast coordinates');
        }
        
        query = {
          'location.point': {
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
          error: parseError instanceof Error ? parseError.message : 'Invalid bounding box parameters',
        };
        return NextResponse.json(response, { status: 400 });
      }
    }
    
    const pinTips = await TipPin.find(query);
    
    const pins: MapPin[] = pinTips
      .filter((tip) => tip != null)
      .map((tip) => {
        try {
          return transformTipToMapPin(tip);
        } catch (transformError) {
          throw new Error(`Failed to transform tip ${tip?._id}: ${transformError instanceof Error ? transformError.message : 'Unknown error'}`);
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
      error: error instanceof Error ? error.message : "Failed to fetch map pins",
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

