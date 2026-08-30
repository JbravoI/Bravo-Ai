import { createHash } from "crypto";
import { getDb } from "@/lib/mongodb";
import type { Regulation, ScanRun } from "@/lib/types";

const CBN_MPC_URL = "https://www.cbn.gov.ng/MonetaryPolicy/decisions.html";
const MAX_ITEMS = 12;
const WORDPRESS_SOURCES = [
  { regulator: "NAICOM", endpoint: "https://naicom.gov.ng/wp-json/wp/v2/posts?per_page=12", prefix: "naicom", type: "Insurance regulatory update", tags: ["Insurance", "Compliance"] },
  { regulator: "PenCom", endpoint: "https://www.pencom.gov.ng/wp-json/wp/v2/posts?per_page=12", prefix: "pencom", type: "Pension regulatory update", tags: ["Investment", "Compliance"] },
  { regulator: "Financial Reporting Council of Nigeria (FRC)", endpoint: "https://frcnigeria.gov.ng/wp-json/wp/v2/posts?per_page=12", prefix: "frc", type: "Financial reporting update", tags: ["Compliance", "Investment"] },
] as const;
const SEC_CIRCULARS_URL = "https://www.sec.gov.ng/for-investors/keep-track-of-circulars/";

function clean(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function publicationDate(title: string, fallback: string) {
  const match = title.match(/([A-Z][a-z]+)\s+(\d{1,2})(?:-\d{1,2})?,\s*(20\d{2})/);
  if (!match) return fallback;
  const value = new Date(`${match[1]} ${match[2]}, ${match[3]}`);
  return Number.isNaN(value.valueOf()) ? fallback : value.toISOString();
}

type NigeriaPublication = Omit<Regulation, "id">;

async function wordPressPublications() {
  const publications: NigeriaPublication[] = [];
  for (const source of WORDPRESS_SOURCES) {
    const response = await fetch(source.endpoint, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`${source.regulator} publication feed returned HTTP ${response.status}.`);
    const posts = (await response.json()) as Array<{ id: number; date?: string; link?: string; title?: { rendered?: string }; excerpt?: { rendered?: string } }>;
    for (const post of posts.slice(0, MAX_ITEMS)) {
      const title = clean(post.title?.rendered ?? "");
      const sourceUrl = post.link ?? "";
      if (!title || !sourceUrl) continue;
      const retrievedAt = new Date().toISOString();
      const summary = clean(post.excerpt?.rendered ?? "") || `${source.regulator} publication available at the linked source.`;
      publications.push({
        regulator: source.regulator, source: "ng", priority: /sanction|enforcement|warning|deadline/i.test(`${title} ${summary}`) ? "high" : "medium", status: "new", title,
        date: Number.isNaN(new Date(post.date ?? "").valueOf()) ? retrievedAt : new Date(post.date!).toISOString(), type: source.type,
        summary: summary.slice(0, 1000), impact: `Review this ${source.regulator} publication and assess the effect on your Nigerian regulatory obligations.`,
        tags: [...source.tags], deadline: "Review required", readiness: 0, sourceUrl, retrievedAt,
        sourceId: `${source.prefix}-${post.id}`, contentHash: createHash("sha256").update(`${title}\n${summary}\n${post.date ?? ""}`).digest("hex"),
      });
    }
  }
  return publications;
}

async function secPublications() {
  const response = await fetch(SEC_CIRCULARS_URL, { cache: "no-store", headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`SEC Nigeria circulars page returned HTTP ${response.status}.`);
  const html = await response.text();
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({ sourceUrl: new URL(match[1], SEC_CIRCULARS_URL).toString(), title: clean(match[2]) }))
    .filter((item) => item.title && item.sourceUrl.startsWith("https://www.sec.gov.ng/for-investors/keep-track-of-circulars/"))
    .filter((item) => item.sourceUrl !== SEC_CIRCULARS_URL)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.sourceUrl === item.sourceUrl) === index)
    .slice(0, MAX_ITEMS);
  const retrievedAt = new Date().toISOString();
  return links.map((item) => {
    const sourceId = `sec-${createHash("sha256").update(item.sourceUrl).digest("hex")}`;
    const summary = "SEC Nigeria circular or official capital-market publication available at the linked source.";
    return {
      regulator: "Securities and Exchange Commission Nigeria (SEC)", source: "ng" as const, priority: /sanction|warning|enforcement|implementation/i.test(item.title) ? "high" as const : "medium" as const,
      status: "new" as const, title: item.title, date: retrievedAt, type: "Capital-market circular", summary,
      impact: "Review this SEC Nigeria publication and assess the effect on capital-market, investment or digital-asset obligations.", tags: ["Investment", "Compliance"], deadline: "Review required", readiness: 0,
      sourceUrl: item.sourceUrl, retrievedAt, sourceId, contentHash: createHash("sha256").update(`${item.title}\n${item.sourceUrl}`).digest("hex"),
    } satisfies NigeriaPublication;
  });
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

  async function store(normalized: NigeriaPublication) {
    const existing = await regulations.findOne({ source: "ng", sourceId: normalized.sourceId });
    if (!existing) { await regulations.insertOne({ ...normalized, id: nextId++ }); newRecords += 1; return; }
    if (existing.contentHash !== normalized.contentHash) {
      await regulations.updateOne({ id: existing.id }, { $set: normalized });
      await db.collection("regulation_versions").insertOne({ regulationId: existing.id, source: "ng", sourceUrl: normalized.sourceUrl, previousContentHash: existing.contentHash ?? null, contentHash: normalized.contentHash, diffSummary: `${normalized.regulator} publication changed.`, capturedAt: normalized.retrievedAt });
      changedRecords += 1;
    } else await regulations.updateOne({ id: existing.id }, { $set: { retrievedAt: normalized.retrievedAt } });
  }

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
    await store(normalized);
  }
  const providerResults = await Promise.allSettled([wordPressPublications(), secPublications()]);
  for (const result of providerResults) {
    if (result.status === "fulfilled") for (const publication of result.value) await store(publication);
    else await db.collection("audit_log").insertOne({ ts: new Date().toISOString(), label: "Nigeria source scan failed", detail: result.reason instanceof Error ? result.reason.message : "A Nigeria source scan failed." });
  }
  const completedAt = new Date().toISOString();
  const fetched = headings.length + providerResults.filter((result) => result.status === "fulfilled").reduce((total, result) => total + result.value.length, 0);
  const run: ScanRun = { source: "ng", startedAt, completedAt, fetched, newRecords, changedRecords };
  await db.collection<ScanRun>("scan_runs").insertOne(run);
  await db.collection("audit_log").insertOne({ ts: completedAt, label: "Nigeria scan completed", detail: `${fetched} CBN, SEC Nigeria, NAICOM, PenCom and FRC publications checked; ${newRecords} new and ${changedRecords} changed records recorded.` });
  return run;
}
