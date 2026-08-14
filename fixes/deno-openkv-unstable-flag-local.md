# Deno.openKv() throws locally without the --unstable-kv flag

```
Deno.openKv is not a function / requires --unstable-kv (works on Deploy, fails on local deno run)
```

**Tags:** deno, kv, local-dev · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
Deno KV is automatic on Deno Deploy but on a local `deno run` it needs the --unstable-kv flag; without it, Deno.openKv() is unavailable and throws.

## Fix
Run locally with `deno run --unstable-kv ...` (or add it to a deno task). Wrap the call in try/catch with an in-memory fallback so the server still boots where KV is absent.

## Verification
This session: the backend's Deno.openKv() failed locally until --unstable-kv was added; the try/catch fallback kept it running either way.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
