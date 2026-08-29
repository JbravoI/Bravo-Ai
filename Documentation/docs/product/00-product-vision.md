# Product Vision

## Problem

UK financial-services compliance teams track regulatory change across the FCA, PRA, HM Treasury and EU by manually watching regulator websites, mailing lists and policy papers. Updates arrive with real deadlines, affect specific business areas differently, and require an auditable trail showing what was known, when, and what the firm did about it. Spreadsheets and email don't hold up to that.

## Product Thesis

Regulatory monitoring is a pipeline, not a document pile: detect a change at the source, classify its priority and affected business areas, track the firm's readiness against its deadline, and keep an auditable record of every scan and decision. If a compliance team can see this in one place with real citations back to the source document, they spend less time hunting for updates and more time acting on them.

## Target Users

- Compliance officers at UK banks, investment firms and insurers who need to track FCA/PRA/HMT/EU updates against internal deadlines.
- Risk and legal teams who need traceable, citable answers to "what changed and what does it mean for us."
- Executives who need a readiness/compliance-score view without reading primary source documents.

## Differentiators

- Full-pipeline tracking: source scan → classification → readiness → audit trail, not just a news feed.
- Business-area impact mapping (Banking, Investment, Insurance, Compliance, Operations) per regulation, not a generic tag list.
- AI Q&A grounded in the firm's own tracked regulations, with source citations — not a general-purpose chatbot bolted on.
- An honest audit trail: every scan, alert and Q&A exchange is logged for compliance traceability, not just a UI convenience.

## Product Shape

The core loop is:

1. **Scan** official regulator sources (FCA, PRA, HM Treasury, EU) for new or changed publications.
2. **Classify** each update: regulator, type, priority, deadline, affected business areas, and a plain-English summary of what it means for the firm.
3. **Track readiness** against each regulation's deadline, and surface high-priority/near-deadline items on the dashboard.
4. **Answer questions** grounded in the tracked regulation set, with citations back to source documents.
5. **Record everything** — scans, alerts, preference changes and Q&A exchanges — in an audit trail a compliance team can rely on.

This is what separates the product from a demo: the same loop must work with a compliance officer's actual regulatory landscape, not seven hard-coded sample records. See `../../STRATEGY.md` §1 for the concrete "not a demo" definition of done this vision is built against.

## Out Of Scope (For Now)

- Jurisdictions beyond UK/EU (US, Hong Kong, Singapore, Switzerland exist as UI toggles today but have no real source scanning behind them).
- Multi-tenant/multi-org support — see `../decisions/` for the open decision.
- Anything resembling legal advice. Generated summaries and AI answers are decision support, not a substitute for legal review.
