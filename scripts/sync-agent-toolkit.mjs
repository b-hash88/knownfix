import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const write = (file, body) => { const dest = path.join(root, file); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, body); };
const { skills } = JSON.parse(read('free-skills.json'));
const examples = {
  'evidence-first-bug-report': ['A synthetic unit test expects add(2, 2) to return 4 but receives 5. Prepare a report, do not send it.', 'Name the tested commit, two reproductions, control and second method. If no execution is available, mark evidence missing; do not invent a verified defect.'],
  'release-smoke-check': ['Review a local static-site release with a passing build but an absent destination page.', 'Separate build success from user-journey failure. Hold publication until the destination is verified; no deployment authority comes from this skill.'],
  'mcp-connection-triage': ['An authorized test MCP endpoint returns HTTP 200 containing HTML. Diagnose the failure stage.', 'Record transport reachability, not MCP success. Require initialization and discovery before claiming readiness; no business tool invocation.'],
  'website-search-readiness': ['A staging page intentionally declares noindex. Assess search readiness without changing launch settings.', 'Preserve the intentional hold. Report index eligibility separately from Google indexing or ranking; do not promise traffic.'],
  'api-response-triage': ['Inspect the bundled response fixture, then compare envelope success with the tool-level error flag.', 'The example passes envelope checks with kind Tool-level error flag. That is not successful tool execution. Keep raw response/error text out of receipts.'],
  'webhook-delivery-triage': ['Use the bundled retry configuration to model six serial failed attempts.', 'Maximum duration is 215 seconds; six attempts fit the 600-second modeled budget. No actual delivery, provider policy or replay is verified.'],
};

for (const file of ['mcp-response-core.mjs', 'retry-planner-core.mjs']) write(`toolkit/lib/${file}`, read(`scripts/${file}`));
write('toolkit/examples/response.json', JSON.stringify({ jsonrpc: '2.0', id: 1, result: { isError: true, content: [{ type: 'text', text: 'Synthetic failure' }] } }, null, 2) + '\n');
write('toolkit/examples/retry.json', JSON.stringify({ attempts: 6, initialDelay: 5, multiplier: 2, maxDelay: 300, timeout: 10, budget: 600, jitter: 'full' }, null, 2) + '\n');
for (const skill of skills) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.id) || !examples[skill.id]) throw new Error('Unexpected skill ID');
  const dir = `skills/${skill.id}`;
  const cli = skill.id === 'api-response-triage' ? ['inspect-response', 'response'] : skill.id === 'webhook-delivery-triage' ? ['retry-plan', 'retry'] : null;
  let body = skill.body.replace(/\r\n/g, '\n').replace('\n---\n', '\nlicense: CC-BY-4.0\n---\n');
  body += '\n## Synthetic example\n\nRead [examples and acceptance criteria](references/examples.md) when practicing or validating this workflow. These fixtures are not customer evidence.\n';
  if (cli) {
    body += `\n## Optional local helper\n\nRequires Node.js 18 or newer. From this skill directory:\n\n\`\`\`sh\nnode scripts/cli.mjs ${cli[0]} examples/${cli[1]}.json\n\`\`\`\n\nPass a regular UTF-8 JSON file or \`-\` for stdin, maximum 200,000 bytes. No network calls, telemetry, input execution or automatic file writes. JSON goes to stdout; exit 0 means the local check/model completed, 2 means invalid input, 1 means unreadable input. The response inspector checks envelope structure only, not request correlation or tool success. The retry planner returns only validated numeric settings and the model; it sends no webhooks. Do not install software or retain private input without authorization.\n`;
    write(`${dir}/scripts/cli.mjs`, read('toolkit/cli.mjs'));
    write(`${dir}/scripts/LICENSE`, read('toolkit/LICENSE'));
    for (const file of ['mcp-response-core.mjs', 'retry-planner-core.mjs']) write(`${dir}/scripts/lib/${file}`, read(`scripts/${file}`));
    write(`${dir}/examples/${cli[1]}.json`, read(`toolkit/examples/${cli[1]}.json`));
  }
  write(`${dir}/SKILL.md`, body);
  write(`${dir}/references/examples.md`, `# ${skill.title}: synthetic exercise\n\n## Task\n\n${examples[skill.id][0]}\n\n## Expected result\n\n${examples[skill.id][1]}\n\n## Validation\n\nCheck the receipt against the skill's acceptance checklist. Distinguish observations from missing evidence. Never contact a third party, change production, pay, or broaden access as part of this example.\n`);
}
console.log(`Generated ${skills.length} installable skills and two local-only CLI commands.`);
