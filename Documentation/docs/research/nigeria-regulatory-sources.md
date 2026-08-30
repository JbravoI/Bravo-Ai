# Nigeria Regulatory Monitoring Sources

## Status

Nigeria (`NG`) is an active per-user jurisdiction. Live coverage includes CBN Monetary Policy Committee decisions, SEC Nigeria circulars, and the official NAICOM, PenCom and FRC publication feeds. This is still not complete Nigeria coverage: adding a jurisdiction must not be represented as complete regulator coverage until every source has been assessed for a stable publication feed, permitted access, parsing quality and operational ownership.

## Recommended source register

| Priority | Authority | Monitor for | Official publication surface |
| :--- | :--- | :--- | :--- |
| 1 | Central Bank of Nigeria (CBN) | Banking, microfinance, payments, FX, prudential supervision, AML/CFT and financial-system policy | [CBN publications, notices and circulars](https://www.cbn.gov.ng/Documents/) |
| 1 | Securities and Exchange Commission Nigeria (SEC Nigeria) | Capital markets, investment managers/advisers, collective investment schemes, digital assets, market conduct and enforcement | [SEC rules and regulations](https://sec.gov.ng/our-mandate/regulation/rules-and-regulations/) |
| 1 | National Insurance Commission (NAICOM) | Insurance/reinsurance licensing, solvency, conduct, prudential and governance requirements | [NAICOM](https://naicom.gov.ng/) |
| 1 | National Pension Commission (PenCom) | Pension fund administrators/custodians, investments, governance, circulars and consumer protection | [PenCom regulatory documents](https://www.pencom.gov.ng/category/regulations-codes/guidelines/) |
| 1 | Financial Reporting Council of Nigeria (FRC) | Financial reporting, audit, corporate governance and sustainability disclosure requirements | [FRC publications](https://frcnigeria.gov.ng/publications/) |
| 2 | Nigeria Deposit Insurance Corporation (NDIC) | Deposit insurance, bank-resolution and relevant supervisory/legal publications | [NDIC legal matters and regulations](https://ndic.gov.ng/resources/legal-matters-regulations/) |
| 2 | Federal Competition and Consumer Protection Commission (FCCPC) | Consumer protection, digital/online lending and fair-market requirements | [FCCPC digital-lending information](https://fccpc.gov.ng/registration-of-digital-money-lenders/) |
| 2 | Nigeria Data Protection Commission (NDPC) | Nigeria Data Protection Act implementation, privacy guidance, breach and controller/processor requirements | [NDPC resources](https://www.ndpc.gov.ng/resources/) |
| 2 | Nigerian Financial Intelligence Unit (NFIU) | AML/CFT policy, reporting and financial-intelligence notices where relevant to the firm | [NFIU](https://nfiu.gov.ng/) |
| 3 | NGX Regulation (NGX RegCo) | Listed-company and trading-member rules, listing disclosures and market notices | [NGX Regulation](https://ngxreg.com/) |

## Connector rollout

1. CBN Monetary Policy Committee decisions, SEC Nigeria circulars, NAICOM, PenCom and FRC publication feeds are live. Next add CBN circulars because together they cover more of the core banking, investment, insurance, pension and reporting populations.
2. Prefer RSS, Atom, official API or clearly dated publication indexes. Do not rely on search-result snippets or unofficial reposts.
3. Before enabling a source, record the exact URL, acceptable polling frequency, terms/access constraints, owner, parser tests and a fallback/manual-review process.
4. Add NDIC, FCCPC, NDPC, NFIU and NGX RegCo according to each customer’s regulated activities. They are material for deposit-taking firms, digital lenders, data-heavy firms, AML reporting entities and listed/market participants respectively.

## Scope note

This is regulatory monitoring and decision support, not legal advice. The applicable authority depends on the firm’s licence, activities, products and whether it is a listed issuer or regulated market participant.
