const BETA_JURISDICTION_CODES = new Set(["EU", "US", "HK", "SG", "CH"]);
const JURISDICTION_DISPLAY_ORDER = ["NG", "UK", "EU", "US", "HK", "SG", "CH"];

export function isBetaJurisdiction(code: string) {
  return BETA_JURISDICTION_CODES.has(code);
}

export function compareJurisdictionDisplayOrder(left: string, right: string) {
  const leftIndex = JURISDICTION_DISPLAY_ORDER.indexOf(left);
  const rightIndex = JURISDICTION_DISPLAY_ORDER.indexOf(right);
  return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex) || left.localeCompare(right);
}
