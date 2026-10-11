const input = document.getElementById('skill-filter');
const rows = [...document.querySelectorAll('[data-skill]')];
input.addEventListener('input', () => {
  const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const row of rows) { row.hidden = !words.every(w => row.textContent.toLowerCase().includes(w)); if (!row.hidden) count++; }
  document.getElementById('skill-count').textContent = count ? `${count} workflow${count === 1 ? '' : 's'}` : 'No matching workflows.';
});
