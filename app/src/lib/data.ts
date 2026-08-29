// SEED DATA — mirrors the original static prototype's hard-coded records.
// Phase 2 replaces every export here with real queries against Postgres,
// populated by the Phase 5 ingestion pipeline. See STRATEGY.md.
import type { AuditEntry, ImpactRow, Jurisdiction, Regulation } from "./types";

export const REGULATIONS: Regulation[] = [
  {
    id: 1,
    regulator: "FCA",
    source: "fca",
    priority: "high",
    status: "new",
    title: "FCA PS25/1 – Consumer Duty Annual Review Requirements",
    date: "28 Apr 2025",
    type: "Policy Statement",
    summary:
      "The FCA has published updated annual review obligations under Consumer Duty, requiring firms to document evidence of good consumer outcomes across all retail products and services. Board-level sign-off is now mandatory.",
    impact:
      "Investment firms and retail banks must update their annual review frameworks immediately. Boards must formally approve consumer outcome evidence packs by 31 July 2025.",
    tags: ["Banking", "Investment", "Compliance", "Risk"],
    deadline: "31 Jul 2025",
    readiness: 62,
  },
  {
    id: 2,
    regulator: "PRA",
    source: "pra",
    priority: "high",
    status: "pending",
    title: "PRA CP5/25 – Basel 3.1 Capital Requirements Implementation",
    date: "25 Apr 2025",
    type: "Consultation Paper",
    summary:
      "The PRA is consulting on final rules implementing Basel 3.1, including revised credit risk, market risk, and operational risk frameworks. UK banks face significant RWA recalculations.",
    impact:
      "Banks with significant trading books or mortgage portfolios will need to remodel risk-weighted assets. Capital planning assumptions should be revisited ahead of January 2026 implementation.",
    tags: ["Banking", "Risk", "Operations"],
    deadline: "15 Jan 2026",
    readiness: 34,
  },
  {
    id: 3,
    regulator: "HM Treasury",
    source: "hmt",
    priority: "medium",
    status: "new",
    title: "HMT – Financial Services and Markets Act 2025 Secondary Legislation",
    date: "22 Apr 2025",
    type: "Legislation",
    summary:
      "HM Treasury has laid before Parliament secondary legislation under FSMA 2025, introducing new competitiveness objectives for both FCA and PRA, with enhanced international regulatory co-operation provisions.",
    impact:
      "Compliance and legal teams should update regulatory monitoring frameworks to capture the new competitiveness objective. International firms need cross-border gap analyses.",
    tags: ["Compliance", "Legal", "All Firms"],
    deadline: "30 Jun 2025",
    readiness: 55,
  },
  {
    id: 4,
    regulator: "FCA",
    source: "fca",
    priority: "medium",
    status: "pending",
    title: "FCA DP24/4 – AI & Advanced Analytics in Financial Services",
    date: "18 Apr 2025",
    type: "Discussion Paper",
    summary:
      "The FCA has opened a discussion on regulatory expectations for AI model governance, explainability requirements, and consumer protection in AI-driven financial products.",
    impact:
      "Firms using AI in credit decisioning, algorithmic trading, or personalised product recommendations must begin preparing governance documentation now, ahead of expected final rules in 2026.",
    tags: ["Compliance", "Risk", "Investment", "Fintech"],
    deadline: "30 Sep 2025",
    readiness: 20,
  },
  {
    id: 5,
    regulator: "EU",
    source: "eu",
    priority: "medium",
    status: "implemented",
    title: "DORA – Digital Operational Resilience Act – Full Application",
    date: "17 Jan 2025",
    type: "Regulation",
    summary:
      "DORA entered full application across EU financial entities from 17 January 2025. UK firms with EU subsidiaries must comply with ICT risk management, incident reporting, and third-party provider oversight requirements.",
    impact:
      "UK firms with EU-regulated entities need operational resilience programmes aligned to DORA. Third-party ICT contracts must be reviewed and may need renegotiation.",
    tags: ["Operations", "Risk", "Insurance", "Banking"],
    deadline: "Implemented",
    readiness: 78,
  },
  {
    id: 6,
    regulator: "PRA",
    source: "pra",
    priority: "low",
    status: "implemented",
    title: "PRA SS1/25 – Model Risk Management Principles",
    date: "05 Apr 2025",
    type: "Supervisory Statement",
    summary:
      "The PRA has finalised supervisory expectations for model risk management. Firms must maintain model inventories, conduct ongoing validation, and hold capital buffers for model uncertainty.",
    impact:
      "Risk teams should audit existing model governance frameworks against the PRA's finalised expectations. New capital buffer calculations may be required.",
    tags: ["Banking", "Risk", "Compliance"],
    deadline: "Implemented",
    readiness: 88,
  },
  {
    id: 7,
    regulator: "FCA",
    source: "fca",
    priority: "high",
    status: "new",
    title: "FCA – Mortgage Market Review: Affordability Rule Changes",
    date: "29 Apr 2025",
    type: "Policy Statement",
    summary:
      "The FCA has announced targeted changes to mortgage affordability assessment rules, removing the interest rate stress test requirement for remortgagors with no additional borrowing, effective immediately.",
    impact:
      "Mortgage lenders must update affordability calculation systems and credit policies immediately. Compliance teams should issue updated guidance to underwriting functions within 5 business days.",
    tags: ["Banking", "Compliance", "Operations"],
    deadline: "Immediate",
    readiness: 45,
  },
];

export const JURISDICTIONS: Jurisdiction[] = [
  { code: "UK", label: "United Kingdom", color: "#6384ff", active: true },
  { code: "EU", label: "European Union", color: "#fbbf24", active: true },
  { code: "US", label: "United States", color: "#34d399", active: false },
  { code: "HK", label: "Hong Kong", color: "#f87171", active: false },
  { code: "SG", label: "Singapore", color: "#a78bfa", active: false },
  { code: "CH", label: "Switzerland", color: "#38bdf8", active: false },
];

export const AUDIT: AuditEntry[] = [
  { ts: "2025-04-29 09:42", label: "Scan completed", detail: "3 new regulatory updates detected from FCA website" },
  { ts: "2025-04-29 08:15", label: "Alert dispatched", detail: "FCA Mortgage Market Review sent to 4 users" },
  { ts: "2025-04-28 17:30", label: "Q&A query logged", detail: '"What are the Basel 3.1 capital changes?" (answered)' },
  { ts: "2025-04-28 14:10", label: "Compliance record updated", detail: "PRA CP5/25 readiness set to 34%" },
  { ts: "2025-04-28 09:00", label: "Automated scan", detail: "HM Treasury, FCA, PRA websites scanned; 1 new document found" },
  { ts: "2025-04-27 16:55", label: "User alert", detail: "DORA status updated to Implemented" },
  { ts: "2025-04-27 10:30", label: "Report generated", detail: "Monthly compliance summary exported" },
  { ts: "2025-04-26 08:00", label: "Scheduled scan", detail: "All monitored sources checked; 0 new items" },
];

export const IMPACT: ImpactRow[] = [
  { reg: "Consumer Duty PS25/1", banking: "High", invest: "High", insure: "Medium", comp: "High", ops: "Medium" },
  { reg: "Basel 3.1 CP5/25", banking: "High", invest: "Medium", insure: "Low", comp: "High", ops: "High" },
  { reg: "FSMA 2025 Secondary", banking: "Medium", invest: "Medium", insure: "Medium", comp: "High", ops: "Low" },
  { reg: "AI/Analytics DP24/4", banking: "Medium", invest: "High", insure: "Medium", comp: "High", ops: "Medium" },
  { reg: "DORA", banking: "High", invest: "Medium", insure: "High", comp: "Medium", ops: "High" },
  { reg: "MRM SS1/25", banking: "High", invest: "High", insure: "Low", comp: "Medium", ops: "Medium" },
  { reg: "Mortgage Rules", banking: "High", invest: "Low", insure: "None", comp: "High", ops: "High" },
];

export function getRegulation(id: number): Regulation | undefined {
  return REGULATIONS.find((r) => r.id === id);
}
