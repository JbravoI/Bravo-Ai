import "server-only";

import { createHash, randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

const RESET_TTL_MS = 30 * 60 * 1000;

type ResetStatus = "pending" | "issued" | "used" | "expired";

interface PasswordResetRequestRecord {
  _id: ObjectId;
  userId: string;
  email: string;
  status: ResetStatus;
  requestedAt: string;
  issuedAt?: string;
  issuedBy?: string;
  expiresAt?: string;
  tokenHash?: string;
  usedAt?: string;
}

export interface ManagedPasswordResetRequest {
  id: string;
  email: string;
  status: ResetStatus;
  requestedAt: string;
  expiresAt?: string;
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.collection("users").findOne({ email: normalizedEmail }, { projection: { _id: 1, email: 1 } });
  if (!user) return;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const recent = await db.collection<PasswordResetRequestRecord>("password_reset_requests")
    .findOne({ userId: user._id.toString(), status: "pending", requestedAt: { $gte: fiveMinutesAgo } });
  if (recent) return;
  const requestedAt = new Date().toISOString();
  await db.collection<PasswordResetRequestRecord>("password_reset_requests").insertOne({
    userId: user._id.toString(), email: normalizedEmail, status: "pending", requestedAt,
  } as PasswordResetRequestRecord);
  await db.collection("audit_log").insertOne({ ts: requestedAt, label: "Password reset requested", detail: `A password reset request was submitted for ${normalizedEmail}.` });
}

export async function getManagedPasswordResetRequests(): Promise<ManagedPasswordResetRequest[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection<PasswordResetRequestRecord>("password_reset_requests").updateMany({ status: "issued", expiresAt: { $lt: now } }, { $set: { status: "expired" } });
  const records = await db.collection<PasswordResetRequestRecord>("password_reset_requests")
    .find({ status: { $in: ["pending", "issued"] } }, { projection: { tokenHash: 0 } }).sort({ requestedAt: -1 }).toArray();
  return records.map((record) => ({ id: record._id.toString(), email: record.email, status: record.status, requestedAt: record.requestedAt, expiresAt: record.expiresAt }));
}

export async function issuePasswordResetLink(requestId: string, adminEmail: string, origin: string) {
  if (!ObjectId.isValid(requestId)) throw new Error("Invalid reset request.");
  const db = await getDb();
  const record = await db.collection<PasswordResetRequestRecord>("password_reset_requests").findOne({ _id: new ObjectId(requestId), status: "pending" });
  if (!record) throw new Error("This reset request is no longer pending.");
  const token = randomBytes(32).toString("base64url");
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  const issued = await db.collection<PasswordResetRequestRecord>("password_reset_requests").updateOne(
    { _id: record._id, status: "pending" },
    { $set: { status: "issued", issuedAt, issuedBy: adminEmail, expiresAt, tokenHash: tokenHash(token) } },
  );
  if (!issued.modifiedCount) throw new Error("This reset request is no longer pending.");
  await db.collection("audit_log").insertOne({ ts: issuedAt, label: "Password reset link issued", detail: `${adminEmail} issued a 30-minute password reset link for ${record.email}.` });
  return { resetUrl: new URL(`/reset-password?token=${encodeURIComponent(token)}`, origin).toString(), expiresAt, requestId };
}

export async function consumePasswordReset(token: string, passwordHash: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  const record = await db.collection<PasswordResetRequestRecord>("password_reset_requests").findOne({
    tokenHash: tokenHash(token), status: "issued", expiresAt: { $gt: now },
  });
  if (!record) throw new Error("This password reset link is invalid, expired, or has already been used.");
  const applied = await db.collection("users").updateOne(
    { _id: new ObjectId(record.userId) },
    { $set: { passwordHash, failedLoginAttempts: 0, locked: false, passwordUpdatedAt: now }, $unset: { lockedAt: "" } },
  );
  if (!applied.matchedCount) throw new Error("The user account no longer exists.");
  await db.collection<PasswordResetRequestRecord>("password_reset_requests").updateOne(
    { _id: record._id, status: "issued" },
    { $set: { status: "used", usedAt: now }, $unset: { tokenHash: "" } },
  );
  await db.collection("audit_log").insertOne({ ts: now, label: "Password reset completed", detail: `Password reset completed for ${record.email}.` });
}
