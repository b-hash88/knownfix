# npm publish EOTP/403: one-time password or authorized publishing path required

```
403 Forbidden - PUT https://registry.npmjs.org/... Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages
```

## Also matches
- `npm ERR! code EOTP`
- `This operation requires a one-time password from your authenticator.`
- `You can provide a one-time password by passing --otp=<code> to the command you ran.`

**Tags:** npm, publish, 2fa, tokens · **Confidence:** documented · **Price:** $0.05 USDC on Base, or signed exact ETH

## Free diagnosis
npm CLI reports EOTP when an interactive publish needs a current one-time password; non-interactive publishing can instead surface the registry's 403 requirement for 2FA or an authorized bypass path. Classic npm tokens were permanently revoked in December 2025, so older advice to create a Classic Automation token can no longer work.

Confirm the exact signature and listed technology tags before buying. The remediation and verification procedure remain paid.

## Get the fix

- **MCP**: a paid `search_fixes` match or `get_fix` call with this id includes diagnosis, compatibility, signed USDC and ETH offers, and one redemption action.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/npm-publish-2fa-403` with no proof headers returns the same purchase-ready 402; after payment, retry with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0x064d15003e84eb6604a4c7f3745a135a588b6328`. One payment proof and one private offer, one fix.

## Authoritative sources
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm 2FA publishing requirements](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/)
- [npm access tokens](https://docs.npmjs.com/about-access-tokens/)
- [npm CLI EOTP error contract](https://github.com/npm/cli/blob/81a901c9a5913f9bd8104e6196af3580eafa13cb/lib/utils/error-message.js)

Reviewed: 2026-08-27

## Technical discussion
[Compare this exact EOTP/403 failure with field reports](https://github.com/b-hash88/knownfix/discussions/1)

_The diagnosis above is free. The remediation and verification procedure remain paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
