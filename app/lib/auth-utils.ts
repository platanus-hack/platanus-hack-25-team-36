import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

export interface RouteContext {
  params?: Record<string, string>;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: Session["user"];
  session?: Session;
}

/**
 * Higher-order function to protect API routes with authentication
 */
export function withAuth(
  handler: (
    request: AuthenticatedRequest,
    context?: RouteContext
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: RouteContext) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to access this resource." },
        { status: 401 }
      );
    }

    // Add user info to request for use in handlers
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = session.user;
    authenticatedRequest.session = session;

    return handler(authenticatedRequest, context);
  };
}

/**
 * Get authenticated user session
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return {
    user: session.user,
    session,
  };
}

/**
 * Check if user is authenticated and return session or throw error
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to access this resource." },
      { status: 401 }
    );
  }

  return { session, user: session.user };
}
