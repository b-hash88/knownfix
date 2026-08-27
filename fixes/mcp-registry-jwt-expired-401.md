# MCP Registry publish 401: Invalid or expired Registry JWT token

```
publish failed: server returned status 401 ... token has invalid claims: token is expired
```

**Tags:** mcp, mcp-registry, auth · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
The Registry JWT issued after `mcp-publisher login` is short-lived. If time passes between login and publish, the token expires and the official registry returns 401 even when `server.json` is otherwise valid.

## Fix
Validate first, then run `mcp-publisher login <provider>` immediately before `mcp-publisher publish`. Treat the Registry JWT as a secret and do not print, copy into an agent prompt, or persist it in the repository.

## Verification
Reproduced again on 2026-08-27: the official publisher validated the same server.json, then publish returned 401 with 'token is expired'. This isolates authentication freshness from manifest validity.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
