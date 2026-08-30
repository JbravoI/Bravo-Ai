import { MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "bravo_ai";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to the deployment environment.");

  // Do not connect when this module is evaluated: a rejected promise at module
  // scope becomes an unhandled rejection in a serverless function. Lazily
  // connect on the first database operation and clear a failed promise so a
  // later request can recover after Atlas/network availability is restored.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, {
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
    }).connect().catch((error) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(dbName);
}
