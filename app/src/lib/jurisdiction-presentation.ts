const BETA_JURISDICTION_CODES = new Set(["EU", "US", "HK", "SG", "CH"]);

export function isBetaJurisdiction(code: string) {
  return BETA_JURISDICTION_CODES.has(code);
}
