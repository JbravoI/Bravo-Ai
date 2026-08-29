// Data access layer — every Route Handler under app/api/** and every Server
// Component page calls these functions directly (no internal HTTP hop; see
// docs/architecture/02-api-and-client-integration.md). Backed by MongoDB
// Atlas as of Epic 02 (see docs/decisions/0004-mongodb-atlas-not-postgres.md).
//
// Seed data lives in scripts/seed.mjs, not here — run `node scripts/seed.mjs`
// once against a fresh database before relying on these functions returning
// anything.
import { getDb } from "./mongodb";
import type { AuditEntry, ImpactRow, Jurisdiction, Regulation, ScanRun, Source } from "./types";

// Mongo's own `_id` is never part of the public shape — every query excludes it.
const NO_ID = { projection: { _id: 0 } } as const;

export async function getRegulations(source?: Source): Promise<Regulation[]> {
  const db = await getDb();
  const filter = source ? { source } : {};
  return db.collection<Regulation>("regulations").find(filter, NO_ID).sort({ id: 1 }).toArray();
}

export async function getRegulationById(id: number): Promise<Regulation | undefined> {
  const db = await getDb();
  const doc = await db.collection<Regulation>("regulations").findOne({ id }, NO_ID);
  return doc ?? undefined;
}

export async function getAuditEntries(): Promise<AuditEntry[]> {
  const db = await getDb();
  return db.collection<AuditEntry>("audit_log").find({}, NO_ID).sort({ ts: -1 }).toArray();
}

export async function getLatestScanRun(): Promise<ScanRun | undefined> {
  const db = await getDb();
  const run = await db.collection<ScanRun>("scan_runs").findOne({}, { ...NO_ID, sort: { completedAt: -1 } });
  return run ?? undefined;
}

export async function getImpactRows(): Promise<ImpactRow[]> {
  const db = await getDb();
  return db.collection<ImpactRow>("impact_rows").find({}, NO_ID).toArray();
}

export async function getJurisdictions(): Promise<Jurisdiction[]> {
  const db = await getDb();
  return db.collection<Jurisdiction>("jurisdictions").find({}, NO_ID).toArray();
}
