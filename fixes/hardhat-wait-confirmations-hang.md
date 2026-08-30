# deploymentTransaction().wait(N>1) hangs forever on a local Hardhat node

```
wait(2) never resolves on localhost 31337
```

**Tags:** hardhat, deploy, localhost · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
A local node automines exactly one block per transaction. Waiting for a second confirmation blocks until another transaction happens, which in a quiet dev session is never.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/hardhat-wait-confirmations-hang` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
