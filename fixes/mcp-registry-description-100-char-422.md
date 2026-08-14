# MCP Registry publish fails 422: description exceeds 100 characters

```
validation failed: expected length <= 100, location body.description
```

**Tags:** mcp, mcp-registry, publishing · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
The MCP Registry server.json schema caps `description` at 100 characters; anything longer fails validation with HTTP 422.

## Fix
Trim server.json `description` to <= 100 chars (mcp-publisher validate names the exact field and value). Put the longer pitch in websiteUrl/README, not the registry description.

## Verification
This session: mcp-publisher validate returned 422 on a 103-char description; trimming to 92 passed.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
