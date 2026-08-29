import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(envFile.split(/\r?\n/).flatMap((line) => {
  const index = line.indexOf("=");
  return index > 0 ? [[line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, "")]] : [];
}));
const uri = process.env.MONGODB_URI ?? env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required.");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function legacyDateToIso(value) {
  const match = typeof value === "string" && value.match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/);
  if (!match) return undefined;
  const month = months.indexOf(match[2]);
  return month < 0 ? undefined : new Date(Date.UTC(Number(match[3]), month, Number(match[1]))).toISOString().slice(0, 10);
}

const client = new MongoClient(uri);
await client.connect();
try {
  const db = client.db(process.env.MONGODB_DB ?? env.MONGODB_DB ?? "bravo_ai");
  let updated = 0;
  for await (const regulation of db.collection("regulations").find({})) {
    const date = legacyDateToIso(regulation.date);
    const deadline = legacyDateToIso(regulation.deadline);
    if (!date && !deadline) continue;
    await db.collection("regulations").updateOne({ _id: regulation._id }, { $set: { ...(date && { date }), ...(deadline && { deadline }) } });
    updated += 1;
  }
  await db.collection("audit_log").updateMany(
    { ts: { $regex: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/ } },
    [{ $set: { ts: { $concat: [{ $replaceOne: { input: "$ts", find: " ", replacement: "T" } }, ":00.000Z"] } } }],
  );
  console.log(`Normalized dates in ${updated} regulation records.`);
} finally {
  await client.close();
}
