# npm Publishing Recovery Pack

Recover current npm publish, install, package-export, and dependency-resolution failures without relying on obsolete Classic-token advice.

**Price:** $4.00 USDC on Base, or a signed exact-ETH equivalent  
**Contents:** six complete fixes, a publishing decision tree, recovery commands, authoritative sources, and release verification
**Updated for:** npm's current granular-token, two-factor authentication, and Trusted Publishing model

## Included failures

- [npm publish 403: two-factor authentication or bypass-2fa token required](https://b-hash88.github.io/knownfix/fixes/npm-publish-2fa-403.md) — `403 Forbidden - PUT https://registry.npmjs.org/... Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages`
- [npm Trusted Publishing returns ENEEDAUTH in GitHub Actions](https://b-hash88.github.io/knownfix/fixes/npm-trusted-publishing-eneedauth.md) — `npm error code ENEEDAUTH ... need auth This command requires you to be logged in to https://registry.npmjs.org/`
- [npm publish E404 on a brand-new package with a granular access token](https://b-hash88.github.io/knownfix/fixes/npm-granular-token-new-package-404.md) — `npm error 404 Not Found - PUT https://registry.npmjs.org/<pkg> - The requested resource could not be found or you do not have permission`
- [npm install 'succeeded' but the package is not there](https://b-hash88.github.io/knownfix/fixes/npm-install-silent-failure.md) — `Cannot find module 'X' immediately after npm i X appeared to succeed`
- [Probing a dependency via require('X/package.json') throws ERR_PACKAGE_PATH_NOT_EXPORTED](https://b-hash88.github.io/knownfix/fixes/err-package-path-not-exported-probe.md) — `Package subpath './package.json' is not defined by "exports"`
- [npm ERESOLVE installing @nomicfoundation/hardhat-verify with Hardhat 2](https://b-hash88.github.io/knownfix/fixes/hardhat-verify-peer-conflict.md) — `peer hardhat@"^3.12.0" from @nomicfoundation/hardhat-verify`

## Free decision preview

1. Separate local interactive publishing from CI publishing.
2. For local publishing, establish a fresh short-lived login and satisfy the package's 2FA policy.
3. For supported CI providers, prefer npm Trusted Publishing through OIDC; check the Node/npm minimums, hosted runner, ID-token permission, and exact publisher mapping before adding any credential.
4. Treat OIDC ENEEDAUTH/E404, E404 for a new package, a silent install, package-export probing, and peer-resolution errors as different branches. Prove the failure class before changing credentials.
5. Verify the release from the registry and a clean consumer project, not only from the publishing shell.

The paid pack supplies the exact branch checks, commands, caveats, and verification procedure. Purchase through KnownFix's `get_offer` and `get_skill` MCP tools using product id `npm-publishing-recovery-pack`.

[KnownFix storefront](https://b-hash88.github.io/knownfix/) · [Agent store guide](https://b-hash88.github.io/knownfix/llms.txt) · [Live skill shelf](https://knownfix-backend-28.b-hash88.deno.net/skills)
