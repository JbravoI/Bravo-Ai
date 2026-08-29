import { createHash } from "crypto";
import { getDb } from "@/lib/mongodb";
import type { Regulation, ScanRun } from "@/lib/types";

const FCA_RSS_URL = "https://www.fca.org.uk/news/rss.xml";
const FETCH_TIMEOUT_MS = 20_000;
const MAX_ITEMS_PER_SCAN = 30;

type FcaFeedItem = {
  sourceId: string;
  title: string;
  sourceUrl: string;
  publishedAt: string;
  description: string;
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function readTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? new Date().toISOString() : date.toISOString();
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

function parseFcaFeed(xml: string): FcaFeedItem[] {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
  return blocks.slice(0, MAX_ITEMS_PER_SCAN).flatMap((block) => {
    const title = readTag(block, "title");
    const sourceUrl = readTag(block, "link");
    const sourceId = readTag(block, "guid") || sourceUrl;
    if (!title || !sourceUrl || !sourceId) return [];

    try {
      const url = new URL(sourceUrl);
      if (url.protocol !== "https:" || url.hostname !== "www.fca.org.uk") return [];
    } catch {
      return [];
    }

    return [{
      sourceId,
      title,
      sourceUrl,
      publishedAt: parseDate(readTag(block, "pubDate")),
      description: readTag(block, "description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    }];
  });
}

function classify(item: FcaFeedItem, retrievedAt: string): Omit<Regulation, "id"> {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const type = text.includes("warning") ? "Warning" : text.includes("speech") ? "Speech" : text.includes("statement") ? "Statement" : "FCA update";
  const priority = text.includes("warning") || text.includes("enforcement") || text.includes("fine") ? "high" : "medium";
  const tags = [
    text.includes("bank") || text.includes("mortgage") ? "Banking" : undefined,
    text.includes("investment") || text.includes("market") ? "Investment" : undefined,
    text.includes("insurance") ? "Insurance" : undefined,
    "Compliance",
  ].filter((tag): tag is string => Boolean(tag));
  const summary = item.description || "FCA publication available at the source link.";
  const contentHash = createHash("sha256").update(`${item.title}\n${item.description}\n${item.publishedAt}`).digest("hex");

  return {
    regulator: "FCA",
    source: "fca",
    priority,
    status: "new",
    title: item.title,
    date: formatDate(item.publishedAt),
    type,
    summary: summary.slice(0, 1_000),
    impact: "Review the FCA publication and assess whether it creates an obligation, control change, or customer-risk action for your firm.",
    tags,
    deadline: "Review required",
    readiness: 0,
    sourceUrl: item.sourceUrl,
    retrievedAt,
    sourceId: item.sourceId,
    contentHash,
  };
}

export async function runFcaIngestion(): Promise<ScanRun> {
  const startedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(FCA_RSS_URL, {
      cache: "no-store",
      headers: { Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new Error(`FCA feed returned HTTP ${response.status}.`);
  const items = parseFcaFeed(await response.text());
  if (!items.length) throw new Error("FCA feed contained no usable items.");

  const db = await getDb();
  const regulations = db.collection<Regulation>("regulations");
  await regulations.createIndex({ source: 1, sourceId: 1 }, { unique: true, partialFilterExpression: { sourceId: { $exists: true } } });
  let nextId = ((await regulations.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).next())?.id ?? 0) + 1;
  let newRecords = 0;
  let changedRecords = 0;
  const retrievedAt = new Date().toISOString();

  for (const item of items) {
    const normalized = classify(item, retrievedAt);
    const existing = await regulations.findOne({ source: "fca", sourceId: normalized.sourceId });

    if (!existing) {
      await regulations.insertOne({ ...normalized, id: nextId });
      nextId += 1;
      newRecords += 1;
      continue;
    }

    if (existing.contentHash !== normalized.contentHash) {
      await regulations.updateOne({ id: existing.id }, { $set: normalized });
      await db.collection("regulation_versions").insertOne({
        regulationId: existing.id,
        source: "fca",
        sourceUrl: normalized.sourceUrl,
        previousContentHash: existing.contentHash ?? null,
        contentHash: normalized.contentHash,
        diffSummary: "FCA RSS item content changed.",
        capturedAt: retrievedAt,
      });
      changedRecords += 1;
    } else {
      await regulations.updateOne({ id: existing.id }, { $set: { retrievedAt } });
    }
  }

  const completedAt = new Date().toISOString();
  const run: ScanRun = { source: "fca", startedAt, completedAt, fetched: items.length, newRecords, changedRecords };
  await db.collection<ScanRun>("scan_runs").insertOne(run);
  await db.collection("audit_log").insertOne({
    ts: completedAt,
    label: "FCA scan completed",
    detail: `${items.length} FCA feed items checked; ${newRecords} new and ${changedRecords} changed records recorded.`,
  });

  return run;
}
