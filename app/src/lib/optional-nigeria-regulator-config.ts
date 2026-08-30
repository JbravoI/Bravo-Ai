export const OPTIONAL_NIGERIA_REGULATORS = [
  { code: "ndic", label: "NDIC", regulator: "Nigeria Deposit Insurance Corporation (NDIC)", url: "https://ndic.gov.ng/news/", path: /\/news\//i, type: "Deposit-insurance update", tags: ["Banking", "Compliance"] },
  { code: "fccpc", label: "FCCPC", regulator: "Federal Competition and Consumer Protection Commission (FCCPC)", url: "https://fccpc.gov.ng/media/news-events/", path: /\/(media|news|event|press)/i, type: "Competition and consumer-protection update", tags: ["Compliance", "Operations"] },
  { code: "ndpc", label: "NDPC", regulator: "Nigeria Data Protection Commission (NDPC)", url: "https://ndpc.gov.ng/news/", path: /\/news\//i, type: "Data-protection update", tags: ["Compliance", "Operations", "Fintech"] },
  { code: "nfiu", label: "NFIU", regulator: "Nigerian Financial Intelligence Unit (NFIU)", url: "https://www.nfiu.gov.ng/", path: /NewsDetail/i, type: "AML/CFT update", tags: ["Banking", "Compliance", "Fintech"] },
  { code: "ngx-regco", label: "NGX RegCo", regulator: "NGX Regulation Limited (NGX RegCo)", url: "https://ngxgroup.com/regulation/", path: /\/(regulation|circular|rule|document)/i, type: "Exchange-regulation update", tags: ["Investment", "Compliance"] },
] as const;

export type OptionalNigeriaRegulatorCode = (typeof OPTIONAL_NIGERIA_REGULATORS)[number]["code"];
export const OPTIONAL_NIGERIA_REGULATOR_CODES = OPTIONAL_NIGERIA_REGULATORS.map((source) => source.code) as OptionalNigeriaRegulatorCode[];

export function normalizeOptionalNigeriaRegulatorCodes(values: unknown): OptionalNigeriaRegulatorCode[] {
  if (!Array.isArray(values) || !values.every((value) => typeof value === "string")) return [];
  return [...new Set(values.filter((value): value is OptionalNigeriaRegulatorCode => OPTIONAL_NIGERIA_REGULATOR_CODES.includes(value as OptionalNigeriaRegulatorCode)))];
}
