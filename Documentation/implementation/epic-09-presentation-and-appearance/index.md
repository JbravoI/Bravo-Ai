# Epic 09: Personalised Product Presentation And Appearance

**Status:** `Implemented`
**Maps To:** `../../STRATEGY.md` Phase 9
**Target Surface(s):** Public landing page, Preferences, root layout, `user_preferences`

---

## Delivered

- A concise landing-page article that explains what Bravo Ai does, the post-sign-in workflow, and the role of official sources.
- Persisted `light`, `dark` and `system` appearance preferences. The root layout reads the saved value before rendering, avoiding a wrong-theme flash; choosing a theme also updates the document immediately after a successful save.
- `*Beta` labels for EU, US, HK, SG and CH in the jurisdiction selector. UK and Nigeria remain unlabelled.

## Verification

- TypeScript, ESLint and existing automated tests pass.
- Manual checks: save every appearance option; reload; use a browser whose OS scheme differs from the saved explicit theme; and confirm a Browser preference follows the OS scheme.
