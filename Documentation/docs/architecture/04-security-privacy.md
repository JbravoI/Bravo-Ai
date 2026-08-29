# Security And Privacy

Source: findings from `../../REGWATCH_CODE_REVIEW.md`, carried forward as binding rules rather than historical notes.

## Secrets

- No AI provider API key, database connection string, or regulator-source credential may ever be present in a client-side bundle or a browser-visible `fetch` call.
- The original prototype had a placeholder API key (`YOUR-API-KEY-HERE`) called directly from browser JavaScript. This pattern must not recur. Gemini calls happen inside `app/src/app/api/query/route.ts` (a Route Handler, server-side only), reading `GEMINI_API_KEY` from an environment variable.
- `app/src/app/swagger-static/[file]/route.ts` reads from `node_modules` by an explicit filename allowlist — never widen it to accept an arbitrary path parameter.
- `app/next.config.ts` applies Content-Security-Policy, anti-framing, MIME-sniffing, referrer, and browser-permission headers to every route. The CSP limits all resource types to the application origin by default; the narrowly scoped inline allowances remain necessary for Next.js runtime bootstrap and framework-injected styles.

## XSS / Untrusted Content

- Never use `innerHTML` or React's `dangerouslySetInnerHTML` with a string built from user input, AI output, or externally-fetched data (regulator source text, once Phase 5 ingests it).
- Current components render all dynamic text as JSX children or `textContent`-equivalent (React's default escaping) — `app/src/components/AlertCard.tsx`, `app/src/components/RegulationModal.tsx`, `app/src/components/QAPanel.tsx`, `app/src/components/AuditLog.tsx` all follow this. `app/src/components/AuditLog.tsx` intentionally splits audit entries into a `label` + `detail` pair (see `app/src/lib/types.ts`'s `AuditEntry`) specifically so no markup-string parsing is ever needed to render a bold lead-in.
- If AI-generated Markdown ever needs rich rendering (bold, links, lists) in the Q&A panel, route it through a maintained sanitizer (e.g. DOMPurify) — do not hand-roll markdown-to-HTML.

## Auth (Built — Epic 03)

- Auth.js v5, Credentials provider (email/password, `bcryptjs`-hashed, JWT session) — see `../decisions/0006-authjs-credentials-not-oauth.md`. Passwords are never stored or logged in plaintext; only the bcrypt hash is persisted (`users` collection).
- `app/src/proxy.ts` gates every UI page behind a valid session, redirecting unauthenticated visitors to `/login`. **`/api/**` is deliberately excluded** — it remains the public, independently-testable surface Epic 02 built (Swagger UI's "Try it out" depends on this staying unauthenticated). `/api/preferences` and `/api/scan` are exceptions: they check `auth()` and return `401` without a session. Scan runs may alternatively be triggered by Vercel Cron using the server-only `CRON_SECRET` bearer token.
- `AUTH_SECRET` (JWT signing key) is a required environment variable, handled with the same care as `MONGODB_URI` — never committed, required in `app/.env.local`, Vercel's dashboard, and GitHub Actions secrets. See `../../deployment.md`.

## AI Q&A Server Controls (Phase 4 — Built)

- `/api/query` requires a signed-in session, applies a process-local eight-request-per-minute guard, uses a 20-second timeout, and retries one transient provider failure.
- Every completed exchange is logged to `qa_log` (see `03-data-model.md`) with the provider and model, providing compliance traceability.
- The system prompt and regulation context are constructed server-side. The API accepts only a question and never accepts a client-supplied system prompt.

## Data Retention And Dates

- Dates are stored and passed as ISO 8601 values, then formatted only at the render boundary through `app/src/lib/dates.ts`. New seed and FCA records are already ISO-formatted; run `npm run migrate:dates` once in each existing database environment to convert legacy seed records.
- FCA items ingested in Phase 5 retain `sourceUrl` and `retrievedAt` so each record can be traced back to the original regulator publication. The connector accepts only HTTPS links on `www.fca.org.uk`; externally supplied text remains React-escaped at render time.

## Non-Goals (Explicitly Out Of Scope For Now)

- Formal penetration testing / third-party security audit — appropriate once Phase 4 (AI) is built too, not before.
- OAuth sign-in, invite-only signup, email verification, password reset — none built; see Epic 03's "Deliberately Out Of Scope" section.
