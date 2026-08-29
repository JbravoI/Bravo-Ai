import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "bravo_ai";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to app/.env.local (see app/.env.example).");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Reuse the client across Next.js dev hot-reloads instead of opening a new
  // connection pool on every file change.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}
