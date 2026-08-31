# KnownFix Evidence Audit: Focused

- **Sample target:** `https://b-hash88.github.io/knownfix/`
- **Review date:** 2026-08-30
- **Scope:** Homepage, service catalog, focused audit detail, public books, and free diagnostic response
- **Purpose:** Public self-audit showing the evidence, prioritization, and implementation detail a customer receives
- **Important:** This is a demonstration using KnownFix's own public property. It is not a customer endorsement.

## Executive Verdict

KnownFix has unusually strong machine-readable evidence and transparent transaction boundaries, but its commercial path still asks a human buyer to understand the infrastructure before seeing a conventional way to pay. The launch candidate makes the Evidence Audit the primary offer and publishes a clear `$149 -> $399 -> $750+` ladder. That resolves offer ambiguity. The highest remaining constraint is checkout: Base USDC and exact ETH are real and verifiable, while card payment still requires a manual request.

**Decision:** The offer is ready for a three-customer founder-rate campaign. Do not buy traffic yet. First close and deliver three audits, publish anonymized outcomes with permission, and measure the complete path from qualified visit to implementation.

## Scorecard

- **Offer clarity - 8/10:** One named flagship, visible scope ladder, fixed prices, and clear boundaries.
- **Design and trust - 7/10:** Distinct evidence-led visual system; little customer proof yet.
- **Technical SEO - 8/10:** Canonicals, crawl controls, service URLs, sitemap, and structured service data are present.
- **AEO/GEO - 8/10:** Direct answers, machine-readable catalog, `llms.txt`, and MCP capability surfaces are strong.
- **Agent readiness - 9/10:** Public MCP, tool contracts, discovery files, signed offers, and public books are unusually complete.
- **Performance - 7/10:** Static delivery is lean; remote font dependencies remain on the critical path.
- **Conversion - 5/10:** Focused CTA and sample report are strong; direct human card checkout is not automated.

Scores summarize the reviewed evidence. They are not ranking predictions or guarantees.

## Method

1. Load the reviewed public pages at desktop and mobile widths.
2. Record the visible promise, primary action, trust evidence, and payment path.
3. Inspect titles, descriptions, canonicals, robots directives, headings, structured data, discovery files, and public capability contracts.
4. Follow the free diagnostic and paid-order paths without submitting payment.
5. Tie each finding to a reproducible observation, then rank it by likely impact, confidence, and effort.

Excluded: authenticated analytics, private administration, penetration testing, exhaustive crawling, legal compliance certification, and paid transaction settlement.

## Priority Findings

### KF-EA-01 - Human checkout stops at a manual card request

- **Priority:** P0
- **Confidence:** High
- **Likely impact:** High
- **Effort:** Medium

**Observation**

The service catalog creates a private order and generates signed Base USDC and exact-ETH offers. A human who prefers a card is sent to an email request rather than a hosted checkout session.

**Reproduce**

1. Open `/services.html`.
2. Choose the Focused Evidence Audit.
3. Compare the automated Base checkout controls with the card path.
4. Confirm that the card path leaves the purchase flow before payment.

**Why it matters**

Human founders are the primary buyer. Every extra step between intent and payment increases abandonment, especially for a first purchase from an unfamiliar provider.

**Recommendation**

Connect a Canadian-supported payment processor and use a product-bound hosted checkout link for each audit tier. On successful payment, create or reconcile the private service order and send the buyer a recoverable receipt. Preserve the existing Base path for agent and crypto-native buyers.

**Verification**

A new browser session can select the `$149` audit, pay by card, receive a receipt and retrieval path, and appear in the private order system without manual email exchange.

### KF-EA-02 - Expertise is demonstrated, but customer proof is absent

- **Priority:** P0
- **Confidence:** High
- **Likely impact:** High
- **Effort:** Medium

**Observation**

The site publishes scopes, technical contracts, public books, and this self-audit. It does not yet show a customer-authorized case study, before-and-after result, or attributed buyer statement.

**Reproduce**

1. Open the homepage and service catalog.
2. Search for a customer outcome, case study, or testimonial.
3. Confirm that the evidence currently describes KnownFix's own systems and sample work.

**Why it matters**

Operational transparency answers "is this real?" but not yet "will this help a company like mine?"

**Recommendation**

Sell three founder-rate audits. Ask each buyer for permission to publish an anonymized problem, the highest-value finding, the implemented change, and the verified delta. Never manufacture a quote or imply an outcome that was not measured.

**Verification**

At least one public case study includes a dated baseline, implemented change, after-state evidence, scope limitations, and explicit publication permission.

### KF-EA-03 - The storefront and operational ledger feel like two products

- **Priority:** P1
- **Confidence:** High
- **Likely impact:** Medium
- **Effort:** Medium

**Observation**

The static storefront is served from GitHub Pages while books, order APIs, redirects, and diagnostics are served from a Deno backend. The architecture is legitimate, but navigation crosses domains and visual contexts.

**Reproduce**

1. Open the homepage.
2. Select `Open books`.
3. Record the hostname and compare the navigation, typography, and return path.

**Why it matters**

Domain and visual continuity are trust signals during a paid decision. The split also makes analytics attribution and recovery paths harder to explain.

**Recommendation**

Keep the services separated internally, but place the public surfaces behind one branded domain when revenue justifies it. Until then, use consistent navigation, styling, entity names, and cross-domain analytics.

**Verification**

A buyer can move from offer to books to checkout and back without losing brand context, source attribution, or a clear route to the order.

### KF-EA-04 - The free diagnostic is machine-useful but human-unfriendly

- **Priority:** P1
- **Confidence:** High
- **Likely impact:** Medium
- **Effort:** Low

**Observation**

The free agent-readiness diagnostic exposes structured JSON. That is ideal for agents and debugging, but it does not give a human prospect a short verdict, a visual pass/fail summary, or a natural next step.

**Reproduce**

1. Submit a public URL through the free diagnostic form.
2. Observe the raw response document.
3. Identify the next action a nontechnical founder is expected to take.

**Recommendation**

Preserve JSON as the canonical response and add an optional human-readable result view. Show only verified checks, explain uncertainty, and connect relevant failures to the Focused Evidence Audit without using an inflated composite score.

**Verification**

The same test URL produces equivalent JSON evidence plus a readable summary with clear pass, fail, unavailable, and next-step states.

### KF-EA-05 - External fonts add a fragile dependency to an otherwise lean static page

- **Priority:** P2
- **Confidence:** High
- **Likely impact:** Low to medium
- **Effort:** Low

**Observation**

The storefront requests Archivo, JetBrains Mono, and Newsreader from Google Fonts. The page has sensible local fallbacks, but the remote stylesheet and font files add network requests and a third-party availability dependency.

**Reproduce**

1. Load the homepage with the browser network panel open.
2. Filter for `fonts.googleapis.com` and `fonts.gstatic.com`.
3. Block those domains and confirm that the fallback stack renders.

**Recommendation**

Self-host a small WOFF2 subset or keep the current fallback strategy and document the tradeoff. Re-test layout metrics after any font change.

**Verification**

Critical text renders immediately under a cold load, no third-party font request blocks first paint, and headings and controls do not shift or overflow at mobile widths.

## What Is Already Strong

- The offer has explicit scope, exclusions, price, delivery window, and no-guarantee language.
- Each service has a dedicated, indexable URL with direct-answer FAQs and structured service data.
- The MCP catalog exposes the same service definitions used by the browser checkout.
- Payment offers bind product, amount, recipient, chain, expiry, and intent before funds move.
- Private tickets separate order retrieval from public books and public work queues.
- Completed reports include a SHA-256 digest for the Markdown source.
- The public ledger distinguishes operational evidence from marketing claims.

## 14-Day Implementation Plan

1. **Day 1 - Publish the audit ladder.** Complete when live pages show `$149`, `$399`, and `$750+` paths consistently.
2. **Day 2 - Publish this sample report.** Complete when the canonical report URL is indexable and linked from the primary offer.
3. **Day 3 - Complete the card checkout design.** Document the processor, tax treatment, receipt, refund, and order reconciliation.
4. **Days 4-6 - Research 20 high-fit developer-tool prospects.** Require one public, reproducible finding and source URL for every record.
5. **Days 7-10 - Send concise founder outreach.** Every message leads with the finding, not a generic pitch.
6. **Days 11-14 - Close and schedule three founder-rate audits.** Record payment and delivery dates; never fabricate social proof.

## Measurement Contract

Track the service funnel as discrete events:

1. `qualified_visit` - service or sample page viewed from a relevant source.
2. `free_diagnostic_complete` - a valid public target produces a result.
3. `service_select` - a buyer selects Focused or Comprehensive.
4. `checkout_start` - a product-bound payment session or signed offer is opened.
5. `payment_confirmed` - settlement is verified and joined to the order.
6. `report_delivered` - the buyer retrieves a digest-verified report.
7. `implementation_started` - a remediation scope is accepted.

The business metric is the transition rate and time between these stages, segmented by source. Page views and followers are supporting signals, not the objective.

## Boundary

This report describes public evidence observed on the review date. Search behavior, AI citations, rankings, traffic, and conversion outcomes can change for reasons outside the reviewed site. Recommendations are hypotheses until implemented and measured. Test these claims.
