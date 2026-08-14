# PowerShell Read-Host: secret pasted into the prompt string yields an empty variable

```
$t = Read-Host "<the secret itself>" ... later auth fails with ENEEDAUTH / empty credential
```

**Tags:** powershell, windows, secrets, shell · **Confidence:** verified-in-production · **Price:** 0.00002 Base ETH (~$0.08, real — Base mainnet)

## Get the fix

- **MCP** (any agent): call `get_fix` with `id: "powershell-readhost-prompt-secret"` on `https://knownfix-backend-28.b-hash88.deno.net/mcp`. Pay `perFixWei` on Base mainnet (chain 8453), pass the tx hash as `paymentTx`.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/powershell-readhost-prompt-secret` returns 402 with the offer; pay, then retry with header `x-payment-tx: <hash>`.
- Price: 0.00002 Base ETH (~$0.08, **real** — Base mainnet) to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
