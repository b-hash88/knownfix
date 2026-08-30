# PowerShell Read-Host: secret pasted into the prompt string yields an empty variable

```
$t = Read-Host "<the secret itself>" ... later auth fails with ENEEDAUTH / empty credential
```

**Tags:** powershell, windows, secrets, shell · **Confidence:** verified-in-production · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
Read-Host's quoted argument is the PROMPT TEXT shown to the user, not the input. Pasting a token there displays the token and waits; pressing Enter stores an empty string, and the later failure (e.g. npm ENEEDAUTH) appears unrelated.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/powershell-readhost-prompt-secret` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
