import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

if (!process.env.KNOWNFIX_PLAYWRIGHT_PATH) throw new Error('Provide the installed Playwright path; no package download is performed.');
const { chromium } = createRequire(import.meta.url)(process.env.KNOWNFIX_PLAYWRIGHT_PATH);
const root = fileURLToPath(new URL('../', import.meta.url));
const base = 'https://b-hash88.github.io/knownfix/';
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const files = fs.readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html') && !/^(?:\.git|\.impeccable|test-results)[\\/]/.test(file));
const browser = await chromium.launch({ headless: true, channel: process.env.KNOWNFIX_BROWSER_CHANNEL || 'msedge' });
const report = { utc: new Date().toISOString(), method: 'HTML DOMParser, local target/fragment resolution and optional fresh public GET', environment: process.version, pages: [], brokenLinks: [], duplicateTitles: [], duplicateDescriptions: [] };
try {
  const page = await browser.newPage();
  for (const name of files) {
    const file = name.replaceAll('\\', '/');
    const html = read(file);
    const info = await page.evaluate(html => {
      const d = new DOMParser().parseFromString(html, 'text/html');
      const result = {
        title: d.title, description: d.querySelector('meta[name="description"]')?.content || '', lang: d.documentElement.lang,
        canonical: d.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        h1: [...d.querySelectorAll('h1')].map(x => x.textContent.trim()), robots: d.querySelector('meta[name="robots"]')?.content || '',
        ids: [...d.querySelectorAll('[id]')].map(x => x.id), main: d.querySelectorAll('main,[role="main"]').length,
        links: [...d.querySelectorAll('a[href],link[href],script[src],img[src]')].map(x => ({ value: x.getAttribute('href') || x.getAttribute('src'), label: x.textContent.trim() || x.getAttribute('alt') || '' })),
        imagesWithoutAlt: [...d.querySelectorAll('img:not([alt])')].length,
        schemas: [...d.querySelectorAll('script[type="application/ld+json"]')].map(x => { try { return { valid: true, types: JSON.parse(x.textContent)['@type'] }; } catch { return { valid: false }; } }),
      };
      d.querySelectorAll('script,style').forEach(x => x.remove());
      result.text = d.body.textContent.replace(/\s+/g, ' ').trim();
      return result;
    }, html);
    const url = base + (file === 'index.html' ? '' : file);
    const issues = [];
    const proof = /^google[a-f0-9]+\.html$/.test(file);
    if (!proof) {
      if (!info.title) issues.push('missing-title');
      if (!info.description) issues.push('missing-description');
      if (!info.lang) issues.push('missing-lang');
      if (info.h1.length !== 1) issues.push(`h1-count-${info.h1.length}`);
      if (!info.canonical) issues.push('missing-canonical');
      else if (info.canonical !== url) issues.push('canonical-mismatch');
      if (info.schemas.some(x => !x.valid)) issues.push('invalid-jsonld');
      if (info.imagesWithoutAlt) issues.push('image-alt-missing');
      if (!info.main) issues.push('missing-main-landmark');
    }
    const entry = { file, url, issues, ...info };
    if (process.env.KNOWNFIX_AUDIT_LIVE === '1') {
      const response = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      entry.live = { utc: new Date().toISOString(), status: response.status, xRobots: response.headers.get('x-robots-tag'), exact: (await response.text()).replace(/\r\n/g, '\n') === html };
    }
    report.pages.push(entry);
  }
  const byFile = new Map(report.pages.map(x => [x.file, x]));
  for (const entry of report.pages) for (const link of entry.links) {
    let url;
    try { url = new URL(link.value, entry.url); } catch { continue; }
    if (!url.href.startsWith(base)) continue;
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    const file = relative.endsWith('/') ? relative + 'index.html' : relative;
    if (!fs.existsSync(path.join(root, file))) report.brokenLinks.push({ from: entry.file, target: link.value, issue: 'missing-file' });
    else if (url.hash && byFile.has(file) && !byFile.get(file).ids.includes(decodeURIComponent(url.hash.slice(1)))) report.brokenLinks.push({ from: entry.file, target: link.value, issue: 'missing-fragment' });
  }
  for (const [field, target] of [['title', 'duplicateTitles'], ['description', 'duplicateDescriptions']]) {
    const groups = new Map();
    for (const entry of report.pages) if (entry[field]) groups.set(entry[field], [...(groups.get(entry[field]) || []), entry.file]);
    report[target] = [...groups].filter(([, files]) => files.length > 1).map(([value, files]) => ({ value, files }));
  }
  report.completedAt = new Date().toISOString();
  if (process.env.KNOWNFIX_AUDIT_EVIDENCE) fs.writeFileSync(process.env.KNOWNFIX_AUDIT_EVIDENCE, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ utc: report.utc, completedAt: report.completedAt, pages: report.pages.length, findings: report.pages.filter(x => x.issues.length).map(({ file, issues }) => ({ file, issues })), brokenLinks: report.brokenLinks, duplicateTitles: report.duplicateTitles, duplicateDescriptions: report.duplicateDescriptions, liveFailures: report.pages.filter(x => x.live && (x.live.status !== 200 || !x.live.exact)).map(x => ({ file: x.file, live: x.live })) }, null, 2));
} finally {
  await browser.close();
}
