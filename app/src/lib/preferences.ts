import { getDb } from "./mongodb";

export interface UserPreferences {
  userId: string;
  activeJurisdictionCodes?: string[];
  activeIndustryFocus?: string[];
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const db = await getDb();
  return db.collection<UserPreferences>("user_preferences").findOne({ userId }, { projection: { _id: 0 } });
}

export async function saveUserPreferences(
  userId: string,
  userEmail: string,
  patch: Partial<Pick<UserPreferences, "activeJurisdictionCodes" | "activeIndustryFocus">>,
): Promise<void> {
  const db = await getDb();
  const normalizedPatch = {
    ...patch,
    ...(patch.activeJurisdictionCodes ? { activeJurisdictionCodes: [patch.activeJurisdictionCodes[0]] } : {}),
  };
  await db
    .collection("user_preferences")
    .updateOne({ userId }, { $set: { userId, ...normalizedPatch, updatedAt: new Date().toISOString() } }, { upsert: true });

  const changed = Object.keys(normalizedPatch).join(", ");
  await db.collection("audit_log").insertOne({
    ts: new Date().toISOString().slice(0, 16).replace("T", " "),
    label: "Preferences updated",
    detail: `${userEmail} changed: ${changed}`,
  });
}
