import { EXAMPLE, inspectResponse, responseReceipt } from './mcp-response-core.mjs';
const input = document.getElementById('response-input');
const output = document.getElementById('response-result');
const copy = document.getElementById('copy-receipt');
const status = document.getElementById('response-status');
let receipt = '', revision = 0;
function clearResult() { revision++; receipt = ''; output.replaceChildren(); copy.disabled = true; status.textContent = ''; }
function track(action) { window.knownfixTrack?.('mcp_response_action', action); }
input.addEventListener('input', clearResult);
document.getElementById('response-example').addEventListener('click', () => { input.value = EXAMPLE; clearResult(); input.focus(); });
document.getElementById('response-clear').addEventListener('click', () => { input.value = ''; clearResult(); input.focus(); });
document.getElementById('response-form').addEventListener('submit', event => {
  event.preventDefault(); clearResult();
  const result = inspectResponse(input.value);
  const heading = document.createElement('h3'); heading.textContent = result.ok ? 'Envelope structure passed' : 'Response needs attention';
  const kind = document.createElement('p'); kind.textContent = result.kind;
  const list = document.createElement('ul');
  for (const message of [...result.errors, ...result.warnings]) { const li = document.createElement('li'); li.textContent = message; list.append(li); }
  output.append(heading, kind, list); receipt = responseReceipt(result); copy.disabled = false; track('check');
});
copy.addEventListener('click', async () => {
  const current = revision;
  try { await navigator.clipboard.writeText(receipt); if (revision === current) status.textContent = 'Checklist copied. Input omitted.'; track('copy-checklist'); }
  catch { if (revision === current) status.textContent = 'Clipboard unavailable. The checklist remains visible above.'; }
});
