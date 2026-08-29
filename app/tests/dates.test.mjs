import assert from "node:assert/strict";
import test from "node:test";
import { formatDate, toIsoDate } from "../src/lib/dates.ts";

test("normalizes a legacy display date to ISO 8601", () => {
  assert.equal(toIsoDate("28 Apr 2025"), "2025-04-28");
});

test("formats an ISO date only at the display boundary", () => {
  assert.equal(formatDate("2025-04-28"), "28 Apr 2025");
});

test("safely displays legacy and non-date labels during migration", () => {
  assert.equal(formatDate("31 Jul 2025"), "31 Jul 2025");
  assert.equal(formatDate("Immediate"), "Immediate");
});
