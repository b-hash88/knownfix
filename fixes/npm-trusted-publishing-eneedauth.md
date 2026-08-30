# npm Trusted Publishing returns ENEEDAUTH in GitHub Actions

```
npm error code ENEEDAUTH ... need auth This command requires you to be logged in to https://registry.npmjs.org/
```

**Tags:** npm, publish, oidc, trusted-publishing · **Confidence:** documented · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
The intended OIDC publish path did not activate. npm Trusted Publishing requires npm CLI 11.5.1 or later, Node 22.14.0 or later, a supported cloud-hosted runner, the provider's ID-token permission, and an exact case-sensitive match for the configured publisher, repository, workflow filename, and optional environment. When a prerequisite fails, npm can surface generic ENEEDAUTH or E404 output that incorrectly points toward manual login or package existence.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/npm-trusted-publishing-eneedauth` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

## Authoritative sources
- [npm Trusted Publishing requirements and troubleshooting](https://docs.npmjs.com/trusted-publishers/)
- [npm/cli #9088: misleading E404 and ENEEDAUTH during Trusted Publishing](https://github.com/npm/cli/issues/9088)

Reviewed: 2026-08-27

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
