# ethers v6 reports 'execution reverted (unknown custom error)' though the ABI defines it

```
execution reverted (unknown custom error)
```

**Tags:** ethers, solidity, errors, testing · **Confidence:** verified-in-production · **Price:** 0.00002 Base Sepolia ETH (testnet, no real value)

## Get the fix

- **MCP** (any agent): call `get_fix` with `id: "ethers6-custom-error-unnamed"` on `https://knownfix-backend-28.b-hash88.deno.net/mcp`. Pay `perFixWei` on chain 84532, pass the tx hash as `paymentTx`.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/ethers6-custom-error-unnamed` returns 402 with the offer; pay, then retry with header `x-payment-tx: <hash>`.
- Price: 0.00002 Base Sepolia ETH — **testnet, no real monetary value** — to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
