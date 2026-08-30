import type { Source } from "./types";

const JURISDICTION_SOURCES: Record<string, Source[]> = {
  UK: ["fca", "pra", "hmt"],
  EU: ["eu"],
  NG: ["ng"],
};

export function sourcesForJurisdiction(code: string): Source[] {
  return JURISDICTION_SOURCES[code] ?? [];
}

export function selectedJurisdictionCode(savedCodes: string[] | undefined, availableCodes: string[]) {
  return savedCodes?.find((code) => availableCodes.includes(code)) ?? (availableCodes.includes("UK") ? "UK" : availableCodes[0]);
}
