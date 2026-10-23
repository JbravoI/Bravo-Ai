# Bravo Ai — Stage 2 Strategy: Tax Calculator

## 1. Purpose and product boundary

Stage 2 adds a distinct **Tax Calculator** product to Bravo Ai. Once authenticated, a user should choose one of three products:

1. **Compliance Platform** — the existing regulatory-monitoring product.
2. **Tax Calculator** — Stage 2.
3. **Expense Tracker** — reserved for Stage 3 and shown as unavailable until it is built.

Each product needs its own dashboard and navigation state. They may share authentication, user profile, theme, country preferences, audit infrastructure, and Bravo Ai branding; they must not mix their domain data or dashboards. A tax calculation must never appear in the compliance audit/activity views unless a deliberately designed, privacy-safe cross-product audit entry is added later.

## 2. Confirmed Stage 2 requirements

### 2.1 Product selection after login

After a successful login, users are directed to a product selector (or a remembered default product, once that option exists). The selector presents Compliance Platform, Tax Calculator, and the future Expense Tracker.

### 2.2 Tax dashboard

The Tax dashboard uses the user's country preference to present:

- A concise, dated overview of the country's tax system.
- Relevant tax types, such as income tax, payroll/social-security contributions, consumption tax/VAT, capital gains tax, corporate tax, and local taxes where applicable.
- Official-source links for further reading.
- The effective date and source date for every policy summary.
- A clear indication when content is unavailable, stale, beta, or awaiting review.

AI can help turn trusted, sourced material into readable summaries. It should not be the authoritative source of a tax rule and must not invent rates, thresholds, deadlines, or eligibility criteria.

### 2.3 Tax calculator

The calculator should guide the user through a country-specific questionnaire, including at minimum:

- Income amount and frequency (monthly or annual).
- Employment/self-employment income type where supported.
- Tax year.
- Currency.
- Residence and filing assumptions required by the selected country.
- Allowed deductions, reliefs, contributions, or explicitly non-deductible items.
- Other country-specific questions that materially change the calculation.

It should return a transparent estimate covering:

- Taxable income and the deductions/reliefs applied.
- Each calculated tax or mandatory contribution, with rate bands where relevant.
- Total estimated liability.
- Estimated net/take-home amount for both the entered period and the equivalent monthly/annual period.
- Assumptions, caveats, policy version, and links to the supporting official sources.

The user can ask Bravo Ai questions about the completed calculation. That conversation must be tied to the calculation context, cite the applied assumptions and sources, and avoid presenting legal or tax advice as fact.

### 2.4 Exports and disclaimer

Users should be able to download:

- A tax calculation report (initially PDF is recommended, with CSV/JSON data export considered later).
- Their question-and-answer conversation for that calculation (PDF or plain text/Markdown is sufficient initially).

Every calculator screen, result, conversation, and export must carry a prominent disclaimer: it is an estimate for informational purposes, not tax, legal, accounting, or financial advice; users should consult a qualified tax professional and the relevant tax authority for decisions or filing.

## 3. Key product recommendations

### 3.1 Do not use a single ambiguous “country preference”

The existing Compliance preference represents the jurisdiction whose regulations the user follows. Tax calculations need a separate **Tax Profile**, starting with `taxResidenceCountry`, tax year, currency, and country-specific filing assumptions. A person can monitor UK compliance obligations while being tax-resident in Nigeria; silently reusing one setting would produce incorrect results.

The UI may offer an “Use my compliance jurisdiction” convenience action, but it must require confirmation and keep the settings stored separately. Initially, support one active tax-residence country per user, matching the requested one-country-at-a-time preference model.

### 3.2 Rules engine first; AI second

The core calculation must be deterministic code driven by reviewed, versioned tax rules. AI should be used only to:

- Explain a completed deterministic calculation in plain language.
- Summarise approved, sourced tax content.
- Answer contextual questions with a constrained prompt and source links.

AI must not select tax bands, change a result, decide eligibility, or silently fill in missing information. This is the main reliability and liability control for a tax product.

### 3.3 Start deliberately narrow

The highest-quality first release is a clearly bounded employee-income estimator for one country and one tax year, rather than an apparently universal calculator. Nigeria is the natural first country because it is already an active Bravo Ai jurisdiction; the United Kingdom can follow once its rules and tests are separately approved.

The first release should explicitly exclude, unless implemented and tested: complex self-employment, multiple employments, cross-border taxation, marriage/household filing choices, stock compensation, cryptocurrency, capital gains, rental income, corporate tax, tax credits with nuanced eligibility, and filing submission. The product should say which cases are outside scope before users calculate.

### 3.4 Treat policy data as a regulated content set

Tax rates and rules change. Each country/year rule set needs: source URL, source title, effective date, retrieval/review date, author/reviewer, status (draft/reviewed/published/retired), and a stable version. Published calculations store the exact rule version used, so a historical report can be reproduced after rates change.

Sources should be primary authority pages first (for example, a national revenue authority or official legislation portal), with reputable secondary explanations only as labelled supplemental material.

### 3.5 Protect sensitive financial data

Income and deductions are sensitive personal data. Store only what is needed, encrypt in transit, restrict records to the owning user and authorised administrators, and provide a deletion/retention policy before launch. Do not send raw historical calculations to an AI model unless the user requests an explanation and the privacy notice clearly covers that processing. Redact or minimise the prompt wherever possible.

## 4. Proposed user experience

```text
Login
  └─ Product selector
       ├─ Compliance Platform → existing compliance dashboard
       ├─ Tax Calculator → Tax dashboard
       │    ├─ Country overview and official links
       │    ├─ Start calculation
       │    │    ├─ Tax Profile / country and tax year
       │    │    ├─ Income and deductions questionnaire
       │    │    ├─ Validation and assumptions review
       │    │    └─ Result, breakdown, disclaimer, export, Ask Bravo Ai
       │    └─ Saved calculation history (later Stage 2 increment)
       └─ Expense Tracker → “Coming in Stage 3”
```

The Tax dashboard should distinguish clearly between “policy overview” and “your estimate.” The overview is country content. A calculation is private user data. The result page should show an itemised breakdown before the conversational AI panel, so users can understand the basis of the answer without relying on AI.

## 5. Proposed data and service design

New data should be isolated from regulation collections:

```text
tax_profiles
  user_id, tax_residence_country, default_tax_year, currency,
  filing_assumptions, updated_at

tax_rule_sets
  id, country_code, tax_year, version, status, effective_from,
  source_metadata, reviewed_by, reviewed_at, published_at

tax_rule_components
  rule_set_id, component_type, parameters_json, source_reference

tax_calculations
  id, user_id, rule_set_id, submitted_inputs, derived_values,
  result_breakdown, disclaimer_version, created_at

tax_conversations
  id, calculation_id, user_id, question, answer, citations,
  model_metadata, created_at

tax_exports
  id, user_id, calculation_id, export_type, generated_at, expires_at

audit_log
  event type and metadata only; do not put income amounts in generic audit text
```

API routes should authenticate every request and enforce record ownership. A calculation route should accept validated questionnaire inputs, select an already-published rule version, run deterministic calculations server-side, and return an auditable result. An AI route should accept only a calculation ID and a question, load the saved result server-side, and never trust client-provided totals or rules.

## 6. Delivery plan

### Stage 2.0 — Discovery, scope, and legal/content approval

- Select the first country, tax year, supported taxpayer type, and permitted income types.
- Identify and approve primary sources.
- Write the product disclaimer, privacy/retention position, and escalation text for out-of-scope cases.
- Define calculation acceptance examples with a tax professional or appropriately qualified reviewer.
- Decide whether account administrators can see only anonymised usage metrics or any individual calculation data. The recommended default is no access to individual financial records.

**Exit criteria:** a signed-off first-country scope and a reviewed set of test scenarios with expected outcomes.

### Stage 2.1 — Product entry and Tax Profile

- Add the post-login product selector and product-specific routes/layouts.
- Add Tax Profile preferences separately from Compliance preferences.
- Provide a first-country overview page with sourced static/reviewed content and source metadata.
- Show Expense Tracker as unavailable, without exposing a non-functional dashboard.

**Exit criteria:** a user can choose Tax Calculator, select one tax-residence country, and see only that country’s overview.

### Stage 2.2 — Versioned rules and deterministic calculation

- Implement the reviewed tax-rule data model and publish workflow.
- Build the first-country questionnaire and server-side calculation engine.
- Show calculations with clear band-by-band breakdowns, assumptions, and error handling.
- Add automated unit tests for every rate band, boundary, deduction cap, invalid input, rounding rule, and monthly/annual conversion.

**Exit criteria:** known test cases match reviewer-approved expected outputs, and every result records its rule-set version.

### Stage 2.3 — Reporting, history, and AI explanation

- Save calculations securely and display a user-only history.
- Generate a downloadable, clearly labelled calculation report.
- Add conversation download.
- Add Bravo Ai calculation Q&A, grounded solely in the saved calculation, the approved rule set, and source citations.
- Audit export and AI-use events without recording financial figures in generic audit entries.

**Exit criteria:** a user can reproduce, download, and ask about a saved estimate without the AI changing the calculation.

### Stage 2.4 — Operational readiness and additional countries

- Add observability, rate limiting, abuse controls, retention/deletion controls, accessibility testing, and security review.
- Add a managed content-review process for annual or mid-year rule changes.
- Repeat the country onboarding process one country at a time; do not copy another country’s questionnaire or rates without local review.

**Exit criteria:** the first country is supportable in production, with documented ownership for policy updates.

## 7. Validation and quality process

Before each country is published:

1. Capture official rules and source URLs for a named tax year.
2. Convert the rules into a human-reviewable specification before coding them.
3. Implement deterministic formulas with explicit rounding conventions.
4. Test normal, boundary, zero-income, maximum-deduction, invalid, and out-of-scope cases.
5. Compare a representative test set with independently prepared expected calculations.
6. Have a qualified reviewer approve the rule version and the user-facing explanation.
7. Publish with an effective date, then monitor for authority updates and retire superseded versions without changing historical results.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Incorrect or outdated tax estimate | Reviewed and versioned rules, official sources, explicit tax year, scheduled content review, and visible effective dates. |
| AI hallucinates a rule or changes a result | Deterministic calculator is authoritative; AI receives the stored result and source context only; responses include citations and disclaimer. |
| Country tax systems are too complex for a generic form | Start with a narrow taxpayer scenario and declare exclusions before calculation. |
| Sensitive income data is overexposed | Record ownership checks, minimised AI prompts, strict retention/deletion controls, and no financial values in generic audit logs. |
| User assumes it is professional advice | Persistent plain-language disclaimer, out-of-scope warnings, and referral to a qualified professional. |
| Compliance and tax preferences conflict | Keep Tax Profile independent, with an explicit optional copy action only. |

## 9. Decisions needed before implementation

- Which country and tax year should launch first: Nigeria is recommended, but this requires approved source material and a reviewed taxpayer scope.
- Is the first release employee income only, or should self-employment be included? Employee income only is recommended.
- Should users be able to save calculations from day one, and how long should saved calculations/conversations be retained?
- Which export formats are required initially? PDF report plus text/Markdown conversation is recommended.
- Who is authorised to approve tax rules and policy updates before publication?
- What administrative visibility, if any, is appropriate for sensitive calculation records?
- Is the requested “AI-updated” country content generated on-demand, scheduled, or edited/reviewed before publication? The recommended model is scheduled retrieval plus human-reviewed publication, with AI only assisting the drafting.

## 10. Definition of done for Stage 2 first release

Stage 2 should be considered complete only when a signed-in user can choose Tax Calculator, configure a separate Tax Profile, read dated/sourced tax information for the selected country, produce a deterministic estimate within the declared scope, see a transparent monthly and annual breakdown, ask a constrained follow-up question, download their report/conversation, and understand the limitations and professional-advice disclaimer. Every calculation must be reproducible from its stored inputs and immutable rule-set version.
