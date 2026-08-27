# MCP Server Operations Pack

Diagnose, publish, and operate MCP servers across stdio and Streamable HTTP without mixing legacy initialize/session behavior with the stateless 2026-07-28 protocol era.

**Price:** $6.00 USDC on Base, or a signed exact-ETH equivalent  
**Contents:** four complete fixes, a failure-surface decision tree, dual-era transport checks, tool-contract preflight, and registry readback  
**Updated for:** MCP 2026-07-28, TypeScript SDK v2 migration guidance, and the current official Registry schema

## Included failures

- [Env var set for an MCP stdio server never arrives](https://b-hash88.github.io/knownfix/fixes/mcp-stdio-env-not-inherited.md) - `MCP server ignores environment variable set in parent shell`
- [MCP Registry publish fails 422: description exceeds 100 characters](https://b-hash88.github.io/knownfix/fixes/mcp-registry-description-100-char-422.md) - `validation failed: expected length <= 100, location body.description`
- [MCP Registry publish 401: Invalid or expired Registry JWT token](https://b-hash88.github.io/knownfix/fixes/mcp-registry-jwt-expired-401.md) - `publish failed: server returned status 401 ... token has invalid claims: token is expired`
- [Loading deferred MCP tools one at a time wastes a round-trip per tool](https://b-hash88.github.io/knownfix/fixes/mcp-tool-search-batching.md) - `repeated ToolSearch select: calls for tools from the same server`

## Free decision preview

1. If a local server never starts or a variable is missing, inspect the stdio command, working directory, and the child environment declared by the client. Do not move secrets into tool arguments.
2. If a remote server gets 404, 405, CORS, or an HTML response, verify the exact endpoint, method, Origin policy, and public proxy path.
3. If discovery fails, identify the protocol era: legacy clients use `initialize`; modern 2026-07-28 clients use `server/discover` and per-request metadata without protocol sessions.
4. If tools list but clients reject or grade them poorly, check descriptions, parameter documentation, output schemas, structured results, and truthful risk annotations.
5. If registry publication fails, separate package availability, namespace ownership, manifest validation, and short-lived authentication before changing metadata.

The paid pack supplies exact checks, safe operating rules, current protocol distinctions, and a seven-step verification ladder. Call KnownFix's `get_skill` MCP tool with product id `mcp-server-operations-pack` alone for signed USDC and ETH checkout; `get_offer` is optional.

[KnownFix storefront](https://b-hash88.github.io/knownfix/) · [Agent store guide](https://b-hash88.github.io/knownfix/llms.txt) · [Live skill shelf](https://knownfix-backend-28.b-hash88.deno.net/skills)
