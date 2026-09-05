# Fix __dirname is not defined in ES module scope in Node.js

```
ReferenceError: __dirname is not defined in ES module scope
```

## Also matches
- `__filename is not defined in ES module scope`
- `Node.js ESM __dirname Windows path`

**Tags:** node, javascript, esm, modules, windows · **Confidence:** documented · **FREE SAMPLE**

## Cause
An ES module does not receive the CommonJS __dirname binding. This fixture uses a .mjs file, so Node loads it as ESM. Derive the directory from that module's file URL instead of substituting the process working directory.

## Fix
In a file-backed ES module, use dirname(fileURLToPath(import.meta.url)). This preserves native Windows paths and decodes URL characters. On the tested Node 22.23.2 runtime, import.meta.dirname is also available.

```
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);

// Alternative on the tested Node 22.23.2 runtime:
// console.log(import.meta.dirname);
```

## Verification
Local fixture verification, not a production incident: Windows, Node 22.23.2, 2026-09-05 UTC. Two fresh fixture directories and independent Node processes each reproduced the ReferenceError before the change, then exited 0 after the change. Both the URL conversion and import.meta.dirname matched a directory containing spaces and #. A .cjs control confirmed that CommonJS still supplies __dirname.

## Gotcha
process.cwd() is the launch directory, which need not be the module directory. Do not use new URL(import.meta.url).pathname as a native Windows filename. Scope: file-backed Node ESM; browsers, custom loaders and other runtimes were not tested. Keep a CommonJS file as CommonJS when that is the intended module format.

## Authoritative sources
- [Node 22.23.2: ESM and CommonJS differences](https://nodejs.org/download/release/v22.23.2/docs/api/esm.html#no-__filename-or-__dirname)

Reviewed: 2026-09-05

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
