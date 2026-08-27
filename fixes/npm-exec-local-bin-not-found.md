# npm exec says the package command is not recognized inside its own source directory

```
'<command>' is not recognized as an internal or external command, operable program or batch file.
```

## Also matches
- `knownfix is not recognized as an internal or external command`
- `npm exec --package=<name>@<version> -- <command> exits 1 in the matching package root`
- `npx cannot find a package binary while testing from that package's source directory`

**Tags:** npm, npx, release, windows, package · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
npm exec treats an exact package name and version already present in the local project as satisfying --package. Inside that package's own source root, its bin declaration exists but no installed node_modules/.bin shim places the command on PATH, so npm does not fetch a separate registry copy and the Windows shell reports that the command is not recognized. From a neutral consumer directory, no local match exists, so npm installs the requested package into its cache and adds the package executable to PATH.

## Fix
Test a published executable from a neutral directory outside the package source tree. Inside the source checkout, invoke the local bin entry directly or through a repository script; do not use that same checkout as proof that the registry artifact installs.

### Commands
```text
npm view <name>@<version> dist.integrity
cd <neutral-directory-outside-the-package-source-tree>
npm exec --yes --package=<name>@<version> -- <command> --help
```

## Verification
Reproduced on Windows 11 with Node 24.15.0 and npm 11.12.1. A disposable package root named knownfix at version 0.3.13 with a matching bin declaration returned exit 1 and the exact not-recognized message. The identical npm exec command from a neutral consumer package returned exit 0 and ran the public knownfix@0.3.13 binary. npm's current official npm-exec documentation confirms exact local name/version matches satisfy --package, while fetched packages are installed into a cache directory that is added to PATH.

## Gotcha
A successful local node invocation proves the source entry point works; a successful neutral npm exec proves the published package can be fetched and linked. They are different release checks. Do not hide the distinction with a global install.

## Authoritative sources
- [npm exec command documentation](https://docs.npmjs.com/cli/v11/commands/npm-exec)

## Technical discussion
[Why npm exec misses a published CLI inside its matching source tree](https://github.com/b-hash88/knownfix/discussions/2)

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
