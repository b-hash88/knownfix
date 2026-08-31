import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const storeValue = process.env.KNOWNFIX_STORE;
if (!storeValue) {
  throw new Error("Set KNOWNFIX_STORE to the intended public storefront URL. The retired GitHub Pages host has no fallback.");
}
const STORE = storeValue.replace(/\/?$/, "/");
const CANONICAL_STORE = (process.env.KNOWNFIX_CANONICAL_STORE || STORE).replace(/\/?$/, "/");
const API = (process.env.KNOWNFIX_API || "https://knownfix-backend-28.b-hash88.deno.net").replace(/\/$/, "");
const BASE_RPC = process.env.KNOWNFIX_BASE_RPC || "https://mainnet.base.org";
const TREASURY = "0x064d15003e84eb6604a4c7f3745a135a588b6328";
const SERVICE_ORDER_TARGET = process.env.KNOWNFIX_SERVICE_ORDER_TARGET || "";
const OPERATOR_HEADERS = {
  "user-agent": "KnownFix-Live-E2E/1.0",
  "x-operator": "1",
};
const DISCOVERY_DESCRIPTION =
  "Verified fixes, professional reviews, and evidence-led apparel over MCP.";
const ANALYTICS_MEASUREMENT_ID = "G-781DC76YQN";
const results = [];

function assertAnalyticsBoundary(html, label) {
  assert.match(html, new RegExp(ANALYTICS_MEASUREMENT_ID), label + " is missing the KnownFix GA4 tag");
  assert.match(html, /page_location:safePageUrl\(location\.href\)/);
  assert.match(html, /allow_google_signals:false/);
  assert.match(html, /allow_ad_personalization_signals:false/);
  assert.match(html, /ad_storage:'denied'/);
  assert.match(html, /knownfix\.analytics\.consent/);
  assert.doesNotMatch(html, /page_location:location\.href|page_referrer:document\.referrer/);
  assert.doesNotMatch(html, /localStorage[^\n;]{0,160}(?:ticket|offer|proof|query|notes|target)/i);
  assert.doesNotMatch(html, /sessionStorage/);
}

async function check(name, fn) {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ name, ok: true, ms: Date.now() - started, detail });
  } catch (error) {
    results.push({ name, ok: false, ms: Date.now() - started, detail: error.message });
  }
}

async function request(url, init = {}) {
  const headers = new Headers(init.headers || {});
  for (const [name, value] of Object.entries(OPERATOR_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return await fetch(url, {
    ...init,
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
}

async function text(url, init) {
  const response = await request(url, init);
  return { response, body: await response.text() };
}

async function json(url, init) {
  const { response, body } = await text(url, init);
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(String(url) + " returned non-JSON (" + response.status + ")");
  }
  return { response, data };
}

function internalLinks(html, pageUrl) {
  return [...html.matchAll(/\shref=["']([^"'#]+)["']/gi)]
    .map((match) => new URL(match[1], pageUrl))
    .filter((url) => url.origin === new URL(STORE).origin)
    .map(String);
}

function storefrontFetchUrl(canonicalUrl) {
  const canonicalBase = new URL(CANONICAL_STORE);
  const target = new URL(canonicalUrl);
  if (target.origin !== canonicalBase.origin || !target.pathname.startsWith(canonicalBase.pathname)) return target;
  return new URL(target.pathname.slice(canonicalBase.pathname.length) + target.search, STORE);
}

function parseToolText(response) {
  const content = response?.result?.content;
  assert(Array.isArray(content) && content.length > 0, "MCP tool returned no content");
  const block = content.find((item) => item.type === "text");
  assert(block?.text, "MCP tool returned no text block");
  return JSON.parse(block.text);
}

async function mcp(id, method, params = {}) {
  const { response, data } = await json(API + "/mcp", {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  assert.equal(response.status, 200);
  assert.equal(data.jsonrpc, "2.0");
  assert.equal(data.id, id);
  assert(!data.error, "MCP error: " + JSON.stringify(data.error));
  return data;
}

async function baseRpc(method, params) {
  const response = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(response.status, 200, "Base RPC HTTP failure");
  const data = await response.json();
  assert(!data.error, "Base RPC error: " + JSON.stringify(data.error));
  return data.result;
}

const staticCatalogResult = await json(new URL("catalog.json", STORE));
assert.equal(staticCatalogResult.response.status, 200, "static catalog unavailable");
const catalog = staticCatalogResult.data;
const staticServicesResult = await json(new URL("services.json", STORE));
assert.equal(staticServicesResult.response.status, 200, "static service catalog unavailable");
const serviceCatalog = staticServicesResult.data;

await check("storefront metadata and truthful inventory", async () => {
  const { response, body } = await text(STORE);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /text\/html/);
  assert.match(body, /34 verified/);
  assert.match(body, /4 documented/);
  assert.match(body, /12 free in full/);
  assert.match(body, /<b>5<\/b> professional reviews/);
  assert.match(body, /Book the \$149 Evidence Audit/);
  assert(body.includes(`<link rel="canonical" href="${CANONICAL_STORE}">`));
  assert.match(body, /property="og:title"/);
  assert.match(body, /name="twitter:card"/);
  assert(body.includes(`<meta name="description" content="${DISCOVERY_DESCRIPTION}">`));
  assertAnalyticsBoundary(body, "storefront");
  assert.match(body, /data-knownfix-event="catalog_search"/);
  assert.match(body, /href="\.\/privacy\.html"/);
  assert.equal(catalog.entries.length, 38);
  assert.equal(catalog.entries.filter((entry) => entry.sample).length, 12);
  assert.equal(catalog.entries.filter((entry) => entry.confidence === "verified-in-production").length, 34);
  assert.equal(catalog.entries.filter((entry) => entry.confidence === "documented").length, 4);
  assert(catalog.entries.every((entry) => !("cause" in entry) && !("fix" in entry)));
  assert.equal(serviceCatalog.services.length, 5);
  return "38 entries; 34 verified, 4 documented, 12 free, 5 professional reviews";
});

await check("professional service page is private, structured, and checkout-ready", async () => {
  const { response, body } = await text(new URL("services.html", STORE));
  assert.equal(response.status, 200);
  assert.match(body, /Evidence before advice/);
  assert.match(body, /id="order-form"/);
  assert.match(body, /authorizationConfirmed/);
  assert.match(body, /publishTarget/);
  assert.match(body, /knownfix-payment-offer\/2\.0/);
  assert.match(body, /@base-org\/account@2\.5\.10/);
  assert.match(body, /Book the \$149 focused audit/);
  assert.match(body, /Request a card checkout link/);
  assert.match(body, /mailto:knownfix\.agent@gmail\.com/);
  assert.doesNotMatch(body, /knownfix\.ai@gmail\.com/);
  assert.match(body, /id="free-diagnostic"/);
  assert.match(body, /services\/website-first-look\.html/);
  assert.match(body, /new URLSearchParams\(location\.search\)/);
  assert.match(body, /id="report-preview"[^>]+sandbox=""/);
  assert.match(body, /crypto\.subtle\.digest\('SHA-256'/);
  assert.match(body, /renderReportDocument/);
  assert.match(body, /Download HTML/);
  assert.match(body, /Download Markdown/);
  assert.match(body, /held in this page's memory only/);
  assertAnalyticsBoundary(body, "service catalog");
  assert.match(body, /knownfixTrack\('service_order_start',serviceInput\.value\)/);
  assert.doesNotMatch(body, /innerHTML\s*=/);
  const structured = JSON.parse(body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(structured.numberOfItems, 5);
  assert.equal(structured.itemListElement.length, 5);
  for (const service of serviceCatalog.services) {
    const detail = await text(new URL("services/" + service.id + ".html", STORE));
    assert.equal(detail.response.status, 200);
    assert(detail.body.includes("<h1>" + service.title + "</h1>"));
    assert.match(detail.body, /name="robots" content="index,follow,max-image-preview:large/);
    assert(detail.body.includes("services.html?service=" + service.id + "#order"));
    assert((detail.body.match(/<details>/g) || []).length >= 5);
    const schema = JSON.parse(detail.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const types = schema["@graph"].map((item) => item["@type"]);
    assert(types.includes("Service"));
    assert(types.includes("BreadcrumbList"));
    assert(types.includes("FAQPage"));
    assert.doesNotMatch(detail.body, /aggregateRating|reviewCount/);
    assertAnalyticsBoundary(detail.body, "service detail " + service.id);
    assert(detail.body.includes(`data-knownfix-context="${service.id}"`));
  }
  const sampleName = "KnownFix_20260830_Evidence-Audit-Sample_RPT";
  const [sampleHtml, sampleMarkdown] = await Promise.all([
    text(new URL("reports/" + sampleName + ".html", STORE)),
    text(new URL("reports/" + sampleName + ".md", STORE)),
  ]);
  assert.equal(sampleHtml.response.status, 200);
  assert.equal(sampleMarkdown.response.status, 200);
  const digest = createHash("sha256").update(sampleMarkdown.body).digest("hex");
  assert.match(sampleHtml.body, new RegExp(digest));
  assert.match(sampleHtml.body, /default-src 'none'/);
  assert.match(sampleHtml.body, /content="index,follow,max-image-preview:large/);
  assert.doesNotMatch(sampleHtml.body, new RegExp(ANALYTICS_MEASUREMENT_ID));
  const sampleSchema = JSON.parse(sampleHtml.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(sampleSchema["@type"], "Report");
  return "five intent-specific service pages; indexable sample; private reports stay verified";
});

await check("homepage search is purchase-ready and credential-safe", async () => {
  const { response, body } = await text(STORE);
  assert.equal(response.status, 200);
  assert.match(body, /id="match-form"[^>]*action="[^"]+\/match"/);
  assert.match(body, /callTool\('search_fixes'/);
  assert.match(body, /diagnosisPreview/);
  assert.match(body, /compatibility/);
  assert.match(body, /relatedBundle/);
  assert.match(body, /Open secure checkout/);
  assert.match(body, /Open free fix/);
  assert.doesNotMatch(body, /fetch\(backend\+'\/match\?q='/);
  assert.doesNotMatch(body, /paymentOffer/);
  assertAnalyticsBoundary(body, "storefront search");
  return "MCP search renders diagnosis, compatibility, price, bundle, and one safe next action";
});

await check("public request UI keeps privacy opt-in", async () => {
  const { response, body } = await text(STORE);
  assert.equal(response.status, 200);
  assert.match(body, /id="request-form"/);
  assert.match(body, /id="check-request-form"/);
  assert.match(body, /id="request-publish"[^>]*type="checkbox"/);
  assert.doesNotMatch(body, /id="request-publish"[^>]*\schecked(?:\s|>|=)/);
  assert.match(body, /id="request-ticket"[^>]*type="password"/);
  assert.match(body, /pattern="req_\[0-9a-f\]\{32\}"/);
  assert.doesNotMatch(body, /localStorage[^\n;]{0,160}(?:ticket|request_ticket|signature|context)/i);
  assert.doesNotMatch(body, /sessionStorage/);
  assert.doesNotMatch(body, /[?&](?:ticket|request_ticket)=/i);
  assert.match(body, /\.textContent=data\.ticket/);
  return "private by default; ticket masked and kept out of URLs and web storage";
});

await check("sitemap and every canonical public URL", async () => {
  const { response, body } = await text(new URL("sitemap.xml", STORE));
  assert.equal(response.status, 200);
  const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.filter((url) => /\/fixes\/[^/]+\.html$/.test(url)).length, catalog.entries.length);
  assert.equal(urls.filter((url) => /\/fixes\/[^/]+\.md$/.test(url)).length, 0);
  assert.equal(urls.filter((url) => /\/services\/[^/]+\.html$/.test(url)).length, serviceCatalog.services.length);
  assert(urls.includes(new URL("privacy.html", CANONICAL_STORE).toString()));
  assert.equal(urls.filter((url) => /\.(?:md|json|txt)$/.test(url)).length, 0);
  assert.doesNotMatch(body, /<lastmod>/);
  const probes = await Promise.all(
    urls.map(async (url) => ({ url, response: await request(storefrontFetchUrl(url), { method: "HEAD" }) })),
  );
  const failures = probes.filter(({ response: item }) => item.status !== 200);
  assert.deepEqual(failures.map(({ url, response: item }) => item.status + " " + url), []);
  return urls.length + " sitemap URLs returned 200";
});

await check("homepage internal links", async () => {
  const { body } = await text(STORE);
  const links = [...new Set(internalLinks(body, STORE))];
  const probes = await Promise.all(
    links.map(async (url) => ({ url, response: await request(url, { method: "HEAD" }) })),
  );
  const failures = probes.filter(({ response: item }) => item.status !== 200);
  assert.deepEqual(failures.map(({ url, response: item }) => item.status + " " + url), []);
  return links.length + " internal links returned 200";
});

await check("five recovery-pack pages expose price and proof contracts", async () => {
  const packs = [
    ["npm-publishing-recovery-pack", "4.00"],
    ["github-actions-failure-pack", "5.00"],
    ["mcp-server-operations-pack", "6.00"],
    ["windows-agent-shell-pack", "4.00"],
    ["base-payment-verification-pack", "49.00"],
  ];
  for (const [id, price] of packs) {
    const [htmlResult, mdResult] = await Promise.all([
      text(new URL("packs/" + id + ".html", STORE)),
      text(new URL("packs/" + id + ".md", STORE)),
    ]);
    assert.equal(htmlResult.response.status, 200);
    assert.equal(mdResult.response.status, 200);
    assert(htmlResult.body.includes("Pay $" + price + " USDC"));
    assert.match(htmlResult.body, /erc-4337-user-operation-hash/);
    assert.match(htmlResult.body, /transaction-hash/);
    assert.match(htmlResult.body, /Base Pay did not return a UserOperation hash/);
    assert.doesNotMatch(htmlResult.body, /Base Pay did not return a transaction hash/i);
    assert.match(htmlResult.body, /script\[data-base-pay-sdk\]/);
    assert.match(htmlResult.body, /Base Pay SDK timed out while loading/);
    assert.match(htmlResult.body, /script\.remove\(\)/);
    assert.doesNotMatch(htmlResult.body, /id="payment-offer"/);
    assertAnalyticsBoundary(htmlResult.body, "recovery pack " + id);
    assert.match(htmlResult.body, /data-knownfix-event="checkout_start"/);
    assert(mdResult.body.includes("**Price:** $" + price + " USDC"));
    if (id === "npm-publishing-recovery-pack") {
      assert.match(htmlResult.body, /Six complete recoveries/);
      assert.match(htmlResult.body, /npm-trusted-publishing-eneedauth/);
      assert.match(mdResult.body, /npm-trusted-publishing-eneedauth/);
      assert.doesNotMatch(htmlResult.body, /Classic Automation token/);
      assert.doesNotMatch(mdResult.body, /Classic Automation token/);
    }
  }
  return "all five HTML and Markdown product surfaces match v2 checkout";
});

await check("all fix pages preserve the free and paid boundary", async () => {
  const failures = [];
  await Promise.all(catalog.entries.map(async (entry) => {
    const htmlUrl = new URL("fixes/" + entry.id + ".html", STORE);
    const mdUrl = new URL("fixes/" + entry.id + ".md", STORE);
    const canonicalHtmlUrl = new URL("fixes/" + entry.id + ".html", CANONICAL_STORE);
    const canonicalMdUrl = new URL("fixes/" + entry.id + ".md", CANONICAL_STORE);
    const [htmlResult, mdResult] = await Promise.all([text(htmlUrl), text(mdUrl)]);
    try {
      assert.equal(htmlResult.response.status, 200);
      assert.equal(mdResult.response.status, 200);
      assert(htmlResult.body.includes('<link rel="canonical" href="' + canonicalHtmlUrl + '">'));
      assert(htmlResult.body.includes('<link rel="alternate" type="text/markdown" href="' + canonicalMdUrl + '">'));
      assertAnalyticsBoundary(htmlResult.body, "fix " + entry.id);
      if (entry.sample) {
        assert.match(htmlResult.body, /<h2>Cause<\/h2>/);
        assert.match(htmlResult.body, /<h2>Fix<\/h2>/);
        assert.match(htmlResult.body, /<h2>Verification<\/h2>/);
        assert.doesNotMatch(htmlResult.body, /id="pay-usdc"/);
        assert.match(mdResult.body, /## Cause/);
      } else {
        assert.doesNotMatch(htmlResult.body, /<h2>Cause<\/h2>/);
        assert.match(htmlResult.body, /id="pay-usdc"/);
        assert.match(htmlResult.body, /data-knownfix-event="checkout_start"/);
        assert.match(htmlResult.body, /Base Pay UserOperation hash/);
        assert.match(htmlResult.body, /script\[data-base-pay-sdk\]/);
        assert.match(htmlResult.body, /Base Pay SDK timed out while loading/);
        assert.match(htmlResult.body, /script\.remove\(\)/);
        assert.match(htmlResult.body, /id="wallet-link"/);
        assert.match(htmlResult.body, /id="offer-countdown"/);
        assert.match(htmlResult.body, /ethereum:/);
        assert.match(htmlResult.body, /payment-offer-expired/);
        assert.match(htmlResult.body, /private offer token stays in this page's memory/);
        assert(
          htmlResult.body.includes("call <code>get_fix</code> with <code>" + entry.id + "</code> alone"),
          "paid page is missing its direct get_fix checkout route",
        );
        assert.match(htmlResult.body, /After payment, call <code>get_fix<\/code> again/);
        assert.doesNotMatch(htmlResult.body, /call <code>get_offer<\/code>, then <code>get_fix<\/code>/);
        assert.doesNotMatch(htmlResult.body, /paymentOffer\s*[:=]\s*["'][A-Za-z0-9_-]+\./);
        assert.match(mdResult.body, /## Free diagnosis/);
        assert.match(mdResult.body, /remediation and verification procedure remain paid/i);
        assert.doesNotMatch(mdResult.body, /## Cause/);
      }
    } catch (error) {
      failures.push(entry.id + ": " + error.message);
    }
  }));
  assert.deepEqual(failures, []);
  return catalog.entries.length + " HTML and Markdown pairs validated";
});

await check("npm Trusted Publishing fix exposes authoritative citations", async () => {
  const id = "npm-trusted-publishing-eneedauth";
  const entry = catalog.entries.find((item) => item.id === id);
  assert(entry);
  assert.equal(entry.confidence, "documented");
  const [htmlResult, mdResult] = await Promise.all([
    text(new URL("fixes/" + id + ".html", STORE)),
    text(new URL("fixes/" + id + ".md", STORE)),
  ]);
  assert.match(htmlResult.body, /Authoritative sources/);
  assert.match(htmlResult.body, /https:\/\/docs\.npmjs\.com\/trusted-publishers\//);
  assert.match(htmlResult.body, /https:\/\/github\.com\/npm\/cli\/issues\/9088/);
  assert.match(htmlResult.body, /"dateModified":"2026-08-27"/);
  assert.match(mdResult.body, /## Authoritative sources/);
  assert.match(mdResult.body, /Reviewed: 2026-08-27/);
  assert.doesNotMatch(htmlResult.body, /<h2>Cause<\/h2>/);
  assert.doesNotMatch(mdResult.body, /## Cause/);

  const eotpId = "npm-publish-2fa-403";
  const eotpEntry = catalog.entries.find((item) => item.id === eotpId);
  assert.deepEqual(eotpEntry.aliases, [
    "npm ERR! code EOTP",
    "This operation requires a one-time password from your authenticator.",
    "You can provide a one-time password by passing --otp=<code> to the command you ran.",
  ]);
  assert.deepEqual(eotpEntry.discussion, {
    title: "Compare this exact EOTP/403 failure with field reports",
    url: "https://github.com/b-hash88/knownfix/discussions/1",
  });
  const [eotpHtml, eotpMd] = await Promise.all([
    text(new URL("fixes/" + eotpId + ".html", STORE)),
    text(new URL("fixes/" + eotpId + ".md", STORE)),
  ]);
  assert.match(eotpHtml.body, /npm ERR! code EOTP/);
  assert.match(eotpHtml.body, /This operation requires a one-time password from your authenticator\./);
  assert.match(eotpHtml.body, /--otp=&lt;code&gt;/);
  assert.match(eotpHtml.body, /npm CLI EOTP error contract/);
  assert.match(eotpHtml.body, /github\.com\/b-hash88\/knownfix\/discussions\/1/);
  assert.match(eotpMd.body, /## Also matches/);
  assert.match(eotpMd.body, /--otp=<code>/);
  assert.match(eotpMd.body, /## Technical discussion/);
  assert.match(eotpMd.body, /github\.com\/b-hash88\/knownfix\/discussions\/1/);
  assert.doesNotMatch(eotpHtml.body, /<h2>Cause<\/h2>/);
  assert.doesNotMatch(eotpMd.body, /## Cause/);
  return "current npm primary sources, EOTP aliases, technical discussion, reviewed date, and paid body boundary";
});

await check("robots, agent docs, offer document, server card, and OpenAPI", async () => {
  const [robots, llms, llmsFull, staticMcpResult, fareboxResult, serverCardResult, openapiResult] = await Promise.all([
    text(new URL("robots.txt", STORE)),
    text(new URL("llms.txt", STORE)),
    text(new URL("llms-full.txt", STORE)),
    json(new URL(".well-known/mcp.json", STORE)),
    json(new URL(".well-known/farebox.json", STORE)),
    json(API + "/.well-known/mcp/server-card.json"),
    json(new URL("openapi.json", STORE)),
  ]);
  assert.match(robots.body, /Sitemap: https:\/\/b-hash88\.github\.io\/knownfix\/sitemap\.xml/);
  assert(llms.body.includes("get_offer"), "llms.txt is missing get_offer");
  assert(llms.body.includes("order_service"), "llms.txt is missing service ordering");
  assert(llms.body.includes("list_merch"), "llms.txt is missing Merch Store discovery");
  assert(llms.body.includes("paymentOffer"), "llms.txt is missing the private offer credential");
  assert.match(llmsFull.body, /x-payment-offer/);
  assert.equal(staticMcpResult.data.servers[0].description, DISCOVERY_DESCRIPTION);
  assert(staticMcpResult.data.servers[0].description.length <= 100);
  assert.equal(fareboxResult.data.backend.checkoutEnabled, true);
  assert.equal(fareboxResult.data.offer.inventory, catalog.entries.length);
  assert.equal(fareboxResult.data.settlement.scheme, "signed-bearer-offer+base-payment");
  assert.equal(serverCardResult.data.authentication.required, false);
  assert.equal(serverCardResult.data.tools.length, 17);
  assert(serverCardResult.data.tools.every((tool) => tool.inputSchema && tool.outputSchema && tool.annotations));
  assert.equal(fareboxResult.data.backend.acceptingPayments, true);
  assert.equal(fareboxResult.data.offer.perFix.payTo.toLowerCase(), TREASURY);
  assert.equal(fareboxResult.data.settlement.payTo.toLowerCase(), TREASURY);
  assert.equal(openapiResult.data.info.version, "0.5.1");
  assert.match(openapiResult.data.paths["/books"].get.responses["200"].description, /rolling 30-day targets/);
  assert.match(openapiResult.data.paths["/fix/{id}"].get.responses["402"].description, /signed USDC and ETH checkout/);
  for (const path of ["/offer", "/fix/{id}", "/skills", "/skill/{id}", "/services", "/service-orders", "/service-orders/status", "/go/merch", "/requests", "/audit", "/health", "/books", "/.well-known/mcp/server-card.json"]) {
    assert(openapiResult.data.paths[path], "OpenAPI is missing " + path);
  }
  return "discovery and machine contracts agree";
});

await check("Merch Store links and fixed redirects are live", async () => {
  const homepage = await text(STORE);
  assert.match(homepage.body, /KnownFix Merch Store/);
  assert.match(homepage.body, /Visit the Merch Store/);
  assert.match(homepage.body, /KnownFix_20260829_Test-My-Claims-Campaign_IMG\.png/);
  assert.match(homepage.body, /go\/merch\?source=site-home/);
  assert.match(homepage.body, /data-knownfix-event="merch_click"/);

  const campaign = await request(new URL("KnownFix_20260829_Test-My-Claims-Campaign_IMG.png", STORE));
  assert.equal(campaign.status, 200);
  assert.equal(campaign.headers.get("content-type"), "image/png");

  const redirect = async (path) => await fetch(API + path, {
    headers: OPERATOR_HEADERS,
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  const [store, product, fallback] = await Promise.all([
    redirect("/go/merch?source=site-home"),
    redirect("/go/merch?source=mcp-list&product=test-my-claims-heavyweight-tee"),
    redirect("/go/merch?source=untrusted&product=https%3A%2F%2Fevil.example"),
  ]);
  assert.equal(store.status, 302);
  assert.equal(store.headers.get("location"), "https://knownfix-shop.fourthwall.com/");
  assert.equal(product.status, 302);
  assert.equal(
    product.headers.get("location"),
    "https://knownfix-shop.fourthwall.com/products/test-my-claims-knownfix-heavyweight-tee",
  );
  assert.equal(fallback.status, 302);
  assert.equal(fallback.headers.get("location"), "https://knownfix-shop.fourthwall.com/");
  return "public campaign image and allowlisted Fourthwall destinations verified";
});

await check("analytics consent page and private-data boundary are live", async () => {
  const { response, body } = await text(new URL("privacy.html", STORE));
  assert.equal(response.status, 200);
  assertAnalyticsBoundary(body, "privacy page");
  assert.match(body, /Google Analytics is optional/);
  assert.match(body, /does not send catalog search text/);
  assert.match(body, /data-knownfix-consent="granted"/);
  assert.match(body, /data-knownfix-consent="denied"/);
  return "opt-in controls live; query strings, private intake, wallet proofs, and reports excluded";
});

await check("backend health, security headers, and CORS preflight", async () => {
  const { response, data } = await json(API + "/health");
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.inventory, catalog.entries.length);
  assert.equal(data.services, 5);
  assert.equal(data.chainId, 8453);
  assert.equal(data.kv, true);
  assert.equal(data.checkoutEnabled, true);
  assert.equal(data.rpcHealthy, true);
  assert.equal(data.basePayBundlerHealthy, true);
  assert.equal(data.acceptingPayments, true);
  assert.equal(data.paymentRailReadiness.USDC.ready, true);
  assert.equal(data.paymentRailReadiness.ETH.ready, true);
  assert.equal(data.paymentStatus, "ready");
  assert.equal(typeof data.operatorNotifications.enabled, "boolean");
  assert.equal(
    data.operatorNotifications.provider,
    data.operatorNotifications.enabled ? "resend" : null,
  );
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert(response.headers.has("content-security-policy"));
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert(response.headers.has("x-frame-options"));
  assert(response.headers.has("referrer-policy"));
  assert(response.headers.has("permissions-policy"));
  const preflight = await request(API + "/offer", {
    method: "OPTIONS",
    headers: {
      origin: STORE,
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type,x-payment-offer,x-payment-tx",
    },
  });
  assert.equal(preflight.status, 200);
  assert.match(preflight.headers.get("access-control-allow-methods") || "", /POST/);
  assert.match(preflight.headers.get("access-control-allow-headers") || "", /x-payment-offer/);
  return "KV and checkout enabled; security headers present";
});

await check("catalog, strong matches, and honest miss", async () => {
  const [catalogResult, matchResult, localBinResult, localBinFixResult, node20Result, missResult] = await Promise.all([
    json(API + "/catalog"),
    json(API + "/match?q=" + encodeURIComponent('DeclarationError: Function "mcopy" not found')),
    json(API + "/match?q=" + encodeURIComponent("'knownfix' is not recognized as an internal or external command")),
    json(API + "/fix/npm-exec-local-bin-not-found"),
    json(API + "/match?q=" + encodeURIComponent("Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24")),
    json(API + "/match?q=" + encodeURIComponent("quasar-lantern-9842 impossible frobnication")),
  ]);
  assert.equal(catalogResult.response.status, 200);
  assert.equal(catalogResult.data.entries.length, 38);
  assert(catalogResult.data.entries.every((entry) => !("cause" in entry) && !("fix" in entry)));
  assert.deepEqual(
    catalogResult.data.entries.find((entry) => entry.id === "npm-exec-local-bin-not-found")?.discussion,
    {
      title: "Why npm exec misses a published CLI inside its matching source tree",
      url: "https://github.com/b-hash88/knownfix/discussions/2",
    },
  );
  assert.deepEqual(
    catalogResult.data.entries.find((entry) => entry.id === "gh-actions-node20-deprecation-runner")?.discussion,
    {
      title: "Node 20 warning in a GitHub-managed Pages deployment",
      url: "https://github.com/b-hash88/knownfix/discussions/3",
    },
  );
  assert.equal(matchResult.data.matches[0].id, "oz5-mcopy-cancun");
  assert.equal(localBinResult.data.matches[0].id, "npm-exec-local-bin-not-found");
  assert.equal(localBinResult.data.matches[0].sample, true);
  assert.equal(localBinResult.data.next, "GET /fix/npm-exec-local-bin-not-found");
  assert.equal(localBinFixResult.response.status, 200);
  assert.equal(localBinFixResult.data.tier, "free-sample");
  assert(localBinFixResult.data.fix, "new npm exec fix endpoint did not include its free body");
  assert.equal(node20Result.data.matches[0].id, "gh-actions-node20-deprecation-runner");
  assert.deepEqual(missResult.data.matches, []);
  assert.equal(missResult.data.next, "no match");
  return "mcopy, npm exec, and current Node 20 warnings rank first; unrelated query stays empty";
});

await check("free delivery and paid denial do not cross the boundary", async () => {
  const freeResult = await json(API + "/fix/oz5-mcopy-cancun");
  assert.equal(freeResult.response.status, 200);
  assert.equal(freeResult.data.tier, "free-sample");
  assert(freeResult.data.cause && freeResult.data.fix && freeResult.data.citation);
  const paidResult = await json(API + "/fix/windows-libuv-assert-on-exit");
  assert.equal(paidResult.response.status, 402);
  assert.equal(paidResult.data.error, "payment_required");
  assert.equal(paidResult.response.headers.get("cache-control"), "no-store");
  assert.equal(paidResult.data.purchase.checkout, "ready");
  assert.equal(paidResult.data.purchase.price.usd, "$0.05");
  assert.equal(paidResult.data.purchase.signedPurchaseOffer.currency, "USDC");
  assert.match(paidResult.data.purchase.signedPurchaseOffer.token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.equal(paidResult.data.purchase.payment.alternative.signedPurchaseOffer.currency, "ETH");
  assert.match(paidResult.data.purchase.payment.alternative.walletUri, /^ethereum:/);
  assert.equal(paidResult.data.nextAction.action, "pay-and-redeem");
  assert.equal(paidResult.data.nextAction.redemption.tool, "get_fix");
  assert(!("cause" in paidResult.data) && !("fix" in paidResult.data));
  assert.match(paidResult.response.headers.get("www-authenticate") || "", /Farebox/);
  return "free body delivered; paid body withheld with purchase-ready 402";
});

await check("signed offer issuance, validation, and product binding", async () => {
  const offerResult = await json(API + "/offer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productType: "fix", productId: "windows-libuv-assert-on-exit" }),
  });
  assert.equal(offerResult.response.status, 201);
  assert.equal(offerResult.response.headers.get("cache-control"), "no-store");
  assert.equal(offerResult.data.spec, "knownfix-payment-offer/2.0");
  assert.equal(offerResult.data.currency, "ETH");
  assert.equal(offerResult.data.redemption.proofType, "transaction-hash");
  assert.equal(offerResult.data.productId, "windows-libuv-assert-on-exit");
  assert.equal(offerResult.data.payTo.toLowerCase(), TREASURY);
  assert(BigInt(offerResult.data.priceWei) > BigInt(offerResult.data.basePriceWei));
  assert.match(offerResult.data.token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  const expiry = Date.parse(offerResult.data.expiresAt);
  assert(expiry > Date.now() && expiry <= Date.now() + 3_700_000);
  const wrongProduct = await json(API + "/fix/npm-install-silent-failure", {
    headers: {
      "x-payment-offer": offerResult.data.token,
      "x-payment-tx": "0x" + "0".repeat(64),
    },
  });
  assert.equal(wrongProduct.response.status, 402);
  assert(wrongProduct.data.denied.includes("offer-product-mismatch"));
  assert(!("purchase" in wrongProduct.data));
  assert.equal(wrongProduct.data.nextAction.action, "resolve-existing-payment");
  assert.match(wrongProduct.data.nextAction.instruction, /Do not pay again/);
  assert(!("cause" in wrongProduct.data) && !("fix" in wrongProduct.data));
  const badRequest = await json(API + "/offer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productType: "fix", productId: "does-not-exist" }),
  });
  assert.equal(badRequest.response.status, 404);
  assert.equal(badRequest.data.error, "no-such-fix");
  return "offer is private, expiring, exact-price, and product-bound";
});

await check("USDC UserOperation and ETH transaction proofs stay separate", async () => {
  const unpaidBundle = await json(API + "/skill/npm-publishing-recovery-pack");
  assert.equal(unpaidBundle.response.status, 402);
  assert.equal(unpaidBundle.data.purchase.checkout, "ready");
  assert.equal(unpaidBundle.data.purchase.product.kind, "bundle");
  assert.equal(unpaidBundle.data.purchase.price.usd, "$4.00");
  assert.equal(unpaidBundle.data.purchase.signedPurchaseOffer.currency, "USDC");
  assert.equal(unpaidBundle.data.purchase.payment.alternative.signedPurchaseOffer.currency, "ETH");
  assert.match(unpaidBundle.data.purchase.payment.alternative.walletUri, /^ethereum:/);
  assert.equal(unpaidBundle.data.nextAction.redemption.tool, "get_skill");
  assert(!("skillMd" in unpaidBundle.data));

  const [usdcOffer, ethOffer] = await Promise.all([
    json(API + "/offer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productType: "skill", productId: "base-payment-verification-pack", currency: "USDC" }),
    }),
    json(API + "/offer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productType: "skill", productId: "base-payment-verification-pack", currency: "ETH" }),
    }),
  ]);
  assert.equal(usdcOffer.response.status, 201);
  assert.equal(ethOffer.response.status, 201);
  assert.equal(usdcOffer.data.priceUsd, "$49.00");
  assert.equal(usdcOffer.data.amountUsdcAtomic, "49000000");
  assert.equal(usdcOffer.data.payTo.toLowerCase(), TREASURY);
  assert.equal(ethOffer.data.payTo.toLowerCase(), TREASURY);
  assert.equal(usdcOffer.data.redemption.proofType, "erc-4337-user-operation-hash");
  assert.match(usdcOffer.data.basePay.params.dataSuffix, /^0x[0-9a-f]{32}$/);
  assert.equal(ethOffer.data.priceUsd, "$49.00");
  assert.equal(ethOffer.data.redemption.proofType, "transaction-hash");
  assert.match(ethOffer.data.priceWei, /^\d+$/);

  const missingHash = "0x" + "2".repeat(64);
  const [usdcDenied, ethDenied] = await Promise.all([
    json(API + "/skill/base-payment-verification-pack", {
      headers: { "x-payment-tx": missingHash, "x-payment-offer": usdcOffer.data.token },
    }),
    json(API + "/skill/base-payment-verification-pack", {
      headers: { "x-payment-tx": missingHash, "x-payment-offer": ethOffer.data.token },
    }),
  ]);
  assert.equal(usdcDenied.response.status, 402);
  assert(usdcDenied.data.denied.includes("userop-not-found"));
  assert.equal(ethDenied.response.status, 402);
  assert(ethDenied.data.denied.includes("tx-not-found"));
  assert(!("skillMd" in usdcDenied.data) && !("skillMd" in ethDenied.data));
  return "v2 offers route unknown proofs to userop-not-found and tx-not-found";
});

await check("live chain verification rejects a successful payment to the wrong recipient", async () => {
  const offerResult = await json(API + "/offer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productType: "fix", productId: "windows-libuv-assert-on-exit" }),
  });
  assert.equal(offerResult.response.status, 201);
  const block = await baseRpc("eth_getBlockByNumber", ["latest", true]);
  let unrelated;
  for (const transaction of block.transactions) {
    if (!transaction.to || transaction.to.toLowerCase() === offerResult.data.payTo.toLowerCase()) continue;
    const receipt = await baseRpc("eth_getTransactionReceipt", [transaction.hash]);
    if (receipt?.status === "0x1") {
      unrelated = transaction;
      break;
    }
  }
  assert(unrelated, "latest Base block had no suitable successful transaction");
  const denied = await json(API + "/fix/windows-libuv-assert-on-exit", {
    headers: {
      "x-payment-offer": offerResult.data.token,
      "x-payment-tx": unrelated.hash,
    },
  });
  assert.equal(denied.response.status, 402);
  assert(denied.data.denied.includes("wrong-recipient"));
  assert(!("cause" in denied.data) && !("fix" in denied.data));
  return "successful Base transaction was read live and rejected for the wrong recipient";
});

await check("books HTML and JSON publish the store and Evidence Audit funnels", async () => {
  const [htmlResult, jsonResult] = await Promise.all([
    text(API + "/books", { headers: { accept: "text/html" } }),
    json(API + "/books?format=json"),
  ]);
  assert.equal(htmlResult.response.status, 200);
  assert.match(htmlResult.body, /Evidence Audit funnel/i);
  assert.match(htmlResult.body, /Store conversion funnel/i);
  assert.match(htmlResult.body, /id="service_funnel"/);
  assert.match(htmlResult.body, /id="nextExperiment"/);
  assert.match(htmlResult.body, /as of \d{4}-\d{2}-\d{2}/);
  assert.doesNotMatch(htmlResult.body, /Loading ledger/);
  assert.equal(jsonResult.data.spec, "knownfix-books/0.16");
  assert.equal(typeof jsonResult.data.operatorNotifications.enabled, "boolean");
  assert.equal(
    jsonResult.data.operatorNotifications.provider,
    jsonResult.data.operatorNotifications.enabled ? "resend" : null,
  );
  assert.deepEqual(jsonResult.data.operatorNotifications.events, [
    "service-payment-confirmed",
    "service-report-delivered",
  ]);
  assert.match(jsonResult.data.operatorNotifications.privacy, /exclude/i);
  assert.deepEqual(
    jsonResult.data.conversionFunnel.map((stage) => stage.key),
    ["requests", "handshakes", "toolCalls", "freeDeliveries", "paywallHits", "checkoutShown", "sales"],
  );
  assert.equal(typeof jsonResult.data.nextExperiment, "string");
  assert.deepEqual(
    jsonResult.data.serviceFunnel.stages.map((stage) => stage.key),
    ["qualifiedVisits", "diagnosticCompletions", "ordersCreated", "paymentConfirmed", "reportsDelivered", "implementationStarted"],
  );
  assert.equal(jsonResult.data.serviceFunnel.qualifiedVisits, undefined);
  assert.equal(jsonResult.data.serviceFunnel.stages[0].value, null);
  assert.equal(jsonResult.data.serviceFunnel.stages[5].value, null);
  assert.equal(typeof jsonResult.data.serviceFunnel.ordersCreated, "number");
  assert.equal(typeof jsonResult.data.serviceFunnel.paymentConfirmed, "number");
  assert.equal(typeof jsonResult.data.serviceFunnel.reportsDelivered, "number");
  assert.doesNotMatch(
    JSON.stringify(jsonResult.data.serviceFunnel),
    /"(?:targetUrl|ticket|paymentHash|buyer)"\s*:/,
  );
  assert.equal(jsonResult.data.measurementWindow.spec, "knownfix-target-window/0.2");
  assert.equal(jsonResult.data.measurementWindow.days, 30);
  assert.equal(typeof jsonResult.data.measurementWindow.historyStartsOnOrBeforeWindow, "boolean");
  assert.deepEqual(
    jsonResult.data.measurementWindow.funnel.map((stage) => stage.key),
    ["requests", "handshakes", "toolCalls", "freeDeliveries", "paywallHits", "checkoutShown", "sales"],
  );
  assert.equal(jsonResult.data.measurementWindow.targets.meaningfulToolUse.targetRate, 0.01);
  assert.equal(jsonResult.data.measurementWindow.targets.paywallToOffer.targetRate, 0.30);
  assert.equal(jsonResult.data.measurementWindow.targets.externalSales.target, 5);
  assert.equal(jsonResult.data.measurementWindow.experiments.purchaseReady.id, "purchase-ready-v1");
  assert.equal(jsonResult.data.measurementWindow.experiments.purchaseReady.targetRate, 0.30);
  assert.equal(typeof jsonResult.data.measurementWindow.experiments.purchaseReady.checkoutShown, "number");
  assert.match(jsonResult.data.measurementWindow.note, /Raw HTTP requests include automated and operator traffic/);
  assert(!JSON.stringify(jsonResult.data.measurementWindow).includes("paymentOffer"));
  assert.equal(typeof jsonResult.data.offers.purchaseReadyByFix, "object");
  assert.equal(typeof jsonResult.data.offers.purchaseReadyBySkill, "object");
  assert.equal(typeof jsonResult.data.offers.purchaseReadyByService, "object");
  assert.equal(typeof jsonResult.data.salesSettledOnChain, "number");
  assert.equal(typeof jsonResult.data.externalSalesSettledOnChain, "number");
  assert.equal(typeof jsonResult.data.operatorPaymentTests, "number");
  assert.equal(
    jsonResult.data.salesSettledOnChain,
    jsonResult.data.externalSalesSettledOnChain + jsonResult.data.operatorPaymentTests,
  );
  assert.equal(typeof jsonResult.data.intent.paywallHits, "number");
  assert.match(htmlResult.body, /Merch Store redirects/);
  assert.equal(typeof jsonResult.data.merch.redirects, "number");
  assert.equal(typeof jsonResult.data.merch.bySource, "object");
  assert.equal(typeof jsonResult.data.merch.byProduct, "object");
  assert.match(jsonResult.data.merch.note, /no identity, referrer, IP address/i);
  return "funnel published at " + jsonResult.data.generatedAt;
});

await check("public request board preserves ticket privacy", async () => {
  const { response, data } = await json(API + "/requests");
  assert.equal(response.status, 200);
  assert.equal(data.spec, "knownfix-requests/0.2");
  const serialized = JSON.stringify(data);
  assert.doesNotMatch(serialized, /"ticket"\s*:/i);
  assert.doesNotMatch(serialized, /"redeem/i);
  assert(data.totals && data.wanted && typeof data.wanted === "object");
  return "no tickets or redemption keys exposed";
});

await check("professional service API preserves private order boundaries", async () => {
  const serviceResult = await json(API + "/services");
  assert.equal(serviceResult.response.status, 200);
  assert.equal(serviceResult.data.spec, "knownfix-services/1.0");
  assert.equal(serviceResult.data.services.length, 5);
  assert(serviceResult.data.services.every((service) => service.priceUsd && service.deliverables.length >= 5));
  assert.doesNotMatch(JSON.stringify(serviceResult.data.publicWork), /"ticket"\s*:/i);

  const invalid = await json(API + "/service-orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      serviceId: "website-first-look",
      targetUrl: "https://localhost:3000",
      authorizationConfirmed: true,
    }),
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.data.error, "invalid-target");

  if (!SERVICE_ORDER_TARGET) {
    return "catalog live; private targets rejected; valid order creation skipped unless explicitly requested";
  }
  const created = await json(API + "/service-orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      serviceId: "website-first-look",
      targetUrl: SERVICE_ORDER_TARGET,
      notes: "Declared live E2E operator order. No payment will be sent.",
      publishTarget: false,
      authorizationConfirmed: true,
    }),
  });
  assert.equal(created.response.status, 201);
  assert.match(created.data.ticket, /^svc_[0-9a-f]{32}$/);
  assert.equal(created.data.purchase.checkout, "ready");
  assert.equal(created.data.purchase.signedOffers.USDC.productType, "service");
  assert.equal(created.data.purchase.signedOffers.USDC.amountUsdc, "149.00");
  assert.equal(created.data.purchase.signedOffers.USDC.redemption.proofType, "erc-4337-user-operation-hash");
  assert.equal(created.data.purchase.signedOffers.ETH.redemption.proofType, "transaction-hash");
  assert.equal(created.data.purchase.signedOffers.USDC.productId, created.data.purchase.signedOffers.ETH.productId);
  const status = await json(API + "/service-orders/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ticket: created.data.ticket }),
  });
  assert.equal(status.response.status, 200);
  assert.equal(status.data.status, "awaiting-payment");
  return "private operator order created; both rails are order-bound; ticket retrieval works";
});

await check("MCP initialize, registry, search, free fix, offer, and request gate", async () => {
  const initialized = await mcp(1, "initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "knownfix-live-e2e", version: "1.0.0" },
  });
  assert.equal(initialized.result.serverInfo.name, "knownfix");
  assert.equal(initialized.result.serverInfo.version, "0.5.1");
  assert.equal(initialized.result.serverInfo.description, DISCOVERY_DESCRIPTION);
  const listed = await mcp(2, "tools/list");
  assert.equal(listed.result.tools.length, 17);
  const names = listed.result.tools.map((tool) => tool.name);
  for (const name of ["search_fixes", "get_offer", "get_fix", "list_catalog", "audit_theme", "check_request", "check_submission", "list_services", "order_service", "check_service_order", "list_merch"]) {
    assert(names.includes(name), "MCP is missing " + name);
  }
  for (const tool of listed.result.tools) {
    assert(tool.outputSchema, tool.name + " is missing outputSchema");
    for (const hint of ["readOnlyHint", "destructiveHint", "idempotentHint", "openWorldHint"]) {
      assert.equal(typeof tool.annotations?.[hint], "boolean", tool.name + " is missing " + hint);
    }
  }
  assert.match(listed.result.tools.find((tool) => tool.name === "get_fix").description, /id alone/);
  assert.match(listed.result.tools.find((tool) => tool.name === "get_skill").description, /id alone/);
  const serviceList = parseToolText(await mcp(11, "tools/call", {
    name: "list_services",
    arguments: {},
  }));
  assert.equal(serviceList.services.length, 5);
  assert.equal(serviceList.services.find((service) => service.id === "website-first-look").priceUsd, "$149.00");
  assert.equal(serviceList.services.find((service) => service.id === "website-growth-audit").priceUsd, "$399.00");
  assert.equal(serviceList.services.find((service) => service.id === "codebase-review").priceUsd, "$249.00");
  const merchList = parseToolText(await mcp(12, "tools/call", {
    name: "list_merch",
    arguments: {},
  }));
  assert.equal(merchList.store, "KnownFix Merch Store");
  assert.equal(merchList.products.length, 4);
  assert(merchList.products.every((product) => product.url.startsWith(API + "/go/merch?source=mcp-list&product=")));
  const searched = parseToolText(await mcp(3, "tools/call", {
    name: "search_fixes",
    arguments: { query: 'DeclarationError: Function "mcopy" not found' },
  }));
  assert.equal(searched.matches[0].id, "oz5-mcopy-cancun");
  assert(searched.fix?.fix, "free top match did not include its body");
  const eotpSearch = parseToolText(await mcp(8, "tools/call", {
    name: "search_fixes",
    arguments: { query: "npm ERR! code EOTP" },
  }));
  assert.equal(eotpSearch.matches[0].id, "npm-publish-2fa-403");
  assert.equal(eotpSearch.matches[0].match, 1);
  assert.equal(eotpSearch.topMatchTier, "paid");
  assert.equal(eotpSearch.purchase.checkout, "ready");
  assert.equal(eotpSearch.purchase.product.kind, "bundle");
  assert.equal(eotpSearch.purchase.product.id, "npm-publishing-recovery-pack");
  assert.equal(eotpSearch.purchase.price.usd, "$4.00");
  assert.equal(eotpSearch.purchase.nextAction.action, "pay-and-redeem");
  assert.equal(eotpSearch.purchase.nextAction.redemption.tool, "get_skill");
  assert.equal(eotpSearch.purchase.singleFixAlternative.price.usd, "$0.05");
  assert.equal(eotpSearch.purchase.singleFixAlternative.nextAction.redemption.tool, "get_fix");
  const freeFix = parseToolText(await mcp(4, "tools/call", {
    name: "get_fix",
    arguments: { id: "oz5-mcopy-cancun" },
  }));
  assert.equal(freeFix.tier, "free-sample");
  assert(freeFix.cause && freeFix.fix);
  const directPaidFix = parseToolText(await mcp(9, "tools/call", {
    name: "get_fix",
    arguments: { id: "windows-libuv-assert-on-exit" },
  }));
  assert.equal(directPaidFix.error, "payment_required");
  assert.equal(directPaidFix.purchase.checkout, "ready");
  assert.equal(directPaidFix.purchase.signedPurchaseOffer.currency, "USDC");
  assert.equal(directPaidFix.nextAction.redemption.tool, "get_fix");
  assert(!("cause" in directPaidFix) && !("fix" in directPaidFix));
  const directBundle = parseToolText(await mcp(10, "tools/call", {
    name: "get_skill",
    arguments: { id: "npm-publishing-recovery-pack" },
  }));
  assert.equal(directBundle.error, "payment_required");
  assert.equal(directBundle.purchase.checkout, "ready");
  assert.equal(directBundle.purchase.product.kind, "bundle");
  assert.equal(directBundle.purchase.price.usd, "$4.00");
  assert.equal(directBundle.nextAction.redemption.tool, "get_skill");
  assert(!("skillMd" in directBundle));
  const offer = parseToolText(await mcp(5, "tools/call", {
    name: "get_offer",
    arguments: { productType: "fix", productId: "windows-libuv-assert-on-exit" },
  }));
  assert.equal(offer.spec, "knownfix-payment-offer/2.0");
  assert.equal(offer.currency, "ETH");
  assert.match(offer.token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  const stockedRequest = parseToolText(await mcp(6, "tools/call", {
    name: "request_fix",
    arguments: { signature: 'DeclarationError: Function "mcopy" not found', publish: false },
  }));
  assert.equal(stockedRequest.status, "already-stocked");
  assert.equal(stockedRequest.fixId, "oz5-mcopy-cancun");
  assert(!("ticket" in stockedRequest), "stocked request must not mint a free ticket");
  const invalidSubmission = parseToolText(await mcp(7, "tools/call", {
    name: "check_submission",
    arguments: { submissionId: "not-a-submission-id" },
  }));
  assert.equal(invalidSubmission.error, "invalid-submission-id");
  return "17 tools; fixes, bundles, services, Merch Store, signed offers, and request gates work over MCP";
});

const passed = results.filter((result) => result.ok);
const failed = results.filter((result) => !result.ok);
for (const result of results) {
  const mark = result.ok ? "PASS" : "FAIL";
  const detail = result.detail ? " - " + result.detail : "";
  console.log(mark.padEnd(4) + " " + result.name + " (" + result.ms + " ms)" + detail);
}
console.log("\n" + passed.length + "/" + results.length + " live E2E groups passed.");
if (failed.length) process.exitCode = 1;
