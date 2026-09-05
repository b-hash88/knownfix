# Fix ERR_UNSUPPORTED_DIR_IMPORT in Node.js ES modules

```
Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import is not supported resolving ES modules
```

## Also matches
- `Directory import is not supported resolving ES modules imported from`
- `Node ESM import ./utils index.js`

**Tags:** node, javascript, esm, import, modules · **Confidence:** documented · **FREE SAMPLE**

## Cause
A relative ESM import points to a directory instead of the module file. In the tested native Node loader, './utils' does not automatically resolve './utils/index.mjs'. Name the actual file, including its extension.

## Fix
Replace the relative directory import with an explicit path to the existing module file. For the fixture below, change './utils' to './utils/index.mjs'. If your emitted file is index.js, use that actual filename instead.

```
// utils/index.mjs
export const answer = 42;

// app.mjs: before (ERR_UNSUPPORTED_DIR_IMPORT)
// import { answer } from './utils';

// app.mjs: after
import { answer } from './utils/index.mjs';
console.log(answer); // 42
```

### Commands
```text
node app.mjs
```

## Verification
Local fixture verification, not a production incident: Windows, Node 22.23.2, 2026-09-05 UTC. In two fresh fixture directories, importing './utils' exited 1 with ERR_UNSUPPORTED_DIR_IMPORT. Importing './utils/index.mjs' exited 0 and printed 42. A contradictory-case check importing a nonexistent explicit file produced ERR_MODULE_NOT_FOUND instead.

## Gotcha
Scope: a relative directory import through native Node ESM. Bundlers, TypeScript source resolution, custom loaders and package export maps can use different rules. Inspect the JavaScript that Node actually executes. For a bare package specifier, use the package's documented public exports; do not blindly append /index.js to a dependency.

## Authoritative sources
- [Node 22.23.2: mandatory ESM file extensions](https://nodejs.org/download/release/v22.23.2/docs/api/esm.html#mandatory-file-extensions)
- [Node: ERR_UNSUPPORTED_DIR_IMPORT](https://nodejs.org/api/errors.html#err_unsupported_dir_import)

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
