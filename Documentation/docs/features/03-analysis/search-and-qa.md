# Feature: Search And AI Q&A

## Product Intent

Let a compliance officer ask a plain-English question about UK financial regulation and get an answer grounded in the firm's tracked regulations, with citations — not a general chatbot, and not a keyword search that dead-ends.

## Current Behavior

- `/search` shows a search box, four quick-question shortcut buttons (FCA Consumer Duty, PRA Capital, DORA, ESG Reporting), and an AI Q&A panel (`app/src/components/QAPanel.tsx`).
- A second Q&A panel instance appears on the Dashboard (`variant="dashboard"`).
- Pressing Enter in the search box or clicking a quick-question button pre-fills the Q&A panel's input; the user still clicks "Ask" to submit (this is a deliberate simplification from the original prototype's auto-submit-on-Enter behavior — see Epic 01 notes).
- Submitting posts only `{ question }` to the app's authenticated `/api/query` endpoint. The server adds the fixed instruction and tracked-regulation context, calls Gemini 3.6 Flash, and returns `{ answer }`.

## Known Gaps

- Gemini API access requires the server-only `GEMINI_API_KEY`; a missing key returns an honest `501` response.
- Citation text is requested from Gemini, but citations are not yet a structured field in the response.
- Search doesn't search a regulation database; it only feeds text into the Q&A panel (inherited from the original prototype's design, not yet reconsidered).

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Search and AI Q&A"
- Gherkin: `../../../features/03-analysis/search-and-qa.feature`
- Implementation: `../../../implementation/epic-04-secure-ai-qa/`
