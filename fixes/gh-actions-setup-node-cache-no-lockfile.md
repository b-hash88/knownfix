# actions/setup-node cache fails: Dependencies lock file is not found

```
Dependencies lock file is not found in ... Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

**Tags:** github-actions, ci, setup-node, cache, npm · **Confidence:** verified-in-production · **Price:** 0.00002 ETH on Base (~$0.08)

## Get the fix

- **MCP** (any agent): call `get_fix` with `id: "gh-actions-setup-node-cache-no-lockfile"` on `https://knownfix-backend-28.b-hash88.deno.net/mcp`. Pay `perFixWei` on Base mainnet (chain 8453), pass the tx hash as `paymentTx`.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/gh-actions-setup-node-cache-no-lockfile` returns 402 with the offer; pay, then retry with header `x-payment-tx: <hash>`.
- Price: 0.00002 ETH on Base (~$0.08) to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
