import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inspectResponse } from '../scripts/mcp-response-core.mjs';
import { planRetries, DEFAULT_PLAN } from '../scripts/retry-planner-core.mjs';
import { clientSetup, installationLinks, MCP_ENDPOINT } from '../scripts/mcp-client-configs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const skills = JSON.parse(read('free-skills.json')).skills;
assert.equal(skills.length, 6);
assert.equal(JSON.parse(read('services.json')).services.length, 10);
assert.match(read('README.md'), /ten scoped services/);
for (const skill of skills) {
  const body = read(`skills/${skill.id}/SKILL.md`);
  assert(body.startsWith(`---\nname: ${skill.id}\ndescription: `));
  assert(body.includes('license: CC-BY-4.0\n---'));
  assert(body.includes(skill.body.replace(/\r\n/g, '\n').split('\n---\n')[1]));
  assert(read(`skills/${skill.id}/references/examples.md`).includes('## Expected result'));
}
for (const file of ['mcp-response-core.mjs', 'retry-planner-core.mjs']) {
  for (const dest of ['toolkit/lib', 'skills/api-response-triage/scripts/lib', 'skills/webhook-delivery-triage/scripts/lib']) assert.equal(read(`${dest}/${file}`), read(`scripts/${file}`));
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'knownfix-toolkit-'));
try {
  const deny = path.join(temp, 'deny-network.mjs');
  fs.writeFileSync(deny, "import http from 'node:http'; import https from 'node:https'; import net from 'node:net'; import tls from 'node:tls'; import {syncBuiltinESMExports} from 'node:module'; const deny=()=>{throw new Error('NETWORK_FORBIDDEN')}; globalThis.fetch=deny; http.request=https.request=http.get=https.get=net.connect=net.createConnection=tls.connect=deny; syncBuiltinESMExports();");
  const cli = (args, input, entry = 'toolkit/cli.mjs') => {
    const result = spawnSync(process.execPath, ['--import', pathToFileURL(deny).href, path.isAbsolute(entry) ? entry : path.join(root, entry), ...args], { input, encoding: 'utf8', timeout: 5000, maxBuffer: 1000000 });
    assert(!result.error, result.error?.message);
    assert.equal(result.stderr, '');
    return { code: result.status, value: JSON.parse(result.stdout) };
  };
  const sample = read('toolkit/examples/response.json');
  assert.deepEqual(cli(['inspect-response', '-'], sample), { code: 0, value: inspectResponse(sample) });
  assert.equal(cli(['inspect-response', '-'], '{"private":"CANARY"}').code, 2);
  assert(!JSON.stringify(cli(['inspect-response', '-'], 'CANARY')).includes('CANARY'));
  assert.equal(cli(['inspect-response', '-'], 'x'.repeat(200001)).value.error.code, 'INPUT_TOO_LARGE');
  assert.equal(cli(['inspect-response', path.join(temp, 'missing-CANARY')]).code, 1);
  assert.equal(cli(['inspect-response', temp]).code, 1);
  assert.equal(cli(['inspect-response', '-'], Buffer.from([0xff])).code, 1);
  assert.equal(cli([]).code, 2);
  assert.equal(cli(['retry-plan', '-'], '{').code, 2);
  assert.equal(cli(['retry-plan', '-'], 'null').code, 2);
  assert.equal(cli(['retry-plan', '-'], JSON.stringify({ ...DEFAULT_PLAN, CANARY: 'private' })).code, 2);
  const planned = cli(['retry-plan', '-'], JSON.stringify(DEFAULT_PLAN));
  assert.equal(planned.code, 0);
  assert.equal(planned.value.durationMax, 215);
  assert.equal(planned.value.attemptsWithinBudget, 6);
  assert.deepEqual(planned.value.rows, planRetries(DEFAULT_PLAN).rows);
  for (const [id, command, example] of [['api-response-triage', 'inspect-response', 'response'], ['webhook-delivery-triage', 'retry-plan', 'retry']]) {
    // An installed skill must work alone, without the source repository or sibling skills.
    const installed = path.join(temp, id);
    fs.cpSync(path.join(root, 'skills', id), installed, { recursive: true });
    assert.equal(cli([command, path.join(installed, 'examples', example + '.json')], undefined, path.join(installed, 'scripts/cli.mjs')).code, 0);
  }
} finally { fs.rmSync(temp, { recursive: true, force: true }); }

for (const client of ['cursor', 'vscode', 'claude-desktop']) assert.doesNotThrow(() => JSON.parse(clientSetup(client).text));
assert.equal(clientSetup('codex').text, `[mcp_servers.knownfix]\nurl = "${MCP_ENDPOINT}"`);
assert.match(clientSetup('claude').text, /^claude mcp add --transport http knownfix /);
const links = installationLinks();
assert.equal(JSON.parse(decodeURIComponent(links.vscode.split('?')[1])).url, MCP_ENDPOINT);
assert.equal(JSON.parse(atob(new URL(links.cursor).searchParams.get('config'))).url, MCP_ENDPOINT);
assert.equal(new URL(links.cursor).searchParams.get('name'), 'knownfix');
assert.match(read('mcp-connect.html'), /Configured:[\s\S]*Discovered:[\s\S]*Successfully used:/);
assert(read('free-skills.html').includes('./toolkit/README.md'));
console.log('PASS six standard skills, standalone installation, offline CLI boundaries/parity, client formats and install-link payloads.');
