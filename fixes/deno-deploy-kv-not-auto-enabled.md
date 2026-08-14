# Deno KV reads empty on new Deno Deploy until you attach a database

```
kv appears disabled / Deno.openKv() bound but reads and writes are empty on console.deno.com
```

**Tags:** deno, deno-deploy, kv, serverless · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
The new Deno Deploy (console.deno.com) does not auto-provision Deno KV the way Deploy Classic did. Deno.openKv() can succeed but stay unbound until a KV database is explicitly attached to the app.

## Fix
In the app's Databases tab, Provision a Deno KV database then Attach it. The binding applies to the running deployment with no redeploy. Expose a health field that reports whether KV is bound so you notice this immediately.

## Verification
This session: first deploy reported kv:false; attaching KV via the Databases tab flipped it to kv:true with zero code change.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
