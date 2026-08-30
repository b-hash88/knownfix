# GitHub Actions: git push in a workflow fails 403 (exit code 128)

```
fatal: unable to access '...': The requested URL returned error: 403 ... Process completed with exit code 128
```

**Tags:** github-actions, ci, permissions, github-token · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
The default GITHUB_TOKEN is read-only for `contents` in many repos/orgs. A job that pushes commits, tags, or releases gets 403 without an explicit write grant.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/gh-actions-token-permissions-403` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
