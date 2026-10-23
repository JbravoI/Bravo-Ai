import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { COMPLIANCE_ASSESSMENT_STATUSES, type ComplianceAssessment, type ComplianceAssessmentStatus } from "./types";

type AssessmentRecord = Omit<ComplianceAssessment, "id"> & { _id: ObjectId; userId: string };

export type NewComplianceAssessment = Pick<ComplianceAssessment, "regulationId" | "owner" | "assessmentStatus" | "readiness" | "evidenceReference" | "rationale" | "nextReviewAt">;

function toPublicAssessment(record: AssessmentRecord): ComplianceAssessment {
  return {
    id: record._id.toString(), regulationId: record.regulationId, owner: record.owner,
    assessmentStatus: record.assessmentStatus, readiness: record.readiness,
    evidenceReference: record.evidenceReference, rationale: record.rationale,
    nextReviewAt: record.nextReviewAt, assessedAt: record.assessedAt, assessedBy: record.assessedBy,
  };
}

function validDateOnly(value: string | undefined) {
  if (value === undefined) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validateComplianceAssessment(input: unknown): NewComplianceAssessment {
  if (!input || typeof input !== "object") throw new Error("Invalid assessment.");
  const candidate = input as Record<string, unknown>;
  const regulationId = candidate.regulationId;
  const owner = typeof candidate.owner === "string" ? candidate.owner.trim() : "";
  const assessmentStatus = candidate.assessmentStatus;
  const readiness = candidate.readiness;
  const evidenceReference = typeof candidate.evidenceReference === "string" ? candidate.evidenceReference.trim() : undefined;
  const rationale = typeof candidate.rationale === "string" ? candidate.rationale.trim() : "";
  const nextReviewAt = typeof candidate.nextReviewAt === "string" && candidate.nextReviewAt ? candidate.nextReviewAt : undefined;

  if (typeof regulationId !== "number" || !Number.isInteger(regulationId) || regulationId <= 0) throw new Error("Select a tracked regulation.");
  if (owner.length < 2 || owner.length > 120) throw new Error("Owner must be between 2 and 120 characters.");
  if (!COMPLIANCE_ASSESSMENT_STATUSES.includes(assessmentStatus as ComplianceAssessmentStatus)) throw new Error("Choose a valid assessment status.");
  if (typeof readiness !== "number" || !Number.isInteger(readiness) || readiness < 0 || readiness > 100) throw new Error("Readiness must be a whole number from 0 to 100.");
  if (evidenceReference && evidenceReference.length > 500) throw new Error("Evidence reference must be 500 characters or fewer.");
  if (rationale.length < 2 || rationale.length > 2_000) throw new Error("Rationale must be between 2 and 2,000 characters.");
  if (!validDateOnly(nextReviewAt)) throw new Error("Next review date must be a valid date.");
  return { regulationId, owner, assessmentStatus: assessmentStatus as ComplianceAssessmentStatus, readiness, ...(evidenceReference ? { evidenceReference } : {}), rationale, ...(nextReviewAt ? { nextReviewAt } : {}) };
}

export async function getLatestComplianceAssessments(regulationIds: number[]): Promise<ComplianceAssessment[]> {
  if (!regulationIds.length) return [];
  const records = await (await getDb()).collection<AssessmentRecord>("compliance_assessments")
    .find({ regulationId: { $in: regulationIds } }).sort({ assessedAt: -1 }).toArray();
  const latest = new Map<number, ComplianceAssessment>();
  for (const record of records) {
    if (!latest.has(record.regulationId)) latest.set(record.regulationId, toPublicAssessment(record));
  }
  return [...latest.values()];
}

export async function createComplianceAssessment(input: NewComplianceAssessment, actor: { id: string; email: string }) {
  const assessedAt = new Date().toISOString();
  const record: Omit<AssessmentRecord, "_id"> = { ...input, userId: actor.id, assessedAt, assessedBy: actor.email };
  const db = await getDb();
  const result = await db.collection<AssessmentRecord>("compliance_assessments").insertOne(record as AssessmentRecord);
  const assessment = toPublicAssessment({ ...record, _id: result.insertedId });
  await db.collection("audit_log").insertOne({
    ts: assessedAt,
    label: "Compliance assessment recorded",
    detail: `${actor.email} recorded ${assessment.readiness}% readiness for regulation ${assessment.regulationId} (${assessment.assessmentStatus}).`,
  });
  return assessment;
}
