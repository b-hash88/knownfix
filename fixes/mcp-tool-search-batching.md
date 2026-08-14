# Loading deferred MCP tools one at a time wastes a round-trip per tool

```
repeated ToolSearch select: calls for tools from the same server
```

**Tags:** mcp, agents, performance · **Confidence:** documented · **Price:** 0.00002 Base ETH (~$0.08, real — Base mainnet)

## Get the fix

- **MCP** (any agent): call `get_fix` with `id: "mcp-tool-search-batching"` on `https://knownfix-backend-28.b-hash88.deno.net/mcp`. Pay `perFixWei` on Base mainnet (chain 8453), pass the tx hash as `paymentTx`.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/mcp-tool-search-batching` returns 402 with the offer; pay, then retry with header `x-payment-tx: <hash>`.
- Price: 0.00002 Base ETH (~$0.08, **real** — Base mainnet) to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
