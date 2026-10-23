# Feature: Public Landing Page

## Product Intent

Give a prospective Bravo Ai user a concise, accurate introduction to the product before sign-in, without exposing sensitive implementation details or API documentation.

## Current Behavior

- `/` presents the product purpose, dashboard preview, monitoring/AI/audit benefits, workflow overview and sign-up/sign-in paths.
- The “What to expect inside” article explains the post-sign-in workflow: choose a jurisdiction and relevant business scope, review and prioritise updates, then use impact, readiness and audit information to evidence a response.
- It explicitly states that official regulator publications remain the authoritative source. The landing page does not link to API documentation.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → “Public landing page”
- Gherkin: `../../../features/05-platform/landing-page.feature`
- Implementation: `../../../implementation/epic-09-presentation-and-appearance/`
