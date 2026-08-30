import { createHash } from "crypto";
import { getDb } from "@/lib/mongodb";
import type { Regulation, ScanRun } from "@/lib/types";

const CBN_MPC_URL = "https://www.cbn.gov.ng/MonetaryPolicy/decisions.html";
const MAX_ITEMS = 12;

function clean(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function publicationDate(title: string, fallback: string) {
  const match = title.match(/([A-Z][a-z]+)\s+(\d{1,2})(?:-\d{1,2})?,\s*(20\d{2})/);
  if (!match) return fallback;
  const value = new Date(`${match[1]} ${match[2]}, ${match[3]}`);
  return Number.isNaN(value.valueOf()) ? fallback : value.toISOString();
}

export async function runNigeriaIngestion(): Promise<ScanRun> {
  const startedAt = new Date().toISOString();
  const response = await fetch(CBN_MPC_URL, { cache: "no-store", headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`CBN monetary-policy page returned HTTP ${response.status}.`);
  const html = await response.text();
  const headings = [...html.matchAll(/<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/gi)]
    .map((match) => ({ title: clean(match[1]), index: match.index ?? 0 }))
    .filter((entry) => entry.title.startsWith("Key Decisions of the Central Bank of Nigeria Monetary Policy Committee"))
    .slice(0, MAX_ITEMS);
  if (!headings.length) throw new Error("CBN monetary-policy page contained no usable MPC decisions.");

  const db = await getDb();
  const regulations = db.collection<Regulation>("regulations");
  await regulations.createIndex({ source: 1, sourceId: 1 }, { unique: true, partialFilterExpression: { sourceId: { $exists: true } } });
  let nextId = ((await regulations.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).next())?.id ?? 0) + 1;
  let newRecords = 0;
  let changedRecords = 0;
  const retrievedAt = new Date().toISOString();

  for (let index = 0; index < headings.length; index += 1) {
    const item = headings[index];
    const end = headings[index + 1]?.index ?? html.length;
    const section = html.slice(item.index, end);
    const decision = clean(section.match(/<p[^>]*>(The Committee decided[\s\S]*?)<\/p>/i)?.[1] ?? "");
    const points = [...section.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => clean(match[1])).filter(Boolean);
    const summary = [decision, ...points].filter(Boolean).join(" ").slice(0, 1000) || "CBN monetary-policy decision published.";
    const sourceId = `cbn-mpc-${createHash("sha256").update(item.title).digest("hex")}`;
    const contentHash = createHash("sha256").update(`${item.title}\n${summary}`).digest("hex");
    const normalized: Omit<Regulation, "id"> = {
      regulator: "Central Bank of Nigeria (CBN)", source: "ng", priority: "medium", status: "new", title: item.title,
      date: publicationDate(item.title, retrievedAt), type: "Monetary policy decision", summary,
      impact: "Assess the effect of this CBN monetary-policy decision on liquidity, interest-rate, capital and customer-product controls.",
      tags: ["Banking", "Investment", "Compliance"], deadline: "Review required", readiness: 0,
      sourceUrl: CBN_MPC_URL, retrievedAt, sourceId, contentHash,
    };
    const existing = await regulations.findOne({ source: "ng", sourceId });
    if (!existing) { await regulations.insertOne({ ...normalized, id: nextId++ }); newRecords += 1; }
    else if (existing.contentHash !== contentHash) {
      await regulations.updateOne({ id: existing.id }, { $set: normalized });
      await db.collection("regulation_versions").insertOne({ regulationId: existing.id, source: "ng", sourceUrl: CBN_MPC_URL, previousContentHash: existing.contentHash ?? null, contentHash, diffSummary: "CBN monetary-policy decision changed.", capturedAt: retrievedAt });
      changedRecords += 1;
    } else await regulations.updateOne({ id: existing.id }, { $set: { retrievedAt } });
  }
  const completedAt = new Date().toISOString();
  const run: ScanRun = { source: "ng", startedAt, completedAt, fetched: headings.length, newRecords, changedRecords };
  await db.collection<ScanRun>("scan_runs").insertOne(run);
  await db.collection("audit_log").insertOne({ ts: completedAt, label: "CBN Nigeria scan completed", detail: `${headings.length} CBN MPC decisions checked; ${newRecords} new and ${changedRecords} changed records recorded.` });
  return run;
}
