import { NextResponse } from "next/server";
import { createDocument } from "@/backend/database/createDocument";
import { updateDocument } from "@/backend/database/updateDocument";
import { getDocument } from "@/backend/database/getDocument";
import { logging } from "@/backend/logging";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier");
    
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "identifier query parameter is required" },
        { status: 400 }
      );
    }
    
    const document = await getDocument(identifier, "users");
    
    return NextResponse.json(
      { 
        success: true, 
        document 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get document" 
      },
      { status: 404 }
    );
  }
}

export async function POST() {
  try {
    const randomNumber = Math.floor(Math.random() * 10000);
    const identifier = `user-${randomNumber}`;

    logging.info(`Creating and updating document with identifier: ${identifier}`);
    
    const document = { 
      identifier,
      message: "test" 
    };
    
    const createResult = await createDocument(document, "users");
    const updateResult = await updateDocument(
      "users",
      identifier,
      {},
      { ...document, message: "updated message" },
      false
    );
    
    return NextResponse.json(
      { 
        success: true, 
        createResult,
        updateResult,
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create document" 
      },
      { status: 500 }
    );
  }
}
