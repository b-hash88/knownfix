# KnownFix for AI agents

Connect KnownFix through MCP and find free tools, guides, workflow skills, developer fixes and scoped services with clear payment boundaries.

## Start here

Endpoint: https://knownfix-backend-28.b-hash88.deno.net/mcp (Streamable HTTP). No account or API key for public discovery. Call get_overview with an empty object, or read knownfix://overview, for the complete current map. HTTP fallback: https://knownfix-backend-28.b-hash88.deno.net/overview . Human-readable guide: https://b-hash88.github.io/knownfix/agents.html .

- Exact error: search_fixes. A free top match includes the full remedy; paid matches include diagnosis and current signed offers. No confident match returns empty.
- Browse signatures: list_catalog / knownfix://catalog.
- Premium outlines and bundles: list_skills / knownfix://skills. Full premium bodies are paid.
- Complete free workflows: resources/read with one of the URIs below.
- Scoped work: list_services / knownfix://services; observe each service's manual or automated order mode.

Tool-only MCP clients can call get_free_skill with an id below for its complete Markdown body. Premium products are excluded.

## Complete free workflows

- Evidence-First Bug Report: knownfix://free-skill/evidence-first-bug-report
  Full Markdown: https://knownfix-backend-28.b-hash88.deno.net/free-skill/evidence-first-bug-report
- Release Smoke Check for Codex and Claude: knownfix://free-skill/release-smoke-check
  Full Markdown: https://knownfix-backend-28.b-hash88.deno.net/free-skill/release-smoke-check
- MCP Connection Triage: knownfix://free-skill/mcp-connection-triage
  Full Markdown: https://knownfix-backend-28.b-hash88.deno.net/free-skill/mcp-connection-triage
- Website Search Readiness: knownfix://free-skill/website-search-readiness
  Full Markdown: https://knownfix-backend-28.b-hash88.deno.net/free-skill/website-search-readiness
- API Response Triage: knownfix://free-skill/api-response-triage
  Full Markdown: https://knownfix-backend-28.b-hash88.deno.net/free-skill/api-response-triage
- Webhook Delivery Triage: knownfix://free-skill/webhook-delivery-triage
  Full Markdown: https://knownfix-backend-28.b-hash88.deno.net/free-skill/webhook-delivery-triage

## Free browser tools and companion guides

- MCP Connection Kit: https://b-hash88.github.io/knownfix/mcp-connect.html
  Check JSON configuration and copy MCP requests. Does not execute commands or test a connection. Input stays local.
  Companion guide: https://b-hash88.github.io/knownfix/guides/mcp-connection-troubleshooting.html
- MCP Response Inspector: https://b-hash88.github.io/knownfix/mcp-response.html
  Inspect one response envelope. Structural validity is not proof that a tool succeeded. Input stays local.
  Companion guide: https://b-hash88.github.io/knownfix/guides/mcp-response-validation.html
- Webhook Retry Planner: https://b-hash88.github.io/knownfix/webhook-retry.html
  Plan serial retries, timeouts and jitter. No webhook calls or provider delivery guarantee. Input stays local.
  Companion guide: https://b-hash88.github.io/knownfix/guides/webhook-retry-budget.html

## Services and payment

- Microsite Launch: $299 USDC / 5 business-day target. Written scope approval before manual payment or work. No automated checkout.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/microsite-launch.html
- Verified Repo Fix: $149 USDC / 3 business-day target. Payment on verified delivery; request scope first. No upfront checkout.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/verified-repo-fix.html
- KnownFix Evidence Audit: Focused: $149 USDC / 3 business-day target. Private-ticket checkout after target authorization and spending approval.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/website-first-look.html
- KnownFix Evidence Audit: Comprehensive: $399 USDC / 5 business-day target. Private-ticket checkout after target authorization and spending approval.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/website-growth-audit.html
- Evidence-Led Homepage Build: $750 USDC / 7 business-day target. Private-ticket checkout after target authorization and spending approval.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/homepage-build.html
- Codebase Review: $249 USDC / 4 business-day target. Private-ticket checkout after target authorization and spending approval.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/codebase-review.html
- Agent Commerce Audit: $199 USDC / 3 business-day target. Private-ticket checkout after target authorization and spending approval.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/agent-commerce-audit.html
- Release Pipeline Review: $129 USDC / 2 business-day target. Private-ticket checkout after target authorization and spending approval.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/release-pipeline-review.html
- Webhook Reliability Review: $179 USDC / 3 business-day target. Private-ticket checkout after target authorization and spending approval.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/webhook-reliability-review.html
- SaaS Security Exposure Review: $299 USDC / 5 business-day target. Written scope approval before manual payment or work. No automated checkout.
  Complete scope, start conditions and exclusions: https://b-hash88.github.io/knownfix/services/saas-security-exposure-review.html

SaaS security requires explicit written ownership/testing permission, exact target and method allowlists, a test window, request limits, accounts, stop conditions and any required third-party permission. A public URL or checkbox is not authorization.

For eligible automated services, order_service creates a private ticket; check_service_order confirms payment and retrieves the report. Do not call order_service for requiresScopeApproval or paymentTiming:after-verified-delivery.

## Buying paid fixes and premium skills safely

Obtain your operator's spending approval. search_fixes, get_fix(id) or get_skill(id) already includes current offers for paid items; get_offer is optional when a fresh single-rail offer is needed. Pay only the exact signed Base USDC or ETH parameters before expiry. For USDC, paymentTx is the returned UserOperation hash; for ETH, the mined transaction hash. Redeem with both paymentTx and the matching private paymentOffer. The proof and offer are single-use. A public chain hash by itself is not a purchase credential. Never pay again merely because a proof is pending or denied.

## Boundaries

Discovery creates no order, payment or delivery promise. Keep private bearer offers, tickets, payment proofs, credentials and customer data out of prompts, public issues and telemetry. Free workflow resources are complete; paid bodies and owner statistics are not public resources. Respect each fix's confidence and compatibility notes; prior success is not a guarantee in your environment. Browser tools are local checks, not live-connection, production-webhook, full protocol-conformance or security tests. Optional site analytics requires consent and records fixed actions, not pasted input or proven customers.
