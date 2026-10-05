import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const data = JSON.parse(fs.readFileSync(new URL('../free-skills.json', import.meta.url), 'utf8'));
const site = 'https://b-hash88.github.io/knownfix';
const api = 'https://knownfix-backend-28.b-hash88.deno.net';
const records = [];
const request = async (url, init = {}) => {
  const at = new Date().toISOString();
  const response = await fetch(url, { ...init, headers: { 'x-operator': '1', ...init.headers }, signal: AbortSignal.timeout(25000) });
  const body = await response.text();
  records.push({ at, url, method: init.method || 'GET', status: response.status, sha256: createHash('sha256').update(body).digest('hex') });
  return { response, body };
};
const mcp = async (method, params = {}) => {
  const r = await request(api + '/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  assert.equal(r.response.status, 200);
  return JSON.parse(r.body);
};
let passed = false;
try {
  for (const pass of ['A', 'B']) {
    const catalog = await request(api + '/free-skills');
    assert.deepEqual(JSON.parse(catalog.body).skills, data.skills);
    for (const s of data.skills) {
      const body = await request(api + '/free-skill/' + s.id);
      assert.equal(body.response.status, 200);
      assert.equal(body.body, s.body);
      assert.equal(body.response.headers.get('content-disposition'), 'attachment; filename="SKILL.md"');
      const mirror = await request(site + '/free-skills/' + s.id + '.md');
      assert.equal(mirror.body.replace(/\r\n/g, '\n'), s.body);
      const page = await request(site + '/free-skills/' + s.id + '.html');
      assert.equal(page.response.status, 200);
      assert(page.body.includes(api + '/free-skill/' + s.id));
      assert(page.body.includes('free_skill_download:1'));
      assert(page.body.includes(s.title));
    }
    const hub = await request(site + '/free-skills.html');
    for (const s of data.skills) assert(hub.body.includes(api + '/free-skill/' + s.id));
    console.log(pass + ': four live bodies, mirrors, pages, tracked links and consent event present.');
  }
  const listing = await mcp('resources/list');
  for (const s of data.skills) {
    const uri = 'knownfix://free-skill/' + s.id;
    assert(listing.result.resources.some(r => r.uri === uri));
    assert.equal((await mcp('resources/read', { uri })).result.contents[0].text, s.body);
  }
  assert((await mcp('resources/read', { uri: 'knownfix://free-skill/homepage-builder-prompt' })).error);
  assert.equal((await request(api + '/free-skill/homepage-builder-prompt')).response.status, 404);
  assert.equal((await request(api + '/free-skill/' + data.skills[0].id, { method: 'POST' })).response.status, 405);
  const books = JSON.parse((await request(api + '/books?format=json')).body);
  assert.equal(books.freeWorkflows.spec, 'knownfix-free-workflow-activity/1.0');
  assert.deepEqual(Object.keys(books.freeWorkflows.byId).sort(), data.skills.map(s => s.id).sort());
  records.push({ at: books.generatedAt, observation: 'safe Books projection', freeWorkflows: books.freeWorkflows });
  const dashboard = await request(api + '/books', { headers: { accept: 'text/html' } });
  assert(dashboard.body.includes('id="workflow_activity"'));
  assert(dashboard.body.includes('Free workflow skills'));
  passed = true;
  console.log('Independent MCP readback, paid isolation, method rejection and live Books tracking passed.');
} finally {
  if (process.env.KNOWNFIX_EVIDENCE_PATH) fs.writeFileSync(process.env.KNOWNFIX_EVIDENCE_PATH, JSON.stringify({ at: new Date().toISOString(), environment: { node: process.version, platform: process.platform }, passed, records }, null, 2));
}
