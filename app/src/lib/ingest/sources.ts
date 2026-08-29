import { createHash } from "crypto";
import { getDb } from "@/lib/mongodb";
import type { Regulation, ScanRun, Source } from "@/lib/types";

type Config = { source: Source; regulator: string; url: string; host: string };
const SOURCES: Config[] = [
  { source: "pra", regulator: "PRA", url: "https://www.bankofengland.co.uk/rss/news", host: "www.bankofengland.co.uk" },
  { source: "hmt", regulator: "HM Treasury", url: "https://www.gov.uk/government/organisations/hm-treasury.atom", host: "www.gov.uk" },
  { source: "eu", regulator: "ESMA", url: "https://www.esma.europa.eu/rss.xml", host: "www.esma.europa.eu" },
];

function clean(value: string) { return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim(); }
function tag(block: string, name: string) { return clean(block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? ""); }
function link(block: string) {
  const text = tag(block, "link");
  if (text) return text;
  return block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1] ?? "";
}

export async function runAdditionalSourceIngestion(source: Exclude<Source, "fca">): Promise<ScanRun> {
  const config = SOURCES.find((item) => item.source === source)!;
  const startedAt = new Date().toISOString();
  const response = await fetch(config.url, { cache: "no-store", headers: { Accept: "application/rss+xml, application/atom+xml, application/xml" } });
  if (!response.ok) throw new Error(`${config.regulator} feed returned HTTP ${response.status}.`);
  const xml = await response.text();
  const blocks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  const db = await getDb();
  const regulations = db.collection<Regulation>("regulations");
  await regulations.createIndex({ source: 1, sourceId: 1 }, { unique: true, partialFilterExpression: { sourceId: { $exists: true } } });
  let nextId = ((await regulations.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).next())?.id ?? 0) + 1;
  let newRecords = 0;
  let changedRecords = 0;
  const retrievedAt = new Date().toISOString();

  for (const block of blocks.slice(0, 30)) {
    const title = tag(block, "title"); const sourceUrl = link(block); const sourceId = tag(block, "id") || tag(block, "guid") || sourceUrl;
    if (!title || !sourceUrl || !sourceId) continue;
    try { const parsed = new URL(sourceUrl); if (parsed.protocol !== "https:" || parsed.hostname !== config.host) continue; } catch { continue; }
    const published = tag(block, "published") || tag(block, "updated") || tag(block, "pubDate") || retrievedAt;
    const date = Number.isNaN(new Date(published).valueOf()) ? retrievedAt : new Date(published).toISOString();
    const summary = tag(block, "summary") || tag(block, "description") || "Source publication available at the linked regulator page.";
    const text = `${title} ${summary}`.toLowerCase();
    const contentHash = createHash("sha256").update(`${title}\n${summary}\n${date}`).digest("hex");
    const normalized: Omit<Regulation, "id"> = { regulator: config.regulator, source: config.source, priority: text.includes("warning") || text.includes("enforcement") ? "high" : "medium", status: "new", title, date, type: "Regulatory update", summary: summary.slice(0, 1000), impact: `Review this ${config.regulator} publication and assess its relevance to your firm.`, tags: [text.includes("bank") ? "Banking" : "Compliance"], deadline: "Review required", readiness: 0, sourceUrl, retrievedAt, sourceId, contentHash };
    const existing = await regulations.findOne({ source: config.source, sourceId });
    if (!existing) { await regulations.insertOne({ ...normalized, id: nextId++ }); newRecords++; }
    else if (existing.contentHash !== contentHash) { await regulations.updateOne({ id: existing.id }, { $set: normalized }); await db.collection("regulation_versions").insertOne({ regulationId: existing.id, source: config.source, sourceUrl, previousContentHash: existing.contentHash ?? null, contentHash, diffSummary: `${config.regulator} feed item changed.`, capturedAt: retrievedAt }); changedRecords++; }
    else await regulations.updateOne({ id: existing.id }, { $set: { retrievedAt } });
  }
  const completedAt = new Date().toISOString();
  const run = { source: config.source, startedAt, completedAt, fetched: blocks.length, newRecords, changedRecords };
  await db.collection<ScanRun>("scan_runs").insertOne(run);
  await db.collection("audit_log").insertOne({ ts: completedAt, label: `${config.regulator} scan completed`, detail: `${blocks.length} feed items checked; ${newRecords} new and ${changedRecords} changed records recorded.` });
  return run;
}
