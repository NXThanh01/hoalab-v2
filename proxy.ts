import { NextResponse, type NextRequest } from "next/server";
import { authJson, sameOrigin } from "@/backend/modules/auth/auth-http";

export function proxy(request: NextRequest) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !sameOrigin(request)) {
    return authJson({ error: "Yêu cầu không hợp lệ." }, 403);
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
