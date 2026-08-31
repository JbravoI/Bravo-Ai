// Next.js 16 renamed the `middleware` file convention to `proxy` (same
// mechanism, new name/export) — see node_modules/next/dist/docs/.../proxy.md.
// Do not reintroduce a middleware.ts; it's deprecated in this Next.js version.
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Gates the UI pages behind login. Deliberately does NOT cover /api/** —
// Epic 02 built the API as an independently-testable public surface
// (Swagger's "Try it out" included); gating it here would be a regression.
// See docs/decisions/0006-authjs-credentials-not-oauth.md.
export default auth((req) => {
  if (req.nextUrl.pathname === "/") return NextResponse.next();
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api|login|signup|forgot-password|reset-password|_next/static|_next/image|favicon.ico).*)"],
};
