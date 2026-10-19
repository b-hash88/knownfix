import { DEFAULT_PLAN, planRetries, planChecklist } from './retry-planner-core.mjs';
import { RETRY_EXAMPLES } from './tool-examples.mjs';

const form = document.getElementById('retry-form');
const result = document.getElementById('retry-result');
const status = document.getElementById('retry-status');
const copyJson = document.getElementById('copy-plan');
const copyChecklist = document.getElementById('copy-checklist');
let plan = null;
const track = action => window.knownfixTrack?.('retry_planner_action', action);
const seconds = value => Number(value.toFixed(2)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 's';

document.getElementById('load-scenario')?.addEventListener('click', () => {
  const key = document.getElementById('example-case').value;
  const example = Object.hasOwn(RETRY_EXAMPLES, key) && RETRY_EXAMPLES[key];
  if (!example) return;
  for (const [field, value] of Object.entries(example.config)) form.elements.namedItem(field).value = value;
  calculate(); track('example-' + key);
});

function calculate() {
  document.getElementById('export-fallback').hidden = true;
  try {
    plan = planRetries(Object.fromEntries(new FormData(form)));
    document.getElementById('total-attempts').textContent = String(plan.config.attempts);
    document.getElementById('maximum-time').textContent = seconds(plan.durationMax);
    document.getElementById('budget-count').textContent = `${plan.attemptsWithinBudget} / ${plan.config.attempts}`;
    document.getElementById('expected-time').textContent = `Expected duration: ${seconds(plan.durationExpected)}. Earliest modeled finish: ${seconds(plan.durationMin)}.`;
    const body = document.getElementById('retry-rows');
    body.replaceChildren();
    for (const row of plan.rows) {
      const tr = document.createElement('tr');
      const values = [row.attempt, row.delayMin === row.delayMax ? seconds(row.delayMax) : `${seconds(row.delayMin)} to ${seconds(row.delayMax)}`,
        seconds(row.startExpected), seconds(row.finishLatest), row.fitsBudget ? 'Within' : 'Over'];
      values.forEach((value, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        if (index === 0) cell.scope = 'row';
        cell.textContent = String(value);
        tr.append(cell);
      });
      if (!row.fitsBudget) tr.className = 'over-budget';
      body.append(tr);
    }
    result.hidden = false;
    status.textContent = plan.attemptsWithinBudget === plan.config.attempts ? 'All attempts fit within the modeled time budget.' : 'The maximum modeled duration exceeds your time budget.';
    status.className = plan.attemptsWithinBudget === plan.config.attempts ? 'status' : 'status warning';
    copyJson.disabled = copyChecklist.disabled = false;
  } catch (error) {
    plan = null;
    result.hidden = true;
    status.textContent = error.message;
    copyJson.disabled = copyChecklist.disabled = true;
  }
}

form.addEventListener('submit', event => { event.preventDefault(); calculate(); if (plan) track('calculate'); });
form.addEventListener('input', () => {
  document.getElementById('export-fallback').hidden = true;
  plan = null;
  result.hidden = true;
  copyJson.disabled = copyChecklist.disabled = true;
  status.textContent = 'Settings changed. Calculate to update the schedule.';
});
document.getElementById('reset-plan').addEventListener('click', () => {
  for (const [key, value] of Object.entries(DEFAULT_PLAN)) form.elements.namedItem(key).value = value;
  calculate(); track('reset');
});
async function copy(text, action) {
  try { await navigator.clipboard.writeText(text); status.textContent = 'Copied.'; track(action); }
  catch { status.textContent = 'Clipboard unavailable. The export is shown below for manual copying.'; const output = document.getElementById('export-fallback'); output.textContent = text; output.hidden = false; }
}
copyJson.addEventListener('click', () => { if (plan) copy(JSON.stringify({ spec: 'knownfix-retry-plan/1.0', ...plan }, null, 2), 'copy-json'); });
copyChecklist.addEventListener('click', () => { if (plan) copy(planChecklist(plan), 'copy-checklist'); });
calculate();
