# Feature: Search And AI Q&A

## Product Intent

Let a compliance officer ask a plain-English question about UK financial regulation and get an answer grounded in the firm's tracked regulations, with citations — not a general chatbot, and not a keyword search that dead-ends.

## Current Behavior

- `/search` shows a search box, four quick-question shortcut buttons (FCA Consumer Duty, PRA Capital, DORA, ESG Reporting), and an AI Q&A panel (`components/QAPanel.tsx`).
- A second Q&A panel instance appears on the Dashboard (`variant="dashboard"`).
- Pressing Enter in the search box or clicking a quick-question button pre-fills the Q&A panel's input; the user still clicks "Ask" to submit (this is a deliberate simplification from the original prototype's auto-submit-on-Enter behavior — see Epic 01 notes).
- Submitting calls a placeholder endpoint (`https://api.bravoai.app/v1/query`, which does not exist) and will always show an error today. This is expected, not a bug — see `../../architecture/02-api-and-client-integration.md`.

## Known Gaps

- No real AI provider is wired up. `app/api/query/route.ts` exists and returns `501` — see `../../decisions/0002-anthropic-server-side-ai.md`.
- `QAPanel.tsx`'s request/response shape (`{ question } → { answer }`) doesn't yet match `/api/query`'s real contract — needs reconciling when Phase 4 lands.
- Search doesn't search a regulation database; it only feeds text into the Q&A panel (inherited from the original prototype's design, not yet reconsidered).

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Search and AI Q&A"
- Gherkin: `../../../features/03-analysis/search-and-qa.feature`
- Implementation: `../../../implementation/epic-04-secure-ai-qa/`
