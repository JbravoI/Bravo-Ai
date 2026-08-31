// User storage for Credentials-based auth. Deliberately not using an Auth.js
// database adapter — Credentials + JWT sessions don't need one (see
// docs/decisions/0006-authjs-credentials-not-oauth.md) — so this collection
// and its access functions are managed directly, the same pattern as the
// rest of app/src/lib/data.ts.
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export const USER_ROLES = ["admin", "analyst", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface ManagedUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  locked: boolean;
  lockedAt?: string;
}

function userRole(value: unknown): UserRole {
  return value === "admin" || value === "viewer" || value === "analyst" ? value : "analyst";
}

function publicUser(user: { _id: ObjectId; email: string; profileName?: unknown; role?: unknown }): AuthUser {
  const fallbackName = user.email.split("@")[0] || "Bravo Ai user";
  return { id: user._id.toString(), email: user.email, name: typeof user.profileName === "string" && user.profileName.trim() ? user.profileName : fallbackName, role: userRole(user.role) };
}

export async function createUser(email: string, password: string, profileName: string): Promise<AuthUser> {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.collection("users").findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.collection("users").insertOne({
    email: normalizedEmail,
    profileName,
    passwordHash,
    role: "analyst" satisfies UserRole,
    failedLoginAttempts: 0,
    locked: false,
    createdAt: new Date().toISOString(),
  });
  return { id: result.insertedId.toString(), email: normalizedEmail, name: profileName, role: "analyst" };
}

export async function verifyUser(email: string, password: string): Promise<AuthUser | null> {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.collection("users").findOne({ email: normalizedEmail });
  if (!user) return null;
  if (user.locked) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const attempts = (typeof user.failedLoginAttempts === "number" ? user.failedLoginAttempts : 0) + 1;
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { failedLoginAttempts: attempts, locked: attempts >= 3, ...(attempts >= 3 ? { lockedAt: new Date().toISOString() } : {}) } },
    );
    return null;
  }
  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { failedLoginAttempts: 0, locked: false, lastLoginAt: new Date().toISOString() }, $unset: { lockedAt: "" } },
  );
  return publicUser(user as { _id: ObjectId; email: string; profileName?: unknown; role?: unknown });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function getUserById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const user = await (await getDb()).collection("users").findOne({ _id: new ObjectId(id) });
  return user ? publicUser(user as { _id: ObjectId; email: string; profileName?: unknown; role?: unknown }) : null;
}

export async function getManagedUsers(): Promise<ManagedUser[]> {
  const users = await (await getDb()).collection("users").find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
  return users.map((user) => ({
    id: user._id.toString(), email: user.email, role: userRole(user.role), createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt, failedLoginAttempts: typeof user.failedLoginAttempts === "number" ? user.failedLoginAttempts : 0,
    locked: Boolean(user.locked), lockedAt: user.lockedAt,
  }));
}

export async function updateManagedUser(id: string, patch: { role?: UserRole; unlock?: boolean }, actorId: string) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid user ID.");
  if (id === actorId) throw new Error("You cannot change your own admin access here.");
  const db = await getDb();
  const target = await db.collection("users").findOne({ _id: new ObjectId(id) });
  if (!target) throw new Error("User not found.");
  if (patch.role && target.role === "admin" && patch.role !== "admin") {
    const adminCount = await db.collection("users").countDocuments({ role: "admin" });
    if (adminCount <= 1) throw new Error("At least one administrator must remain.");
  }
  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};
  if (patch.role) set.role = patch.role;
  if (patch.unlock) { set.locked = false; set.failedLoginAttempts = 0; unset.lockedAt = ""; }
  if (!Object.keys(set).length) throw new Error("No change requested.");
  await db.collection("users").updateOne({ _id: target._id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
  return getManagedUsers();
}
