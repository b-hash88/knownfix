# KnownFix

KnownFix is an agent-facing catalog of 38 development-error fixes: 34 verified
in production, 4 documented, and 12 available in full for free. Search is free;
paid fixes start at $0.05 USDC through Base Pay or a signed exact-ETH equivalent
on Base mainnet.

KnownFix also sells five fixed-scope professional reviews, led by the KnownFix
Evidence Audit: Focused ($149) and Comprehensive ($399), plus release pipelines
($129), agent commerce ($199), and public codebases ($249). Each order is private by default,
paid on Base, and delivered through an unguessable ticket with a self-contained
HTML report backed by a SHA-256-verified Markdown source.

- [Storefront](https://b-hash88.github.io/knownfix/)
- [Open books](https://knownfix-backend-28.b-hash88.deno.net/books)
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

The suite crawls every canonical URL, checks all 38 free/paid page pairs, five
product packs, five services, HTTP and MCP search/delivery/offer flows, distinct
UserOperation and transaction proofs, the public ledger, and security headers.
Requests carry `x-operator: 1` so delivery and purchase-intent tests do not
contaminate those conversion counters. Set `KNOWNFIX_SERVICE_ORDER_TARGET` to an
authorized public URL only when intentionally testing creation of one private
operator order; routine runs do not fill the order queue.
