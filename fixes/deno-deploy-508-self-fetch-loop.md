# Deno Deploy returns 508 Loop Detected when a deployment fetches its own URL

```
508 (Loop Detected) on fetch to the app's own *.deno.net hostname
```

**Tags:** deno, deno-deploy, serverless, fetch · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
Deno Deploy blocks a deployment from making subrequests to its own public hostname (loop protection). A self-audit, self-health-check, or any fetch to your own *.deno.net URL from inside the same deployment returns 508.

## Fix
Never fetch your own public URL from within the deployment. Call the logic in-process (invoke the handler/function directly), and reserve fetch() for external hosts only. If you must probe self, do it from an external client.

## Verification
Reproduced this session: an audit tool fetching KnownFix's own deno.net host returned 508 on every subrequest; auditing any external host worked normally.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
