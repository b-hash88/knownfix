import { clientSetup } from './mcp-client-configs.mjs';
export const ENDPOINT = 'https://knownfix-backend-28.b-hash88.deno.net/mcp?utm_source=site-kit&utm_campaign=mcp-connect-20261010';

export function connectionSnippet(kind) {
  const setup = clientSetup(kind, ENDPOINT);
  if (setup) return setup.text;
  const request = kind === 'initialize'
    ? { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'knownfix-connection-kit', version: '1' } } }
    : kind === 'tools-list' ? { jsonrpc: '2.0', id: 2, method: 'tools/list' }
    : kind === 'overview' ? { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_overview', arguments: {} } }
    : kind === 'search' ? { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'search_fixes', arguments: { query: '__dirname is not defined in ES module scope' } } }
    : kind === 'free-skill' ? { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'get_free_skill', arguments: { id: 'api-response-triage' } } }
    : null;
  if (request) return JSON.stringify(request, null, 2);
  if (kind === 'vscode') return JSON.stringify({ servers: { knownfix: { type: 'http', url: ENDPOINT } } }, null, 2);
  return JSON.stringify({ mcpServers: { knownfix: { url: ENDPOINT } } }, null, 2);
}

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function checkConfig(text) {
  if (!text.trim()) return { ok: false, errors: ['Configuration is empty.'], warnings: [], servers: [] };
  if (text.length > 200000) return { ok: false, errors: ['Configuration exceeds 200,000 characters.'], warnings: [], servers: [] };
  let data;
  try { data = JSON.parse(text); } catch { return { ok: false, errors: ['Invalid JSON. Check commas, quotes and trailing commas.'], warnings: [], servers: [] }; }
  if (!object(data)) return { ok: false, errors: ['The root must be a JSON object.'], warnings: [], servers: [] };
  const servers = Object.hasOwn(data, 'mcpServers') ? data.mcpServers : data.servers;
  if (!object(servers) || Object.keys(servers).length === 0 || Object.keys(servers).length > 128) return { ok: false, errors: ['Expected 1 to 128 servers in mcpServers or servers.'], warnings: [], servers: [] };
  const result = { ok: true, errors: [], warnings: [], servers: [] };
  for (const [name, server] of Object.entries(servers)) {
    // Never reflect configuration names, paths or credential values in the result.
    const label = `Server ${result.servers.length + 1}`;
    const row = { label, transport: 'unknown' };
    result.servers.push(row);
    if (!object(server)) { result.errors.push(`${label}: expected an object.`); continue; }
    if (Object.hasOwn(server, 'url') && Object.hasOwn(server, 'command')) result.errors.push(`${label}: choose url or command, not both.`);
    if (Object.hasOwn(server, 'url')) {
      row.transport = 'HTTP';
      try {
        if (typeof server.url !== 'string') throw new Error();
        const url = new URL(server.url);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.hash) throw new Error();
        if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) result.warnings.push(`${label}: unencrypted remote HTTP; prefer HTTPS.`);
        if (url.search) result.warnings.push(`${label}: query parameters are present; check that they contain no secrets.`);
      } catch { result.errors.push(`${label}: expected an HTTP(S) URL without embedded credentials or a fragment.`); }
      if (server.type && !['http', 'sse', 'streamable-http'].includes(server.type)) result.warnings.push(`${label}: HTTP transport type is not recognized by this checker.`);
    } else if (typeof server.command === 'string' && server.command.trim()) {
      row.transport = 'stdio';
      if (server.args !== undefined && (!Array.isArray(server.args) || server.args.some(a => typeof a !== 'string'))) result.errors.push(`${label}: args must be an array of strings.`);
    } else result.errors.push(`${label}: expected a url or nonempty command.`);
    if (server.env !== undefined || server.headers !== undefined) result.warnings.push(`${label}: env or headers are present; keep credentials private.`);
  }
  result.ok = result.errors.length === 0;
  return result;
}
