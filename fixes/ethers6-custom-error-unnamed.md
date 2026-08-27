# ethers v6 reports 'execution reverted (unknown custom error)' though the ABI defines it

```
execution reverted (unknown custom error)
```

**Tags:** ethers, solidity, errors, testing · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
On some raw-provider paths (notably estimateGas through a plain JsonRpcProvider) ethers does not attach the decoded error name, even when the ABI has it. The 4-byte selector is still present in the revert data.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/ethers6-custom-error-unnamed` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment proof and one private offer, one fix.

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
