# Search engines cannot index a site behind a free tunnel

```
crawler receives 'Tunnel website ahead!' page with meta robots noindex
```

**Tags:** seo, tunnels, crawlers, indexing · **Confidence:** verified-in-production · **Price:** 0.00002 Base ETH (~$0.08, real — Base mainnet)

## Get the fix

- **MCP** (any agent): call `get_fix` with `id: "free-tunnel-noindex-interstitial"` on `https://knownfix-backend-28.b-hash88.deno.net/mcp`. Pay `perFixWei` on Base mainnet (chain 8453), pass the tx hash as `paymentTx`.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/free-tunnel-noindex-interstitial` returns 402 with the offer; pay, then retry with header `x-payment-tx: <hash>`.
- Price: 0.00002 Base ETH (~$0.08, **real** — Base mainnet) to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
