import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Message } from "@/backend/database/models";

export async function GET(request: Request) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (id) {
      const message = await Message.findById(id);
      if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(message);
    }
    
    const messages = await Message.find().limit(100);
    return NextResponse.json(messages);
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
    const message = await Message.create(body);
    return NextResponse.json(message, { status: 201 });
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
    const message = await Message.findByIdAndUpdate(id, body, { new: true });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(message);
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
    
    await Message.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

