# MCP Registry publish 401: Invalid or expired Registry JWT token

```
publish failed: server returned status 401 ... token has invalid claims: token is expired
```

## Also matches
- `Invalid or expired Registry JWT token`
- `failed to parse token: token has invalid claims: token is expired`
- `mcp-publisher publish failed 401 Unauthorized`

**Tags:** mcp, mcp-registry, auth, github-actions, oidc · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
The Registry JWT cached after `mcp-publisher login github` is short-lived. `mcp-publisher validate` checks manifest and package validity but does not refresh or prove that publish credential, so validation can pass immediately before publication returns 401. GitHub CLI authentication is a separate credential boundary and does not refresh the Registry JWT.

## Fix
For a one-off release, validate, run `mcp-publisher login github`, and publish immediately. For recurring GitHub-hosted releases, give only the publication job `contents: read` and `id-token: write`, then use `mcp-publisher login github-oidc` immediately before publish; no long-lived Registry token is needed. Pin the official publisher release and verify its checksum before execution.

### Commands
```text
mcp-publisher validate
mcp-publisher login github
mcp-publisher publish
mcp-publisher login github-oidc
```

## Verification
Reproduced on 2026-08-27: the official publisher validated the same server.json, then publish returned 401 with 'token is expired'. KnownFix moved publication to a checksum-pinned GitHub OIDC workflow; run 33091436542 authenticated with github-oidc, published version 0.3.15, and the public Registry API returned that exact version, remote endpoint, icon, and unchanged npm bridge.

## Gotcha
A green `mcp-publisher validate` result says nothing about JWT freshness, and `gh auth status` reports a different credential. Registry versions are immutable, so after fixing authentication publish a new unique server version rather than retrying metadata under an existing version.

## Authoritative sources
- [Official MCP Registry authentication](https://modelcontextprotocol.io/registry/authentication)
- [Official MCP Registry GitHub Actions publishing](https://modelcontextprotocol.io/registry/github-actions)
- [Official MCP Registry versioning](https://modelcontextprotocol.io/registry/versioning)
- [mcp-publisher v1.8.1 release](https://github.com/modelcontextprotocol/registry/releases/tag/v1.8.1)

Reviewed: 2026-08-27

## Technical discussion
[MCP Registry publish 401 after a green validate: the JWT expired](https://github.com/b-hash88/knownfix/discussions/4)

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
