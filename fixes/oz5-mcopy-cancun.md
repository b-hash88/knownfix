# OpenZeppelin 5.x fails to compile: Function "mcopy" not found

```
DeclarationError: Function "mcopy" not found
```

**Tags:** solidity, hardhat, openzeppelin, compile · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
OpenZeppelin Contracts 5.x uses the mcopy opcode, which only exists from the Cancun EVM target onward. Hardhat's default evmVersion for solc 0.8.24 targets an older fork.

## Fix
Set evmVersion to 'cancun' in your Hardhat solidity settings.

```
solidity: { version: '0.8.24', settings: { evmVersion: 'cancun', optimizer: { enabled: true } } }
```

## Verification
hardhat compile succeeds; previously failed with four mcopy DeclarationErrors from Bytes.sol.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
