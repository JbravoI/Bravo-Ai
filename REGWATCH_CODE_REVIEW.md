# RegWatch Code Review

**Source reviewed:** `Regwatch code.txt` (784 lines)

## Summary

This is a single-page, front-end prototype for **RegWatch AI**, a regulatory-monitoring dashboard aimed at UK financial-services teams. It combines HTML markup, CSS styling, and browser JavaScript in one file. It is a polished interface prototype, but it is not yet a live regulatory-monitoring product: the alerts, metrics, audit entries, and scan results are currently sample data or simulations.

## What the code does

- Renders a dark-themed dashboard with a sidebar and pages for alerts, compliance readiness, search/Q&A, impact mapping, audit history, and preferences.
- Shows seven hard-coded regulatory updates from the FCA, PRA, HM Treasury, and the EU, including priority, status, deadline, readiness, impact, and business-area tags.
- Filters regulatory alerts by source and opens a modal with each alert's summary, business impact, and affected areas.
- Builds the compliance and impact tables, audit trail, and jurisdiction controls dynamically from JavaScript arrays.
- Provides two Q&A entry points. Each sends the user's question and a system prompt to `https://api.regwatch.ai/v1/query`.
- Simulates a “Scan Now” action with a 2.2-second delay and adds an in-memory audit entry.
- Lets the user visually toggle jurisdictions and pre-fill common Q&A questions.

## Current limitations

- The regulation records, dashboard numbers, audit log, and compliance score are hard-coded. They do not come from official regulator sources or a database.
- “Scan Now” is simulated; it does not scan FCA, PRA, HM Treasury, or EU sources. The “Last scan” label is later changed to a random number of minutes, so it is not a reliable operational status.
- The search box does not search a regulation database. It transfers the entered text to the AI Q&A panel instead.
- Preferences and jurisdiction choices are only held in the browser's memory. They disappear after refresh and do not affect alerts or notifications.
- The Q&A call uses a placeholder API key, so it will not work until a real service is configured.
- The data is dated January–April 2025. It should be treated as demo data until it is replaced with verified, dated source material.

## Improvements

### 1. Secure the AI/API integration first

Do not put a real API key in browser code. If a real key replaces `YOUR-API-KEY-HERE`, every visitor could retrieve and misuse it. Move the provider request to a server-side endpoint and store the key in server environment variables or a secret manager.

The server should also authenticate users, authorise access, validate requests and responses, apply rate limits, set timeouts/retries, and log activity safely. This is particularly important because the application handles compliance-related questions.

### 2. Prevent cross-site-scripting (XSS)

Several render functions use `innerHTML`, including `addMsg()` for user questions and AI responses. Any untrusted text inserted this way can become executable markup. The same risk will apply to regulation records once they are fetched from external sources.

Build message and record elements with DOM APIs and `textContent` instead, or sanitize intentionally rich content with a well-maintained sanitizer. Do not rely on data being trusted just because it came from an AI or an upstream API.

### 3. Replace the prototype data with a real monitoring workflow

Add a backend process that collects or receives updates from official regulatory sources, validates and stores them in a database, and tracks:

- Source URL, regulator, document reference, publication date, retrieval date, and document version.
- Classification, deadlines, affected business areas, and human-review status.
- Scan history, changes from previous versions, user acknowledgements, and notifications.
- Clear source citations and a human-review/legal-disclaimer workflow for AI-generated summaries.

Dashboard counts, badges, readiness figures, and audit entries should be calculated from that stored data rather than written into the page as fixed values.

### 4. Make application state real and persistent

Save jurisdiction, industry, and alert preferences to a user profile or secure browser storage as appropriate. Apply those preferences when filtering alerts and sending notifications. Re-render the audit view immediately after a scan, rather than waiting for the user to navigate away and back.

Use ISO 8601 dates internally (for example, `2026-08-28`) and format them for display. This permits correct sorting, deadline calculations, and time-zone handling.

### 5. Improve maintainability

The file contains all markup, styles, data, and behaviour in roughly 44 KB of inline code. It also has inline `onclick`/`onkeydown` handlers and global `window.rw...` functions. These make the code harder to test, reuse, and secure with a strict Content Security Policy.

Split responsibilities into modules, attach events with `addEventListener`, keep state in a defined store, and add linting and tests. There is also a functional issue in `rwFilter()`: it selects every `.ftab` in the application, so filtering alerts can modify the unrelated Industry Focus buttons. Scope each filter group to its own container and retain separate state for each view.

### 6. Improve accessibility and responsive behaviour

Replace clickable `<div>` elements with semantic buttons or links. Add keyboard support, accessible names and states, and useful focus styles. The modal should use dialog semantics, trap focus while open, restore focus when closed, and announce updates appropriately.

On small screens, the sidebar disappears without an alternative navigation control. Add a mobile menu and make the data tables horizontally scrollable or present them as responsive cards.

## Recommended file format

**For the code as it exists today, use a UTF-8 HTML file:** `regwatch.html`.

The file contains HTML, CSS, and JavaScript, so `.txt` is only suitable for sharing its source as plain text. Renaming it to `.html` allows a browser to render it as a web page. To make it a proper standalone page, wrap the existing content in a normal document structure with `<!doctype html>`, `<html>`, `<head>`, and `<body>`, including a viewport meta tag.

For a maintainable vanilla-JavaScript application, use this structure:

```text
regwatch/
├── index.html          # Page structure and references to assets
├── styles.css          # CSS currently inside <style>
├── app.js              # UI state, rendering, and event listeners
├── api.js              # Browser calls to this application's backend only
├── data.js             # Demo data only; remove when a backend is available
└── server/             # Authenticated API, scanning, database, and secrets
```

Use `.jsx` or `.tsx` only if the surrounding project already uses React. A framework migration is not required merely to correct the extension; `.html`, `.css`, and JavaScript modules are a suitable foundation for this interface.

## Recommended next step

Rename the source to `regwatch.html` for immediate browser use, then prioritise a secure backend and trusted regulatory data before presenting the dashboard as live or using it for compliance decisions.
