import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/owner", "/tenant"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const role = request.cookies.get("livo_role")?.value?.toUpperCase();
  const token = request.cookies.get("livo_token")?.value;

  if (!role && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/admin")
  ) {
    if (role && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (
    pathname.startsWith("/dashboard/owner") ||
    pathname.startsWith("/owner")
  ) {
    if (role && role !== "OWNER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (
    pathname.startsWith("/dashboard/tenant") ||
    pathname.startsWith("/tenant")
  ) {
    if (role && role !== "TENANT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/owner/:path*",
    "/tenant/:path*",
  ],
};
