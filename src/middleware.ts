import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Skip auth for the login page and API routes
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("fo_auth");
  if (authCookie?.value !== "authenticated") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"],
};
