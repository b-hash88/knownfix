const kind = document.getElementById('service-kind');
const budget = document.getElementById('service-budget');
const rows = [...document.querySelectorAll('#service-comparison tbody tr')];
function filter() {
  let count = 0;
  for (const row of rows) {
    row.hidden = (kind.value !== 'all' && row.dataset.kind !== kind.value) || Number(row.dataset.price) > Number(budget.value);
    if (!row.hidden) count++;
  }
  document.getElementById('comparison-count').textContent = `${count} of ${rows.length} services`;
  document.getElementById('comparison-empty').hidden = count !== 0;
  window.knownfixTrack?.('service_compare', kind.value);
}
kind.addEventListener('change', filter);
budget.addEventListener('change', filter);
document.getElementById('reset-services').addEventListener('click', () => { kind.value = 'all'; budget.value = '100000'; filter(); });
