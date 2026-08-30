import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { USER_ROLES, updateManagedUser } from "@/lib/users";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" && USER_ROLES.includes(body.role as (typeof USER_ROLES)[number]) ? body.role as (typeof USER_ROLES)[number] : undefined;
  const unlock = body?.unlock === true;
  try {
    const users = await updateManagedUser(id, { role, unlock }, admin.id);
    const target = users.find((user) => user.id === id);
    await (await getDb()).collection("audit_log").insertOne({
      ts: new Date().toISOString(),
      label: unlock ? "User account unlocked" : "User role updated",
      detail: `${admin.email} changed ${target?.email ?? id}${unlock ? " unlock status" : ` role to ${target?.role ?? role}`}.`,
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update user." }, { status: 400 });
  }
}
