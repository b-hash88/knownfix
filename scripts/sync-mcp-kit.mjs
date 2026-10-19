import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const site = 'https://b-hash88.github.io/knownfix';
const read = f => fs.readFileSync(new URL(f, root), 'utf8');
const write = (f, value) => fs.writeFileSync(new URL(f, root), value);
const description = 'Free MCP JSON configuration checker and connection request kit. Configuration stays in your browser.';
const template = read('free-skills.html');
const head = template.slice(0, template.indexOf('</head>'))
  .replace(/<title>.*?<\/title>/, '<title>MCP Connection Kit and JSON Config Checker | KnownFix</title>')
  .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
  .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${site}/mcp-connect.html$2`)
  .replace('pageType="free-skill"', 'pageType="mcp-kit"')
  .replace(/var allowedEvents=\{[^}]*\}/, 'var allowedEvents={mcp_kit_action:1}');
const style = `<style>
:root{color-scheme:light;--paper:#f2f4f1;--ink:#151912;--muted:#566157;--rule:#c6cfc5;--accent:#12564e;--blue:#245d83;--flag:#995812}
*{box-sizing:border-box;letter-spacing:0}body{background:var(--paper);color:var(--ink);font:16px/1.6 system-ui,sans-serif}main{max-width:1100px;padding:28px 24px 64px}a{color:var(--accent);text-underline-offset:.2em}nav{align-items:center;padding-bottom:20px;border-bottom:2px solid var(--ink)}nav img{width:32px;height:32px}h1{font-size:32px;margin:28px 0 8px;line-height:1.15}h2{font-size:21px;margin:0 0 20px}p{max-width:70ch}.muted{color:var(--muted)}.kit-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:32px;margin-top:30px}.kit-grid section{margin:0;padding:24px 0;border-top:1px solid var(--rule);min-width:0}label{display:block;font-weight:600;margin-bottom:8px}select,textarea,button{font:inherit;border-radius:3px}select{width:100%;min-height:44px;padding:8px;border:1px solid var(--rule);background:#fff;color:var(--ink)}textarea{width:100%;min-height:260px;resize:vertical;padding:14px;font:14px/1.6 ui-monospace,Consolas,monospace;border:1px solid var(--rule);background:#fff;color:var(--ink);caret-color:var(--accent)}pre{padding:16px;border:1px solid var(--rule);background:#fff;min-height:220px;font:14px/1.6 ui-monospace,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}code{overflow-wrap:anywhere;font:13px/1.6 ui-monospace,Consolas,monospace}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}button{min-height:44px;border:1px solid var(--accent);background:var(--accent);color:#fff;padding:8px 14px;cursor:pointer;font-weight:600}button.secondary{background:transparent;color:var(--accent)}button:hover{background:var(--blue);border-color:var(--blue);color:#fff}a:focus-visible,button:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid var(--flag);outline-offset:3px}::selection{background:#c4e5da;color:#151912}.status{min-height:26px;color:var(--blue)}#config-result{min-height:100px;overflow-wrap:anywhere}#config-result li{margin:6px 0}.resources{display:flex;gap:18px;flex-wrap:wrap}.kit-links{padding-top:24px;border-top:1px solid var(--rule)}footer{margin-top:36px;border-top:1px solid var(--rule);padding-top:20px}@media(max-width:720px){main{padding:20px 18px 48px}.kit-grid{grid-template-columns:1fr;gap:12px}h1{font-size:28px}nav{gap:14px}.kit-grid section{padding:22px 0}}
</style>`;
const controlStyle = '<style>#snippet-kind,#config-input{border-color:#677466}</style>';
const body = `<body><main>
<nav aria-label="Main"><a href="./"><img src="./knownfix-icon.png" alt="">KnownFix</a><a href="./free-skills.html">Free skills</a><a href="./free-fixes.html">Free fixes</a><a href="./privacy.html">Privacy</a></nav>
<h1>KnownFix MCP Connection Kit</h1><p class="muted">Streamable HTTP · Free · No account or payment</p>
<div class="kit-grid">
<section aria-labelledby="snippet-heading"><h2 id="snippet-heading">Connection snippets</h2>
<label for="snippet-kind">Client or request</label><select id="snippet-kind"><option value="remote">Remote JSON example</option><option value="claude-code">Claude Code command</option><option value="codex">Codex TOML</option><option value="cursor">Cursor JSON</option><option value="vscode">VS Code JSON</option><option value="claude-desktop">Claude Desktop stdio bridge</option><option value="initialize">Initialize request</option><option value="tools-list">Tool discovery request</option><option value="overview">Complete KnownFix overview request</option><option value="search">Free fix search request</option><option value="free-skill">Retrieve a free workflow</option></select>
<p class="muted" id="snippet-filename"></p><pre><code id="snippet-output"></code></pre>
<div class="actions"><button type="button" id="copy-snippet">Copy snippet</button><button class="secondary" type="button" id="download-snippet">Download snippet</button></div><p id="kit-status" class="status" role="status"></p>
<div class="resources"><a id="install-vscode">Add to VS Code</a><a id="install-cursor">Add to Cursor</a></div>
<details><summary>HTTP request details</summary><p><code>POST</code> <code id="request-endpoint"></code></p><p><code>Content-Type: application/json</code><br><code>Accept: application/json, text/event-stream</code></p><p class="muted">Protocol example: 2025-06-18. Client configuration schemas vary; JSON-RPC bodies are not configuration files. Requests are not sent by this page.</p></details>
</section>
<section aria-labelledby="config-heading"><h2 id="config-heading">Check JSON configuration</h2>
<form id="config-form"><label for="config-input">MCP configuration</label><textarea id="config-input" maxlength="200000" spellcheck="false" autocomplete="off" placeholder='{"mcpServers":{"knownfix":{"url":"https://.../mcp"}}}'></textarea>
<div class="actions"><button type="submit">Check configuration</button><button type="button" class="secondary" id="load-example">Load example</button><button type="button" class="secondary" id="clear-config">Clear</button></div></form>
<p class="muted">Configuration stays in this browser. It is not saved or uploaded. This is a structure check, not a live connection or security audit.</p><div id="config-result" role="status" aria-live="polite"></div>
</section></div>
<section class="kit-links" aria-labelledby="client-setup"><h2 id="client-setup">Client setup</h2>
<p>KnownFix public discovery and free workflows need no API key. Review the server and approve only the tools you intend to use. Never put an owner-stats credential in client configuration.</p>
<dl><dt><strong>Claude Code</strong></dt><dd>Use the terminal command above from your project, then check <code>/mcp</code>. This is not a Claude Desktop JSON file.</dd>
<dt><strong>Codex</strong></dt><dd>Merge the TOML section into <code>~/.codex/config.toml</code> without replacing existing settings. <code>codex mcp list</code> confirms configuration, not a successful tool result.</dd>
<dt><strong>VS Code / Cursor</strong></dt><dd>Use the install link and review the prompt, or merge the corresponding JSON into the named project file. Existing entries should be preserved.</dd>
<dt><strong>Claude Desktop</strong></dt><dd>The JSON example uses the version-pinned local stdio bridge and requires Node.js/npm. Its first launch downloads the package. Review the command and restart the client after merging its configuration. Remote-connector UI availability depends on the client/account.</dd></dl>
<p>Formats follow the linked official documentation. Snippet syntax and the public MCP lifecycle are checked separately; a saved config or install link does not prove every client/version connected.</p>
<div class="resources"><a href="https://code.claude.com/docs/en/mcp">Claude Code</a><a href="https://developers.openai.com/learn/docs-mcp">Codex</a><a href="https://code.visualstudio.com/api/extension-guides/ai/mcp">VS Code</a><a href="https://cursor.com/docs/context/mcp">Cursor</a></div>
</section>
<section class="kit-links" aria-labelledby="first-result"><h2 id="first-result">First free result</h2>
<ol><li><strong>Configured:</strong> the client has saved the KnownFix entry.</li><li><strong>Discovered:</strong> initialization succeeds and <code>tools/list</code> includes <code>get_free_skill</code>.</li><li><strong>Successfully used:</strong> call <code>get_free_skill</code> with <code>{&quot;id&quot;:&quot;api-response-triage&quot;}</code>. Confirm a non-error result containing the full <strong>API Response Triage</strong> workflow and its acceptance checklist.</li></ol>
<p>Suggested request: “Use KnownFix to retrieve the free api-response-triage workflow. Do not buy anything, create an order, or send private input.” A catalog listing alone is not a completed tool call.</p>
<p><a href="./toolkit/README.md">Install the six free skills and local CLI toolkit</a> · <a href="./agents.html">Complete agent catalog</a></p>
</section>
<section class="kit-links"><h2>Connection references</h2><div class="resources"><a href="./free-skills/mcp-connection-triage.html">MCP Connection Triage</a><a href="https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle">MCP lifecycle</a><a href="https://code.visualstudio.com/docs/copilot/customization/mcp-servers">VS Code MCP settings</a><a href="https://knownfix-backend-28.b-hash88.deno.net/books">Owner stats (sign-in required)</a></div></section>
<footer><a href="./mcp-response.html">MCP Response Inspector</a> · <a href="./webhook-retry.html">Webhook Retry Planner</a> · <a href="./free-skills.html">Free workflow skills</a> · <a href="./">KnownFix catalog</a> · <a href="./privacy.html">Analytics choice</a></footer>
</main><script type="module" src="./scripts/mcp-kit.mjs"></script></body></html>\n`;
write('mcp-connect.html', head + style + controlStyle + '</head>' + body);
for (const f of ['llms.txt', 'llms-full.txt']) {
  let text = read(f);
  if (!text.includes('/mcp-connect.html')) text += `\n## Free MCP connection kit\n${site}/mcp-connect.html\nBrowser-local JSON structure checks and copyable KnownFix requests. Does not test a live connection. Only consent-gated fixed action events; pasted configuration is never sent.\n`;
  write(f, text);
}
let sitemap = read('sitemap.xml');
if (!sitemap.includes('/mcp-connect.html')) sitemap = sitemap.replace('</urlset>', `<url><loc>${site}/mcp-connect.html</loc></url></urlset>`);
write('sitemap.xml', sitemap);
console.log('MCP connection kit generated; discovery updated.');
await import('./sync-tool-guides.mjs');
