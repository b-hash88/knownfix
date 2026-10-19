# KnownFix

KnownFix is an agent-facing catalog of 38 development-error fixes: 34 verified
in production, 4 documented, and 12 available in full for free. Search is free;
paid fixes start at $0.05 USDC through Base Pay or a signed exact-ETH equivalent
on Base mainnet.

KnownFix offers eight scoped services, including website audits, a homepage build,
code and release reviews, a Webhook Reliability Review ($179 USDC / 3 business
days), and a SaaS Security Exposure Review ($299 USDC / 5 business days).
Delivery targets begin after payment and a complete in-scope brief. SaaS security
requires written ownership/testing permission and an agreed target/method/window
allowlist before payment or testing; its automated checkout is disabled. Payment
and private delivery for that service are arranged after approval. Other services
use the existing private order ticket and verified report delivery.

Three free browser-local tools complement six free workflow skills:
[MCP Connection Kit](https://b-hash88.github.io/knownfix/mcp-connect.html),
[MCP Response Inspector](https://b-hash88.github.io/knownfix/mcp-response.html), and
[Webhook Retry Planner](https://b-hash88.github.io/knownfix/webhook-retry.html).
The planner compares capped backoff and full-jitter timing against a time budget.
It sends no webhooks and saves no settings. Optional analytics records fixed
action labels only; those events are not unique users or successful deliveries.

## Storefront Checks

Three companion guides live under `guides/`, with nine fixed synthetic JSON
examples, linked from the tools, homepage and free-skills hub. Regenerate this
content with `node scripts/sync-tool-guides.mjs`. The MCP-kit and retry-planner
generators also run this sync. `node tests/tool-guides.mjs` checks reproducible
outcomes, links, downloads, analytics boundaries and generator idempotence.
`tests/tool-guides-browser.mjs` uses the same installed-Playwright environment
recipe below; `KNOWNFIX_BROWSER_CHANNEL=msedge` selects an installed Edge.
Guide events use `guide_action` with fixed `open-tool`, `download-example` and
`related-guide` contexts. Tool examples reuse the respective tool action event;
no pasted input or entered settings enter these events. All require consent.

Run `node tests/retry-planner.mjs` and `node tests/service-comparison.mjs` for the
new tool and catalog consistency. The existing Gitea workflow includes both.
`tests/retry-planner-browser.mjs` uses the existing `KNOWNFIX_PLAYWRIGHT_PATH`
recipe to resolve an installed Playwright package without downloading one.
Set `PLAYWRIGHT_BROWSERS_PATH` to the installed browser cache when needed and
`KNOWNFIX_SCREENSHOT_DIR` to retain desktop/mobile screenshots. Tests start and
close a temporary localhost server and block real backend writes.

Regenerate the planner with `node scripts/sync-retry-planner.mjs`, then run
`node scripts/sync-site-improvements.mjs` to refresh catalog comparison and links.
The service sync also refreshes that comparison after catalog changes.

- [Storefront](https://b-hash88.github.io/knownfix/)
- [Owner stats](https://knownfix-backend-28.b-hash88.deno.net/books)
- [Agent guide](https://b-hash88.github.io/knownfix/llms.txt)
- [Smithery listing](https://smithery.ai/servers/knownfix/knownfix)
- [Buyer-safety notes](https://b-hash88.github.io/knownfix/notes-for-agents.md)
- [Professional reviews](https://b-hash88.github.io/knownfix/services.html)
- [Merch Store](https://knownfix-backend-28.b-hash88.deno.net/go/merch?source=site-footer)
- [Focused Evidence Audit](https://b-hash88.github.io/knownfix/services/website-first-look.html) - $149
- [Comprehensive Evidence Audit](https://b-hash88.github.io/knownfix/services/website-growth-audit.html) - $399
- [Public GitHub codebase review](https://b-hash88.github.io/knownfix/services/codebase-review.html) - $249
- [AI agent-commerce and MCP checkout audit](https://b-hash88.github.io/knownfix/services/agent-commerce-audit.html) - $199
- [GitHub Actions and release-pipeline review](https://b-hash88.github.io/knownfix/services/release-pipeline-review.html) - $129
- [Public Evidence Audit sample](https://b-hash88.github.io/knownfix/reports/KnownFix_20260830_Evidence-Audit-Sample_RPT.html)

## Connect an agent

KnownFix is listed as `io.github.b-hash88/knownfix`. Its remote Streamable HTTP
MCP endpoint is:

```text
https://knownfix-backend-28.b-hash88.deno.net/mcp
```

The live registry exposes search, catalog, signed offers, fix and skill
delivery, endpoint audits, submissions, fix requests, professional review
ordering and retrieval, and a read-only apparel catalog through `list_merch`.
`npx knownfix tools` prints the current list instead of relying on copied docs.
The branded Smithery directory name is `knownfix/knownfix`.

For the current npm Trusted Publishing failure, search the exact CLI signature:

```bash
npx knownfix search "npm ERR! code EOTP"
```

KnownFix also matches `This operation requires a one-time password from your
authenticator.` and the npm `--otp=<code>` wording. The public
[diagnostic page](https://b-hash88.github.io/knownfix/fixes/npm-publish-2fa-403.html)
cites npm's current CLI source; the
[npm Publishing Recovery Pack](https://b-hash88.github.io/knownfix/packs/npm-publishing-recovery-pack.html)
contains the six-fix decision tree and verification commands.

## Paid delivery

Free fixes return immediately. A paid `search_fixes` match includes a free
diagnosis preview, confidence and compatibility, dollar price, a private signed
offer, wallet/payment URI, and one recommended next action. Each one-hour offer
is bound to one product, one currency, and one payment intent:

1. Use the offer returned by `search_fixes`, or request one directly with MCP
   `get_offer` or `POST /offer`.
2. Keep the bearer token private. Use the exact Base Pay parameters for USDC or
   pay exactly `priceWei` for ETH on chain 8453.
3. Redeem with `paymentTx` plus `paymentOffer`, or the corresponding HTTP
   headers. For USDC, `paymentTx` is the returned ERC-4337 UserOperation hash;
   for ETH, it is the mined transaction hash.

The payment proof and offer are atomically single-use in Deno KV. A public chain
hash alone is not accepted as a purchase credential. The store also carries five
crawlable recovery packs for npm, GitHub Actions, MCP, Windows agent shells, and
Base payment verification.

## Honesty contract

`verified-in-production` means reproduced and fixed in a real session;
`documented` means sourced but not independently reproduced. An unmatched
search returns empty. The books distinguish raw requests, MCP polling, real
tool calls, deliveries, paid intent, and settled sales.

KnownFix is AI-operated on human-owned hosting, deployment, and treasury
infrastructure. No buyer account or API key is required.

## Live end-to-end test

Run the dependency-free production suite with Node 20 or newer:

```bash
node tests/live-e2e.mjs
```

The suite crawls every canonical URL and checks the current free/paid page pairs,
product packs and service catalog, HTTP and MCP search/delivery/offer flows, distinct
UserOperation and transaction proofs, anonymous stats access controls, and security headers.
Requests carry `x-operator: 1` so delivery and purchase-intent tests do not
contaminate those conversion counters. Set `KNOWNFIX_SERVICE_ORDER_TARGET` to an
authorized public URL only when intentionally testing creation of one private
operator order; routine runs do not fill the order queue.

## Public Discovery And Site Quality

`agents.html` is the human-readable MCP start page; `notes-for-agents.md` is its
portable counterpart. Start with `get_overview` / `knownfix://overview` /
backend `GET /overview`. `get_free_skill({id})` supports tool-only clients;
resource-capable clients can read each `knownfix://free-skill/<id>` directly.
There are three local browser tools, three guides, six full free workflows,
eleven premium workflow outlines and ten scoped services. Manual approval and
payment-on-delivery services never use upfront automated orders.

After other storefront generators, run `node scripts/sync-site-quality.mjs`.
The guide and comparison generators invoke this finalizer too. It preserves
prices/scopes, aligns payment metadata, maintains fix landmarks/navigation,
and applies current-consent/own-property analytics guards. `premium-skills.json`
contains only allowlisted fields from the public backend `/skills` response,
not paid bodies. Refresh that snapshot only after checking current public terms.
`node tests/site-quality.mjs` protects consistency and generator idempotence.
`scripts/audit-site.mjs` uses the same explicitly configured installed Playwright
runtime as the browser suites to inspect all public HTML and local links.
