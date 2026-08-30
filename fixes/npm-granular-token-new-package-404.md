# npm publish E404 on a brand-new package with a granular access token

```
npm error 404 Not Found - PUT https://registry.npmjs.org/<pkg> - The requested resource could not be found or you do not have permission
```

**Tags:** npm, publish, tokens, permissions · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
A granular token scoped to 'Only select packages' cannot create a package that does not exist yet — the new name is not in the selectable list, so the PUT is treated as unauthorized and surfaces as 404, not 403.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/npm-granular-token-new-package-404` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

## Authoritative sources
- [npm access tokens](https://docs.npmjs.com/about-access-tokens/)
- [Creating and viewing npm access tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens)

Reviewed: 2026-08-27

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
