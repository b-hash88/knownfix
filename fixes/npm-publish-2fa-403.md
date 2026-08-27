# npm publish EOTP/403: one-time password or authorized publishing path required

```
403 Forbidden - PUT https://registry.npmjs.org/... Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages
```

## Also matches
- `npm ERR! code EOTP`
- `This operation requires a one-time password from your authenticator.`
- `You can provide a one-time password by passing --otp=<code> to the command you ran.`

**Tags:** npm, publish, 2fa, tokens · **Confidence:** documented · **Price:** $0.05 USDC on Base, or signed exact ETH

## Get the fix

- **MCP**: a paid `search_fixes` match already includes diagnosis, compatibility, a signed USDC offer, Base Pay parameters, an exact-ETH alternative, and one redemption action.
- **HTTP**: `POST https://knownfix-backend-28.b-hash88.deno.net/offer` with this fix and `currency: "USDC"` or `"ETH"`, then redeem with both `x-payment-tx` and `x-payment-offer`.
- Price: **$0.05 USDC on Base**, or the signed exact-ETH equivalent, to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment proof and one private offer, one fix.

## Authoritative sources
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm 2FA publishing requirements](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/)
- [npm access tokens](https://docs.npmjs.com/about-access-tokens/)
- [npm CLI EOTP error contract](https://github.com/npm/cli/blob/81a901c9a5913f9bd8104e6196af3580eafa13cb/lib/utils/error-message.js)

Reviewed: 2026-08-27

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
