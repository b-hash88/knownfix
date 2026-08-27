# Base Payment Verification Pack

A seller-side verification system for Base Pay USDC and exact ETH that keeps UserOperation evidence separate from transaction evidence and gates fulfillment on signed intent.

**Price:** $49.00 USDC on Base, or a signed exact-ETH equivalent  
**Contents:** the complete EVM seller-verification skill, seven related fixes, replay-safe fulfillment controls, and a testnet-to-mainnet verification ladder  
**Updated for:** Base Account SDK pay(), ERC-4337 bundler status methods, Base mainnet USDC, Deno Deploy, ethers v6, and Hardhat

## Included material

- EVM Payment Verification for Agent Sellers - signed intent, exact settlement evidence, and atomic one-time fulfillment
- [ethers v6: 'nonce has already been used' on back-to-back transactions](https://b-hash88.github.io/knownfix/fixes/ethers6-sequential-nonce-reuse.md) - `nonce has already been used`
- [ethers v6 reports 'execution reverted (unknown custom error)' though the ABI defines it](https://b-hash88.github.io/knownfix/fixes/ethers6-custom-error-unnamed.md) - `execution reverted (unknown custom error)`
- [deploymentTransaction().wait(N>1) hangs forever on a local Hardhat node](https://b-hash88.github.io/knownfix/fixes/hardhat-wait-confirmations-hang.md) - `wait(2) never resolves on localhost 31337`
- [Node on Windows: 'Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)' at exit](https://b-hash88.github.io/knownfix/fixes/windows-libuv-assert-on-exit.md) - `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c`
- [Deno Deploy returns 508 Loop Detected when a deployment fetches its own URL](https://b-hash88.github.io/knownfix/fixes/deno-deploy-508-self-fetch-loop.md) - `508 (Loop Detected) on fetch to the app's own *.deno.net hostname`
- [Deno KV reads empty on new Deno Deploy until you attach a database](https://b-hash88.github.io/knownfix/fixes/deno-deploy-kv-not-auto-enabled.md) - `kv appears disabled / Deno.openKv() bound but reads and writes are empty on console.deno.com`
- [Deno.openKv() throws locally without the --unstable-kv flag](https://b-hash88.github.io/knownfix/fixes/deno-openkv-unstable-flag-local.md) - `Deno.openKv is not a function / requires --unstable-kv (works on Deploy, fails on local deno run)`

## Free decision preview

1. Select the verifier from the signed offer: Base Pay returns a UserOperation hash; direct ETH returns a transaction hash.
2. For USDC, resolve the operation through bundler methods and inspect only operation-scoped receipt logs.
3. Bind the exact amount, treasury, sender, chain, and private attribution suffix before fulfillment.
4. For ETH, resolve the transaction and receipt through Base JSON-RPC and require the exact signed wei amount.
5. Consume both the payment proof and offer digest in one durable atomic claim.
6. Complete declared testnet and low-value mainnet checks before advertising a production-ready rail.

The paid body provides the complete verification sequence, proof-shape checks, replay controls, operational failure states, test fixtures, and official-source references.

Purchase through KnownFix's `get_offer` and `get_skill` MCP tools using product id `base-payment-verification-pack`.

[KnownFix storefront](https://b-hash88.github.io/knownfix/) | [Agent store guide](https://b-hash88.github.io/knownfix/llms.txt) | [Live skill shelf](https://knownfix-backend-28.b-hash88.deno.net/skills)
