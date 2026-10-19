import { connectionSnippet } from './mcp-kit-core.mjs';
import { EXAMPLE } from './mcp-response-core.mjs';
import { DEFAULT_PLAN } from './retry-planner-core.mjs';

const json = value => JSON.stringify(value, null, 2);
const endpoint = 'https://knownfix-backend-28.b-hash88.deno.net/mcp';

export const CONFIG_EXAMPLES = {
  remote: { label: 'Remote HTTP configuration', text: connectionSnippet('remote'), expected: 'Structure passes. The campaign query produces a reminder to keep secrets out of URLs.' },
  stdio: { label: 'Local stdio configuration', text: json({ mcpServers: { example: { command: 'node', args: ['./example-server.mjs'] } } }), expected: 'Structure passes with one stdio server. The example file is illustrative and is not supplied or executed.' },
  conflict: { label: 'Conflicting transports', text: json({ mcpServers: { example: { url: endpoint, command: 'node' } } }), expected: 'Needs attention: choose url or command, not both.' },
};

export const RESPONSE_EXAMPLES = {
  result: { label: 'Result envelope', text: EXAMPLE, expected: 'Envelope structure passes. An empty tool list is not evidence that a useful tool ran.' },
  tool: { label: 'Tool-level failure', text: json({ jsonrpc: '2.0', id: 1, result: { isError: true, content: [{ type: 'text', text: 'Synthetic example failure.' }] } }), expected: 'Envelope structure passes, with a tool-level error flag. Structural success is not task success.' },
  conflict: { label: 'Result and error together', text: json({ jsonrpc: '2.0', id: 1, result: {}, error: { code: -32603, message: 'Synthetic example error.' } }), expected: 'Needs attention: a response must contain exactly one of result or error.' },
};

export const RETRY_EXAMPLES = {
  standard: { label: 'Six attempts, generous budget', config: { ...DEFAULT_PLAN }, expected: 'Maximum 215 seconds; expected 137.5 seconds; all 6 attempts fit the 600-second budget.' },
  tight: { label: 'Six attempts, 65-second budget', config: { ...DEFAULT_PLAN, budget: 65 }, expected: 'Maximum 215 seconds; only 3 of 6 attempts fit the 65-second budget.' },
  capped: { label: 'Fixed waits with a 30-second cap', config: { ...DEFAULT_PLAN, maxDelay: 30, budget: 120, jitter: 'none' }, expected: 'Maximum and expected duration 155 seconds; 5 of 6 attempts fit the 120-second budget.' },
};
