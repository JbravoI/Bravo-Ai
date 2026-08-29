// User storage for Credentials-based auth. Deliberately not using an Auth.js
// database adapter — Credentials + JWT sessions don't need one (see
// docs/decisions/0006-authjs-credentials-not-oauth.md) — so this collection
// and its access functions are managed directly, the same pattern as the
// rest of app/src/lib/data.ts.
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";

export interface AuthUser {
  id: string;
  email: string;
}

export async function createUser(email: string, password: string): Promise<AuthUser> {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.collection("users").findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.collection("users").insertOne({
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  return { id: result.insertedId.toString(), email: normalizedEmail };
}

export async function verifyUser(email: string, password: string): Promise<AuthUser | null> {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.collection("users").findOne({ email: normalizedEmail });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { id: user._id.toString(), email: user.email };
}
