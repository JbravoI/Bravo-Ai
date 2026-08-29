# Epic 00: Rebrand And Baseline Hygiene

**Status:** `Completed`
**Maps To:** `../../STRATEGY.md` Phase 0
**Target Surface(s):** `bravo-ai.html` (static prototype)

---

## Overview

Rebrand the RegWatch AI prototype to Bravo Ai, and fix the one concrete bug the code review identified, before any structural rebuild begins.

---

## Work Completed

- All `RegWatch`/`regwatch` text, ids (`#regwatch` → `#bravo-app`), CSS selectors, and JS function names (`rwPage` → `baPage`, etc.) renamed to Bravo Ai equivalents. Verified with a full-file grep showing zero remaining `regwatch`/`RegWatch`/`rw-` occurrences.
- The prototype wrapped in a proper standalone `<!doctype html>` document (it was previously an embeddable fragment) so it opens directly in a browser.
- Fixed: `baFilter()` previously ran `querySelectorAll('#bravo-app .ftab')` across the entire app, so clicking a Dashboard/Alerts filter tab silently cleared the unrelated Preferences → Industry Focus active state. Fixed by scoping the two alert-filter groups with a dedicated `.alert-filter` class and querying only within it.

## Acceptance Criteria

- [x] No `RegWatch`/`regwatch` string remains anywhere in the prototype file.
- [x] Filtering alerts does not change the Industry Focus toggle state.
- [x] The file opens correctly as a standalone page in a browser.
