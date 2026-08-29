import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// Serves select swagger-ui-dist static assets from node_modules so the bundle
// isn't vendored into the repo. Allowlisted by exact filename — no path traversal.
const ALLOWED: Record<string, string> = {
  "swagger-ui-bundle.js": "application/javascript",
};

export async function GET(_req: Request, ctx: RouteContext<"/swagger-static/[file]">) {
  const { file } = await ctx.params;
  const contentType = ALLOWED[file];
  if (!contentType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "node_modules", "swagger-ui-dist", file);
  const contents = await readFile(filePath);
  return new NextResponse(new Uint8Array(contents), {
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
