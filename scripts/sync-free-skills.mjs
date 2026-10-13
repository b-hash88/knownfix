import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const backend = fileURLToPath(new URL('../../knownfix-release-backend/', import.meta.url));
const site = 'https://b-hash88.github.io/knownfix';
const api = 'https://knownfix-backend-28.b-hash88.deno.net';
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const write = (name, value) => fs.writeFileSync(path.join(root, name), value);
const data = JSON.parse(fs.readFileSync(path.join(backend, 'free-skills.json'), 'utf8'));
const esc = text => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const download = skill => `<a href="${api}/free-skill/${skill.id}" data-knownfix-event="free_skill_download" data-knownfix-context="${skill.id}">Download SKILL.md</a>`;
const template = read('free-skills/release-smoke-check.html');
const bodyStart = '<body><main>';
const pageHead = template.slice(0, template.indexOf(bodyStart));
const analyticsHead = head => head.replace(/(?:,free_skill_download:1)+/g, '').replace('merch_click:1', 'merch_click:1,free_skill_download:1');
const footer = '<footer><p>Free under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Attribution: KnownFix. No account or payment required.</p></footer></main></body></html>\n';
const nav = `<nav><a href="${site}/"><img src="${site}/knownfix-icon.png" width="32" height="32" alt="">KnownFix</a><a href="${site}/free-skills.html">Free Skills</a><a href="${site}/mcp-connect.html">MCP Connection Kit</a><a href="${site}/services.html">Evidence Audit</a></nav>`;

write('free-skills.json', JSON.stringify(data, null, 2) + '\n');
for (const skill of data.skills) {
  write(`free-skills/${skill.id}.md`, skill.body);
  const head = pageHead
    .replace(/<title>.*?<\/title>/, `<title>${esc(skill.title)} | KnownFix</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(skill.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${site}/free-skills/${skill.id}.html$2`)
    ;
  write(`free-skills/${skill.id}.html`, `${analyticsHead(head)}${bodyStart}${nav}<h1>${esc(skill.title)}</h1><p>${esc(skill.description)}</p><p>${download(skill)}</p><pre>${esc(skill.body)}</pre>${footer}`);
}
const description = 'Free workflows for bug reports, release checks, MCP connections, website search readiness and API response triage.';
let hub = read('free-skills.html');
hub = hub.slice(0, hub.indexOf(bodyStart))
  .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
  ;
write('free-skills.html', `${analyticsHead(hub)}${bodyStart}${nav}<h1>Free Skills for Codex and Claude</h1><p>${description}</p><p><a href="./mcp-connect.html">MCP connection kit</a> · <a href="./mcp-response.html">MCP Response Inspector</a></p><label for="skill-filter">Find a workflow</label><input id="skill-filter" type="search" autocomplete="off" placeholder="MCP, release, bug report..."><p id="skill-count" role="status">${data.skills.length} workflows</p>${data.skills.map(s => `<section data-skill><h2><a href="./free-skills/${s.id}.html">${esc(s.title)}</a></h2><p>${esc(s.description)}</p>${download(s)}</section>`).join('\n')}<script type="module" src="./scripts/skill-filter.mjs"></script>${footer}`);

let index = read('index.html');
for (const skill of data.skills) {
  if (!index.includes(`./free-skills/${skill.id}.html`)) {
    index = index.replace('<h2 id="tools">Tools</h2>', `<h2 id="tools">Tools</h2>\n<article class="tool"><h3><a href="./free-skills/${skill.id}.html">${esc(skill.title)}</a> <span class="badge">Free in full</span></h3><p>${esc(skill.description)}</p></article>`);
  }
}
write('index.html', index);
for (const name of ['llms.txt', 'llms-full.txt']) {
  let value = read(name);
  for (const s of data.skills) {
    if (!value.includes(`${site}/free-skills/${s.id}.md`)) {
      value += `\n- [${s.title}](${site}/free-skills/${s.id}.md): ${s.description}\nTracked backend download: ${api}/free-skill/${s.id}\nMCP resource: knownfix://free-skill/${s.id}\n`;
      if (name === 'llms-full.txt') value += '\n' + s.body;
    }
  }
  write(name, value);
}
let sitemap = read('sitemap.xml');
for (const s of data.skills) {
  const url = `${site}/free-skills/${s.id}.html`;
  if (!sitemap.includes(url)) sitemap = sitemap.replace('</urlset>', `<url><loc>${url}</loc></url></urlset>`);
}
write('sitemap.xml', sitemap);
console.log(`Synced ${data.skills.length} workflows; mirrors remain available, primary download links use tracked backend.`);
