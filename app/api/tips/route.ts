import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Tip, TipPin, TipText, Community } from "@/backend/database/models";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (id) {
      const tip = await Tip.findById(id);
      if (!tip) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(tip);
    }

    const searchQuery = searchParams.get("search");
    const updatedAtParam = searchParams.get("updatedAt");
    const longitudeParam = searchParams.get("longitude");
    const latitudeParam = searchParams.get("latitude");

    if (searchQuery || updatedAtParam || (longitudeParam && latitudeParam )) {
      const updatedAt = updatedAtParam ? new Date(updatedAtParam) : undefined;
      
      let communityIds: string[] = [];
      
      if (longitudeParam && latitudeParam) {
        const longitude = Number.parseFloat(longitudeParam);
        const latitude = Number.parseFloat(latitudeParam);

        if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
          return NextResponse.json(
            { error: "Invalid location parameters. longitude, latitude, and radius must be numbers." },
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

        const intersectingCommunities = await Community.findIntersectingWithLocation(
          point
        );

        communityIds = intersectingCommunities.map((community) => community._id.toString());
      }

      const result = await Tip.searchTips({
        searchQuery: searchQuery || undefined,
        updatedAt,
        communityIds: communityIds.map((id) => new mongoose.Types.ObjectId(id)),
      });

      return NextResponse.json({
        pins: result.pins,
        nonPins: result.nonPins,
      });
    }
    
    const tips = await Tip.find().limit(100);
    return NextResponse.json(tips);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "Invalid type. Must be pin or text" }, { status: 400 });
    }
    
    return NextResponse.json(tip, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    
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

export async function DELETE(request: Request) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    
    await Tip.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

