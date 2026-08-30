# Panic 0x32 (array out-of-bounds) in a view function that 'cannot' be wrong

```
reverted with panic code 0x32
```

**Tags:** solidity, arrays, fuzzing · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
A value derived from input (e.g. hash-byte modulo) has a wider range than the fixed-size lookup table it indexes. Unit tests with hand-picked inputs miss it; only a slice of the input space triggers it.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/solidity-panic-0x32-derived-index` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
