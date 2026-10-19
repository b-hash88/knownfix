import { checkConfig, connectionSnippet, ENDPOINT } from './mcp-kit-core.mjs';
import { CONFIG_EXAMPLES } from './tool-examples.mjs';
import { clientSetup, installationLinks } from './mcp-client-configs.mjs';

const select = document.getElementById('snippet-kind');
const code = document.getElementById('snippet-output');
const status = document.getElementById('kit-status');
const input = document.getElementById('config-input');
let revision = 0;
function track(action) { window.knownfixTrack?.('mcp_kit_action', action); }
function update() {
  revision++;
  status.textContent = '';
  code.textContent = connectionSnippet(select.value);
  document.getElementById('snippet-filename').textContent = clientSetup(select.value)?.filename || (select.value === 'remote' ? 'Remote JSON example (client schema varies)' : 'JSON-RPC request body');
  document.getElementById('request-endpoint').textContent = ENDPOINT;
}
select.addEventListener('change', update);
document.getElementById('copy-snippet').addEventListener('click', async () => {
  const current = revision;
  try { await navigator.clipboard.writeText(code.textContent); if (current === revision) status.textContent = 'Copied.'; track('copy-snippet'); }
  catch { if (current === revision) status.textContent = 'Clipboard unavailable. Select the snippet to copy it.'; }
});
document.getElementById('download-snippet').addEventListener('click', () => {
  const extension = clientSetup(select.value)?.extension || 'json';
  const url = URL.createObjectURL(new Blob([code.textContent + '\n'], { type: extension === 'json' ? 'application/json' : 'text/plain' }));
  const link = document.createElement('a'); link.href = url; link.download = 'knownfix-mcp.' + extension; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Snippet downloaded.'; track('download-snippet');
});
function invalidateConfig() { document.getElementById('config-result').replaceChildren(); }
input.addEventListener('input', invalidateConfig);
document.getElementById('load-example').addEventListener('click', () => {
  const key = document.getElementById('example-case')?.value || 'remote';
  const example = Object.hasOwn(CONFIG_EXAMPLES, key) && CONFIG_EXAMPLES[key];
  if (!example) return;
  input.value = example.text; invalidateConfig(); input.focus(); track('example-' + key);
});
document.getElementById('clear-config').addEventListener('click', () => { input.value = ''; document.getElementById('config-result').replaceChildren(); input.focus(); });
document.getElementById('config-form').addEventListener('submit', event => {
  event.preventDefault();
  const result = checkConfig(input.value);
  const output = document.getElementById('config-result'); output.replaceChildren();
  const title = document.createElement('strong'); title.textContent = result.ok ? 'Structure passed. Connection not tested.' : 'Configuration needs attention.'; output.append(title);
  const list = document.createElement('ul');
  for (const text of [...result.errors, ...result.warnings, ...result.servers.map(s => `${s.label}: ${s.transport}`)]) { const item = document.createElement('li'); item.textContent = text; list.append(item); }
  output.append(list); track('config-check');
});
for (const [client, href] of Object.entries(installationLinks(ENDPOINT))) document.getElementById('install-' + client)?.setAttribute('href', href);
update();
