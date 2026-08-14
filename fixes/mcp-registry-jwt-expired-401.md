# MCP Registry publish 401: Invalid or expired Registry JWT token

```
publish failed: server returned status 401 ... token has invalid claims: token is expired
```

**Tags:** mcp, mcp-registry, auth · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
The mcp-publisher login JWT is short-lived. If time passes between `mcp-publisher login` and `mcp-publisher publish`, the token expires and publish returns 401.

## Fix
Re-run `mcp-publisher login <provider>` immediately before publish. With GitHub, if the app is already authorized the device-flow re-auth is near-instant.

## Verification
This session: a publish 401'd with 'token is expired' about 30 minutes after login; re-login then publish succeeded on the same server.json.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
