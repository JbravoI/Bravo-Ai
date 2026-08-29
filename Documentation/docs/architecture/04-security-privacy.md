# Security And Privacy

Source: findings from `../../REGWATCH_CODE_REVIEW.md`, carried forward as binding rules rather than historical notes.

## Secrets

- No AI provider API key, database connection string, or regulator-source credential may ever be present in a client-side bundle or a browser-visible `fetch` call.
- The original prototype had a placeholder API key (`YOUR-API-KEY-HERE`) called directly from browser JavaScript. This pattern must not recur. When Phase 4 wires up a real AI provider, the call happens inside `app/src/app/api/query/route.ts` (a Route Handler, which runs server-side only), reading the key from an environment variable.
- `app/src/app/swagger-static/[file]/route.ts` reads from `node_modules` by an explicit filename allowlist — never widen it to accept an arbitrary path parameter.

## XSS / Untrusted Content

- Never use `innerHTML` or React's `dangerouslySetInnerHTML` with a string built from user input, AI output, or externally-fetched data (regulator source text, once Phase 5 ingests it).
- Current components render all dynamic text as JSX children or `textContent`-equivalent (React's default escaping) — `app/src/components/AlertCard.tsx`, `app/src/components/RegulationModal.tsx`, `app/src/components/QAPanel.tsx`, `app/src/components/AuditLog.tsx` all follow this. `app/src/components/AuditLog.tsx` intentionally splits audit entries into a `label` + `detail` pair (see `app/src/lib/types.ts`'s `AuditEntry`) specifically so no markup-string parsing is ever needed to render a bold lead-in.
- If AI-generated Markdown ever needs rich rendering (bold, links, lists) in the Q&A panel, route it through a maintained sanitizer (e.g. DOMPurify) — do not hand-roll markdown-to-HTML.

## Auth (Built — Epic 03)

- Auth.js v5, Credentials provider (email/password, `bcryptjs`-hashed, JWT session) — see `../decisions/0006-authjs-credentials-not-oauth.md`. Passwords are never stored or logged in plaintext; only the bcrypt hash is persisted (`users` collection).
- `app/src/proxy.ts` gates every UI page behind a valid session, redirecting unauthenticated visitors to `/login`. **`/api/**` is deliberately excluded** — it remains the public, independently-testable surface Epic 02 built (Swagger UI's "Try it out" depends on this staying unauthenticated). `/api/preferences` is the one exception: it checks `auth()` itself and returns `401` without a session, since preferences are inherently per-user and have no meaningful unauthenticated response.
- `AUTH_SECRET` (JWT signing key) is a required environment variable, handled with the same care as `MONGODB_URI` — never committed, required in `app/.env.local`, Vercel's dashboard, and GitHub Actions secrets. See `../../deployment.md`.

## AI Q&A Server Requirements (Phase 4)

Once `/api/query` is real, it must:

- Decide whether it requires a signed-in session (auth now exists to support this if desired) — not yet decided.
- Rate-limit and apply a timeout/retry policy.
- Log every exchange to `qa_log` (see `03-data-model.md`) — this doubles as the compliance audit trail for AI usage, which matters because answers may inform real regulatory decisions.
- Never accept a client-supplied system prompt — the system prompt is fixed server-side.

## Data Retention And Dates

- Use ISO 8601 (`2026-08-29`) for all dates stored or passed between server and client; format for display only at the render boundary. The database (MongoDB Atlas, live as of Epic 02) currently still stores the original display-formatted strings (`"28 Apr 2025"`) carried over from the seed script — reformatting these is Epic 06 (hardening) work, now that a real database exists to reformat.
- Source documents ingested in Phase 5 must retain `document_url` and `retrieved_at` so every claim is traceable back to the original regulator publication — required for a compliance tool to be trustworthy, not optional polish.

## Non-Goals (Explicitly Out Of Scope For Now)

- Formal penetration testing / third-party security audit — appropriate once Phase 4 (AI) is built too, not before.
- Content Security Policy hardening — tracked in Epic 06 (hardening), which also removes any remaining inline event handlers that would block a strict CSP.
- OAuth sign-in, invite-only signup, email verification, password reset — none built; see Epic 03's "Deliberately Out Of Scope" section.
