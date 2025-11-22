import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Tip, TipPin, TipText } from "@/backend/database/models";

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
      tip = await TipPin.create(body);
    } else if (type === "text") {
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

