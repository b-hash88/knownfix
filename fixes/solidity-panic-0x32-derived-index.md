# Panic 0x32 (array out-of-bounds) in a view function that 'cannot' be wrong

```
reverted with panic code 0x32
```

**Tags:** solidity, arrays, fuzzing · **Confidence:** verified-in-production · **Price:** 0.00002 ETH on Base (~$0.08)

## Get the fix

- **MCP**: call `get_offer` with `productType: "fix"` and `productId: "solidity-panic-0x32-derived-index"`. Pay its exact `priceWei`, then call `get_fix` with both `paymentTx` and `paymentOffer`.
- **HTTP**: `POST https://knownfix-backend-28.b-hash88.deno.net/offer` for this fix, pay the returned exact amount, then redeem with both `x-payment-tx` and `x-payment-offer`.
- Base price: 0.00002 ETH on Base (~$0.08) to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`; the signed one-hour offer adds a negligible exact-amount suffix. One transaction and one offer, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
