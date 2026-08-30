import "server-only";
import { createHash } from "crypto";
import { getDb } from "./mongodb";
import type { Regulation } from "./types";
import { OPTIONAL_NIGERIA_REGULATORS, type OptionalNigeriaRegulatorCode, normalizeOptionalNigeriaRegulatorCodes } from "./optional-nigeria-regulator-config";

export { normalizeOptionalNigeriaRegulatorCodes } from "./optional-nigeria-regulator-config";

type OptionalNigeriaRegulation = Regulation & { userId: string; optionalRegulatorCode: OptionalNigeriaRegulatorCode };
type SourceConfig = (typeof OPTIONAL_NIGERIA_REGULATORS)[number];
const MAX_ITEMS = 12;
const REQUEST_TIMEOUT_MS = 15_000;

function clean(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#(?:x[\da-f]+|\d+);/gi, " ").replace(/\s+/g, " ").trim();
}

async function publicationsFromOfficialPage(source: SourceConfig) {
  const response = await fetch(source.url, {
    cache: "no-store",
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${source.label} publication page returned HTTP ${response.status}.`);
  const html = await response.text();
  const seen = new Set<string>();
  const retrievedAt = new Date().toISOString();
  const publications: Omit<OptionalNigeriaRegulation, "id" | "userId" | "optionalRegulatorCode">[] = [];

  for (const match of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const title = clean(match[2]);
    if (title.length < 18) continue;
    let sourceUrl: string;
    try { sourceUrl = new URL(match[1], source.url).toString(); } catch { continue; }
    if (new URL(sourceUrl).hostname !== new URL(source.url).hostname || !source.path.test(new URL(sourceUrl).pathname)) continue;
    if (seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);
    const sourceId = `${source.code}-${createHash("sha256").update(sourceUrl).digest("hex")}`;
    const summary = `${source.regulator} publication available from its official website.`;
    publications.push({
      regulator: source.regulator, source: "ng", priority: /sanction|enforcement|warning|deadline|revocation|penalt/i.test(title) ? "high" : "medium", status: "new",
      title, date: retrievedAt, type: source.type, summary, impact: `Review this ${source.label} publication and assess its effect on your Nigerian compliance obligations.`,
      tags: [...source.tags], deadline: "Review required", readiness: 0, sourceUrl, retrievedAt, sourceId,
      contentHash: createHash("sha256").update(`${title}\n${sourceUrl}`).digest("hex"),
    });
    if (publications.length >= MAX_ITEMS) break;
  }
  if (!publications.length) throw new Error(`${source.label} page contained no usable publication links.`);
  return publications;
}

async function nextOptionalRegulationId() {
  const db = await getDb();
  const counter = await db.collection<{ _id: string; value: number }>("counters").findOneAndUpdate(
    { _id: "optional_nigeria_regulation_id" },
    { $setOnInsert: { value: 0 }, $inc: { value: -1 } },
    { upsert: true, returnDocument: "after" },
  );
  if (!counter) throw new Error("Could not allocate an optional regulation ID.");
  return counter.value;
}

export async function runOptionalNigeriaRegulatorIngestion(userId: string, codes: OptionalNigeriaRegulatorCode[]) {
  const db = await getDb();
  const regulations = db.collection<OptionalNigeriaRegulation>("user_optional_regulations");
  await regulations.createIndex({ userId: 1, optionalRegulatorCode: 1, sourceId: 1 }, { unique: true });
  const results = await Promise.allSettled(codes.map(async (code) => {
    const source = OPTIONAL_NIGERIA_REGULATORS.find((candidate) => candidate.code === code)!;
    const publications = await publicationsFromOfficialPage(source);
    let added = 0;
    for (const publication of publications) {
      const existing = await regulations.findOne({ userId, optionalRegulatorCode: code, sourceId: publication.sourceId });
      if (existing) {
        await regulations.updateOne({ _id: existing._id }, { $set: publication });
      } else {
        await regulations.insertOne({ ...publication, id: await nextOptionalRegulationId(), userId, optionalRegulatorCode: code });
        added += 1;
      }
    }
    return { code, fetched: publications.length, added };
  }));
  const completed = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : "Optional regulator scan failed."] : []);
  await db.collection("audit_log").insertOne({
    ts: new Date().toISOString(), label: "Optional Nigeria regulator scan completed",
    detail: `${completed.map((result) => `${result.code.toUpperCase()}: ${result.fetched} checked, ${result.added} new`).join("; ")}${errors.length ? `; failures: ${errors.join("; ")}` : ""}`,
  });
  return { completed, errors };
}

export async function getOptionalNigeriaRegulations(userId: string, codes: string[] | undefined): Promise<Regulation[]> {
  const selected = normalizeOptionalNigeriaRegulatorCodes(codes);
  if (!selected.length) return [];
  const db = await getDb();
  return db.collection<OptionalNigeriaRegulation>("user_optional_regulations")
    .find({ userId, optionalRegulatorCode: { $in: selected } }, { projection: { _id: 0, userId: 0, optionalRegulatorCode: 0 } })
    .sort({ id: 1 }).toArray();
}

export async function getOptionalNigeriaRegulationById(userId: string, id: number) {
  const db = await getDb();
  return db.collection<OptionalNigeriaRegulation>("user_optional_regulations").findOne({ userId, id }, { projection: { _id: 0, userId: 0, optionalRegulatorCode: 0 } });
}

export async function clearOptionalNigeriaRegulations(userId: string) {
  const db = await getDb();
  const deleted = await db.collection("user_optional_regulations").deleteMany({ userId });
  await db.collection("alert_reads").deleteMany({ userId, regulationId: { $lt: 0 } });
  await db.collection("audit_log").insertOne({ ts: new Date().toISOString(), label: "Optional Nigeria data cleared", detail: `${deleted.deletedCount} user-scoped optional regulator records removed at sign-out.` });
  return deleted.deletedCount;
}

export async function clearDeselectedOptionalNigeriaRegulations(userId: string, selectedCodes: OptionalNigeriaRegulatorCode[]) {
  const db = await getDb();
  await db.collection("user_optional_regulations").deleteMany({ userId, optionalRegulatorCode: { $nin: selectedCodes } });
}
