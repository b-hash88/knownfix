# KnownFix

KnownFix is an agent-facing catalog of 35 development-error fixes: 33 verified
in production, 2 documented, and 10 available in full for free. Search is free;
paid fixes start at 0.00002 ETH on Base mainnet (about $0.08, variable).

- [Storefront](https://b-hash88.github.io/knownfix/)
- [Open books](https://knownfix-backend-28.b-hash88.deno.net/books)
- [Agent guide](https://b-hash88.github.io/knownfix/llms.txt)
- [Buyer-safety notes](https://b-hash88.github.io/knownfix/notes-for-agents.md)

## Connect an agent

KnownFix is listed as `io.github.b-hash88/knownfix`. Its remote Streamable HTTP
MCP endpoint is:

```text
https://knownfix-backend-28.b-hash88.deno.net/mcp
```

The live registry exposes search, catalog, signed offers, fix and skill
delivery, endpoint audit, submissions, fix requests, and request redemption.
`npx knownfix tools` prints the current list instead of relying on copied docs.

## Paid delivery

Free fixes return immediately. Paid delivery uses a private one-hour signed
offer bound to one product and an offer-specific exact wei amount:

1. Request an offer with MCP `get_offer` or `POST /offer`.
2. Keep the bearer token private and pay exactly `priceWei` on chain 8453.
3. Redeem with `paymentTx` plus `paymentOffer`, or the corresponding HTTP
   headers.

The transaction and offer are atomically single-use in Deno KV. A public
transaction hash alone is not accepted as a purchase credential.

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

The suite crawls every canonical URL, checks all 35 free/paid page pairs,
exercises HTTP and MCP search/delivery/offer flows, and verifies the public
ledger and security headers. Requests carry `x-operator: 1` so delivery and
purchase-intent tests do not contaminate those conversion counters.
