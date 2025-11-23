import { NextResponse } from "next/server";
import { initializeMongoDb } from "@/backend/database/connection";
import { Message, User } from "@/backend/database/models";
import { AuthenticatedRequest, withAuth } from "@/app/lib/auth-utils";

async function getHandler(request: AuthenticatedRequest) {
  try {
    await initializeMongoDb({});
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const message = await Message.findById(id).populate({
        path: "authorId",
        select: "name image",
        model: User,
      });
      if (!message)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      
      const messageObj = message.toObject();
      if (messageObj.authorId && typeof messageObj.authorId === "object") {
        messageObj.authorId = {
          _id: messageObj.authorId._id.toString(),
          name: messageObj.authorId.name,
          image: messageObj.authorId.image,
        };
      }
      
      return NextResponse.json(messageObj);
    }

    const messages = await Message.find().limit(100).populate({
      path: "authorId",
      select: "name image",
      model: User,
    });
    
    const formattedMessages = messages.map((msg) => {
      const msgObj = msg.toObject();
      if (msgObj.authorId && typeof msgObj.authorId === "object") {
        msgObj.authorId = {
          _id: msgObj.authorId._id.toString(),
          name: msgObj.authorId.name,
          image: msgObj.authorId.image,
        };
      }
      return msgObj;
    });

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("[GET /api/messages] Error:", error);
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
    const message = await Message.create(body);
    return NextResponse.json(message, { status: 201 });
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
    const message = await Message.findByIdAndUpdate(id, body, { new: true });
    if (!message)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(message);
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

    await Message.findByIdAndDelete(id);
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
