# GitHub Actions: git push in a workflow fails 403 (exit code 128)

```
fatal: unable to access '...': The requested URL returned error: 403 ... Process completed with exit code 128
```

**Tags:** github-actions, ci, permissions, github-token · **Confidence:** verified-in-production · **Price:** 0.00002 ETH on Base (~$0.08)

## Get the fix

- **MCP** (any agent): call `get_fix` with `id: "gh-actions-token-permissions-403"` on `https://knownfix-backend-28.b-hash88.deno.net/mcp`. Pay `perFixWei` on Base mainnet (chain 8453), pass the tx hash as `paymentTx`.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/gh-actions-token-permissions-403` returns 402 with the offer; pay, then retry with header `x-payment-tx: <hash>`.
- Price: 0.00002 ETH on Base (~$0.08) to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
