import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Community } from "@/backend/database/models";

export async function GET(request: Request) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (id) {
      const community = await Community.findById(id);
      if (!community) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(community);
    }
    
    const communities = await Community.find().limit(100);
    return NextResponse.json(communities);
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
    const community = await Community.create(body);
    return NextResponse.json(community, { status: 201 });
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
    const community = await Community.findByIdAndUpdate(id, body, { new: true });
    if (!community) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(community);
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
    
    await Community.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

