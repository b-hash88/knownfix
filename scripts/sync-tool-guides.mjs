import fs from 'node:fs';
import { CONFIG_EXAMPLES, RESPONSE_EXAMPLES, RETRY_EXAMPLES } from './tool-examples.mjs';

const root = new URL('../', import.meta.url);
const site = 'https://b-hash88.github.io/knownfix';
const read = file => fs.readFileSync(new URL(file, root), 'utf8').replace(/\r\n/g, '\n');
const write = (file, text) => fs.writeFileSync(new URL(file, root), text);
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const replaceBlock = (html, name, block, anchor) => {
  const start = `<!-- ${name}:start -->`, end = `<!-- ${name}:end -->`;
  const wrapped = `${start}\n${block}\n${end}`;
  if (html.includes(start)) return html.slice(0, html.indexOf(start)) + wrapped + html.slice(html.indexOf(end) + end.length);
  if (!html.includes(anchor)) throw new Error(`Missing insertion anchor for ${name}`);
  const index = html.lastIndexOf(anchor);
  return html.slice(0, index) + wrapped + '\n' + html.slice(index);
};

export const guides = [
  {
    id: 'mcp-connection-troubleshooting', tool: 'mcp-connect.html', event: 'mcp_kit_action', heading: 'config-heading', form: 'config-form', examples: CONFIG_EXAMPLES,
    title: 'MCP Connection Troubleshooting: Config, Transport and Initialization',
    description: 'Separate JSON configuration problems from MCP transport and initialization failures. Worked examples and a practical evidence checklist.',
    intro: 'A configuration can be valid JSON and still fail to connect. Start by separating the client configuration, the transport, and the protocol exchange. Each needs different evidence.',
    first: `<ol><li>Record the client and version, the configuration file it actually loads, and whether the server is remote HTTP or a local process. Keep tokens and private paths out of shared notes.</li><li>Check the configuration structure before changing the network. The checker accepts <code>mcpServers</code> or <code>servers</code>, but that does not make either schema valid for every client.</li><li>For an authorized connection test, retain the HTTP status and content type or local-process exit status separately from the JSON-RPC body. Never test a third-party endpoint without permission.</li></ol>`,
    decisions: `<dl><dt>JSON parses, but the client ignores it</dt><dd>Confirm the client-specific schema and file location. The kit's VS Code example uses a <code>servers</code> object; its generic remote example uses <code>mcpServers</code>. A request body with <code>method</code> and <code>params</code> is not a client configuration.</dd><dt>A local process starts and immediately exits</dt><dd>Check the actual command, working directory, dependencies and stderr in your own environment. The synthetic stdio example below only demonstrates shape; it does not provide a server file.</dd><dt>HTTP responds, but discovery fails</dt><dd>Inspect initialization first. For the pinned 2025-06-18 protocol example, send <code>initialize</code>, verify the negotiated version/capabilities, then send <code>notifications/initialized</code> before normal operations. Preserve any required session identifier and negotiated protocol-version header in the client; do not publish them.</dd></dl>`,
    boundary: 'A green structure check does not verify DNS, TLS, authentication, process execution, client support, session state or tool discovery. The page sends no MCP requests. Its HTTP request examples are separate bodies, not a complete session runner. Protocol 2025-06-18 is the kit\'s pinned example, not a claim about the newest revision.',
    sources: [['MCP 2025-06-18 lifecycle', 'https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle'], ['MCP 2025-06-18 Streamable HTTP transport', 'https://modelcontextprotocol.io/specification/2025-06-18/basic/transports'], ['VS Code MCP configuration', 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers']],
    notes: [['Structure passed, connection failed', 'Separate schema validation from transport, authorization and initialization evidence. A passing local check does not contact the server.'], ['Which configuration format applies?', 'Use the format documented for your client. The generic remote example and the VS Code example are not interchangeable.']],
    toolLabel: 'MCP Connection Kit',
  },
  {
    id: 'mcp-response-validation', tool: 'mcp-response.html', event: 'mcp_response_action', heading: 'input-heading', form: 'response-form', examples: RESPONSE_EXAMPLES,
    title: 'MCP Response Validation: JSON-RPC Errors and Tool Failures',
    description: 'Read JSON-RPC result and error envelopes without mistaking structural success for a successful MCP tool call. Synthetic examples and diagnostic boundaries.',
    intro: 'A successful HTTP request, a valid JSON-RPC envelope and a successful tool operation are different observations. Keep all three in the diagnostic record.',
    first: `<ol><li>Keep the response's HTTP status and content type as separate evidence. Do not paste authorization headers, session identifiers or customer data into a public issue.</li><li>Inspect one JSON response object. For an SSE response, identify the relevant JSON message with an appropriate transport client first; the inspector does not decode a stream.</li><li>Compare the response identifier with the request privately. Then read the expected method result schema and the actual operation outcome.</li></ol>`,
    decisions: `<dl><dt>Both result and error are present</dt><dd>A JSON-RPC response must select one of these members. The third example deliberately violates this rule and should fail the envelope check.</dd><dt>The envelope passes, but isError is true</dt><dd>The inspector reports a tool-level error flag. A valid outer envelope does not establish that a tool completed its task. Follow the tool's documented error contract.</dd><dt>The input begins with data: or HTTP headers</dt><dd>That is framing rather than one JSON object. Keep the raw evidence locally and extract the appropriate message without treating a transport frame as a standalone response.</dd></dl>`,
    boundary: 'This is an envelope check, not full MCP conformance. It does not validate method-specific schemas, match request identifiers, detect duplicate JSON keys, verify transport/authentication, or establish a real tool outcome. A parseable result can still contain application-level problems. The copied checklist deliberately omits input, identifiers, payloads and server messages.',
    sources: [['JSON-RPC 2.0 response objects', 'https://www.jsonrpc.org/specification#response_object'], ['MCP 2025-06-18 tool error handling', 'https://modelcontextprotocol.io/specification/2025-06-18/server/tools#error-handling'], ['MCP 2025-06-18 transport framing', 'https://modelcontextprotocol.io/specification/2025-06-18/basic/transports']],
    notes: [['A passing envelope is not a completed task', 'Keep the transport status, JSON-RPC result and tool-level outcome separate. The tool-error example is intentionally valid at the envelope layer.'], ['Streaming frames do not parse', 'The inspector expects one JSON object, not HTTP headers, SSE framing, a batch or a whole transcript.']],
    toolLabel: 'MCP Response Inspector',
  },
  {
    id: 'webhook-retry-budget', tool: 'webhook-retry.html', event: 'retry_planner_action', heading: 'settings-title', form: 'retry-form', examples: RETRY_EXAMPLES,
    title: 'Webhook Retry Budgets: Backoff, Jitter and Delivery Deadlines',
    description: 'Calculate a serial webhook retry window with capped backoff, full jitter and per-attempt timeouts. Worked 215-second and 155-second planning examples.',
    intro: 'A retry count does not describe a delivery deadline. The waits and timeouts can consume the budget long before the final attempt. Model the timing, then compare it with the provider policy.',
    first: `<ol><li>Count total attempts, including the first. Set the timeout for each attempt and a delivery time budget in seconds.</li><li>Use the failure policy from your provider or integration. Do not assume that every status or network failure should be retried.</li><li>Check duplicate handling and a terminal failure path before replaying an event. Use synthetic events in an authorized test environment, not real customer operations.</li></ol>`,
    decisions: `<dl><dt>Why is six attempts 215 seconds?</dt><dd>With a 10-second timeout on each attempt, the six attempts consume 60 seconds. The capped maximum waits are 5, 10, 20, 40 and 80 seconds: another 155 seconds. Maximum modeled duration is 215 seconds.</dd><dt>What changes with full jitter?</dt><dd>This planner uses a uniform wait from zero to each capped delay. Expected total wait is half the sum of those caps, so expected duration is 60 + 77.5 = 137.5 seconds. That is a mean, not a percentile, deadline or delivery guarantee.</dd><dt>What does a 65-second budget allow?</dt><dd>The first three maximum finishes are 10, 25 and 45 seconds; the fourth is 75 seconds. Only three attempts fit that modeled budget, even though a favorable jitter sample could finish sooner.</dd></dl>`,
    boundary: 'All attempts are serial, unsuccessful and consume their full timeout. A wait starts after the previous failure. The model excludes queue latency, network overhead, concurrency, provider retry rules and Retry-After. HTTP Retry-After can express a date or a delay in seconds; account for it separately when the integration uses it. The exported JSON is a planning record, not a provider configuration. This tool sends no webhooks and does not store settings.',
    sources: [['AWS: exponential backoff and jitter', 'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/'], ['HTTP Retry-After semantics (RFC 9110)', 'https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after']],
    notes: [['Expected duration is not a deadline', 'Use the maximum modeled finish for the budget check. Full jitter changes the range and expected wait; it does not guarantee a delivery time.'], ['Your provider uses Retry-After', 'That policy is outside this calculator. Compare the exported plan with the actual provider rules before implementing or replaying anything.']],
    toolLabel: 'Webhook Retry Planner',
  },
];

fs.mkdirSync(new URL('guides/examples/', root), { recursive: true });
const consentTemplate = read('mcp-response.html');
const consentStyle = consentTemplate.match(/<style>\s*#knownfix-analytics-consent[\s\S]*?<\/style>/)[0];
const consentScript = consentTemplate.match(/<script>\s*\(function\(\)[\s\S]*?<\/script>/)[0]
  .replace('pageType="mcp-response"', 'pageType="guide"')
  .replace('var allowedEvents={mcp_response_action:1};', 'var allowedEvents={guide_action:1},allowedContexts={"open-tool":1,"download-example":1,"related-guide":1};')
  .replace("if(!loaded||readChoice()!=='granted'||", 'if(!loaded||')
  .replace("if(!loaded||!allowedEvents[name]", "if(!loaded||readChoice()!=='granted'||!allowedContexts[context]||!allowedEvents[name]");

for (const guide of guides) {
  const path = `guides/${guide.id}.html`;
  const options = Object.entries(guide.examples).map(([key, example]) => `<option value="${key}">${esc(example.label)}</option>`).join('');
  const picker = `<div class="example-picker"><label for="example-case">Worked example</label><select id="example-case">${options}</select>${guide.form === 'retry-form' ? '<button type="button" class="secondary" id="load-scenario">Load scenario</button>' : ''}</div>`;
  let tool = read(guide.tool);
  tool = replaceBlock(tool, 'tool-example-picker', picker, `<form id="${guide.form}">`);
  const notes = `<section class="tool-notes" id="worked-examples" aria-labelledby="examples-title"><h2 id="examples-title">Worked examples and expected results</h2><p>Synthetic fixtures checked against this tool's current local logic. They are not live connection or delivery tests.</p><ul>${Object.values(guide.examples).map(example => `<li><strong>${esc(example.label)}.</strong> ${esc(example.expected)}</li>`).join('')}</ul><h2>When to investigate further</h2><dl>${guide.notes.map(([title, body]) => `<dt>${esc(title)}</dt><dd>${esc(body)}</dd>`).join('')}</dl><a class="guide-link" href="./${path}" data-knownfix-event="${guide.event}" data-knownfix-context="read-guide">Read the companion guide: ${esc(guide.title)}</a></section>`;
  tool = replaceBlock(tool, 'tool-learning', notes, '<footer>');
  if (!tool.includes('./scripts/tool-learning.css')) tool = tool.replace('</head>', '<link rel="stylesheet" href="./scripts/tool-learning.css"></head>');
  tool = tool.replace("if(!loaded||!allowedEvents[name]", "if(!loaded||readChoice()!=='granted'||!allowedEvents[name]");
  write(guide.tool, tool);

  const examples = Object.entries(guide.examples).map(([key, example]) => {
    const text = example.text || JSON.stringify(example.config, null, 2);
    const filename = `${guide.id}-${key}.json`;
    write(`guides/examples/${filename}`, text + '\n');
    return `<h3>${esc(example.label)}</h3><p>${esc(example.expected)}</p><details><summary>Example JSON</summary><pre><code>${esc(text)}</code></pre></details><p><a href="./examples/${filename}" download data-knownfix-event="guide_action" data-knownfix-context="download-example">Download ${esc(example.label.toLowerCase())} JSON</a></p>`;
  }).join('\n');
  const schema = { '@context': 'https://schema.org', '@type': 'TechArticle', headline: guide.title, description: guide.description, datePublished: '2026-10-19', dateModified: '2026-10-19', author: { '@type': 'Organization', name: 'KnownFix', url: site + '/' }, mainEntityOfPage: `${site}/${path}` };
  write(path, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(guide.title)} | KnownFix</title><meta name="description" content="${esc(guide.description)}"><link rel="canonical" href="${site}/${path}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(guide.title)}"><meta property="og:description" content="${esc(guide.description)}"><meta property="og:url" content="${site}/${path}"><meta property="og:image" content="${site}/knownfix-icon.png"><link rel="icon" href="../knownfix-icon.png"><link rel="stylesheet" href="../scripts/guide.css"><script type="application/ld+json">${JSON.stringify(schema)}</script>${consentStyle}${consentScript}</head><body><main>
<nav class="site-nav" aria-label="Main"><a href="../"><img src="../knownfix-icon.png" alt="">KnownFix</a><a href="../free-skills.html">Free tools and skills</a><a href="../services.html">Services</a><a href="../privacy.html">Privacy</a></nav>
<p class="breadcrumb"><a href="../${guide.tool}">${esc(guide.toolLabel)}</a> / Companion guide</p><h1>${esc(guide.title)}</h1><p>${esc(guide.intro)}</p><p class="reviewed">Reviewed 19 October 2026. Examples are synthetic; no customer data or production outcomes.</p><p><a href="../${guide.tool}#${guide.heading}" data-knownfix-event="guide_action" data-knownfix-context="open-tool">Open the free ${esc(guide.toolLabel)}</a></p>
<div class="guide-layout"><aside class="contents"><nav aria-label="On this page"><h2>In this guide</h2><ol><li><a href="#evidence">Start with evidence</a></li><li><a href="#examples">Worked examples</a></li><li><a href="#decisions">Diagnostic decisions</a></li><li><a href="#limits">Limits</a></li><li><a href="#sources">Sources</a></li></ol></nav></aside><article class="guide-article">
<section id="evidence"><h2>Start with evidence</h2>${guide.first}</section>
<section id="examples"><h2>Worked examples</h2><p>These examples exercise the current tool logic. Load the matching case on the tool page to reproduce its result. Downloads contain only the fixed synthetic example, never your pasted input.</p>${examples}</section>
<section id="decisions"><h2>Diagnostic decisions</h2>${guide.decisions}</section>
<section id="limits"><h2>What this does not establish</h2><p>${esc(guide.boundary)}</p><p>Optional analytics records sanitized page paths and fixed action labels after consent. The tools keep your input local. An action count is not a person, installation, resolved incident or sale.</p></section>
<section id="sources"><h2>Primary references</h2><ul>${guide.sources.map(([label, url]) => `<li><a href="${url}">${esc(label)}</a></li>`).join('')}</ul></section>
<section><h2>Continue with KnownFix</h2><div class="related-links">${guides.filter(item => item.id !== guide.id).map(item => `<a href="./${item.id}.html" data-knownfix-event="guide_action" data-knownfix-context="related-guide">${esc(item.title)}</a>`).join('')}<a href="../${guide.tool}" data-knownfix-event="guide_action" data-knownfix-context="open-tool">${esc(guide.toolLabel)}</a></div></section>
</article></div><footer><a href="../free-skills.html">Free tools and skills</a> &middot; <a href="../">KnownFix catalog</a> &middot; <a href="../privacy.html">Analytics choice</a></footer></main></body></html>\n`);
}

const discovery = `<section class="tool-notes" id="companion-guides"><h2>Free troubleshooting guides</h2><ul>${guides.map(guide => `<li><a href="./guides/${guide.id}.html">${esc(guide.title)}</a></li>`).join('')}</ul></section>`;
for (const page of ['index.html', 'free-skills.html']) write(page, replaceBlock(read(page), 'companion-guides', discovery, '<footer'));
let sitemap = read('sitemap.xml');
for (const guide of guides) if (!sitemap.includes(`/guides/${guide.id}.html`)) sitemap = sitemap.replace('</urlset>', `<url><loc>${site}/guides/${guide.id}.html</loc></url></urlset>`);
write('sitemap.xml', sitemap);
for (const file of ['llms.txt', 'llms-full.txt']) {
  let text = read(file);
  const start = '<!-- companion-guides:start -->', end = '<!-- companion-guides:end -->';
  if (text.includes(start)) text = text.slice(0, text.indexOf(start)) + text.slice(text.indexOf(end) + end.length);
  write(file, text.trimEnd() + `\n\n${start}\n## Free companion guides\n` + guides.map(guide => `${site}/guides/${guide.id}.html\n${guide.description}\n`).join('\n') + `${end}\n`);
}
console.log('Updated three tools, three companion guides, nine fixed JSON examples and discovery links.');
