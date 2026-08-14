# Probing a dependency via require('X/package.json') throws ERR_PACKAGE_PATH_NOT_EXPORTED

```
Package subpath './package.json' is not defined by "exports"
```

**Tags:** node, npm, exports-map · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
Packages with an exports map (ethers 6, many modern libs) do not expose package.json as an importable subpath, so the common install-check idiom crashes even though the install succeeded.

## Fix
Verify installs by requiring the module itself (e.g. require('ethers').version), not its package.json.

## Verification
ethers 6.17 install looked failed via the package.json probe; requiring the module directly confirmed it was fine.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
