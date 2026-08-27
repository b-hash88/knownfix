# actions/setup-node cache fails: Dependencies lock file is not found

```
Dependencies lock file is not found in ... Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

**Tags:** github-actions, ci, setup-node, cache, npm · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
setup-node dependency caching needs a committed dependency file to hash. Explicit `cache: npm` can fail when the lockfile is absent or elsewhere. Current setup-node releases can also auto-enable npm caching when package.json declares a package manager, so the cache path may be active even when the workflow has no visible `cache:` line.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/gh-actions-setup-node-cache-no-lockfile` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment proof and one private offer, one fix.

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
