export type Source = "fca" | "pra" | "hmt" | "eu" | "ng";
export type Priority = "high" | "medium" | "low";
export type Status = "new" | "pending" | "implemented";

export interface Regulation {
  id: number;
  regulator: string;
  source: Source;
  priority: Priority;
  status: Status;
  title: string;
  date: string;
  type: string;
  summary: string;
  impact: string;
  tags: string[];
  deadline: string;
  readiness: number;
  sourceUrl?: string;
  retrievedAt?: string;
  sourceId?: string;
  contentHash?: string;
}

export interface Jurisdiction {
  code: string;
  label: string;
  color: string;
  active: boolean;
}

export interface AuditEntry {
  ts: string;
  label: string;
  detail: string;
}

export interface ScanRun {
  source: Source;
  startedAt: string;
  completedAt: string;
  fetched: number;
  newRecords: number;
  changedRecords: number;
}

export type ImpactLevel = "High" | "Medium" | "Low" | "None";

export interface ImpactRow {
  reg: string;
  banking: ImpactLevel;
  invest: ImpactLevel;
  insure: ImpactLevel;
  comp: ImpactLevel;
  ops: ImpactLevel;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  error?: boolean;
}
