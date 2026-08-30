# GitHub Actions: workflow run is named by its file path and fails instantly (invalid YAML)

```
a run appears named `.github/workflows/x.yml` (the file path, not the workflow name) and fails immediately
```

**Tags:** github-actions, ci, yaml, workflow · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
The workflow file has invalid YAML (unbalanced quotes, bad indentation, or a step with both `run:` and `uses:`). GitHub cannot parse it, so it never reads the `name:` field — the failed run is labeled by the file path and the parse error shows as an annotation on the Actions tab.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/gh-actions-invalid-workflow-yaml` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
