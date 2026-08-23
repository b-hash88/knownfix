import assert from "node:assert/strict";

const STORE = (process.env.KNOWNFIX_STORE || "https://b-hash88.github.io/knownfix/").replace(/\/?$/, "/");
const API = (process.env.KNOWNFIX_API || "https://knownfix-backend-28.b-hash88.deno.net").replace(/\/$/, "");
const BASE_RPC = process.env.KNOWNFIX_BASE_RPC || "https://mainnet.base.org";
const OPERATOR_HEADERS = {
  "user-agent": "KnownFix-Live-E2E/1.0",
  "x-operator": "1",
};
const results = [];

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

await check("storefront metadata and truthful inventory", async () => {
  const { response, body } = await text(STORE);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /text\/html/);
  assert.match(body, /33 verified/);
  assert.match(body, /2 documented/);
  assert.match(body, /10 free in full/);
  assert.match(body, /rel="canonical" href="https:\/\/b-hash88\.github\.io\/knownfix\/"/);
  assert.match(body, /property="og:title"/);
  assert.match(body, /name="twitter:card"/);
  assert.equal(catalog.entries.length, 35);
  assert.equal(catalog.entries.filter((entry) => entry.sample).length, 10);
  assert.equal(catalog.entries.filter((entry) => entry.confidence === "verified-in-production").length, 33);
  assert.equal(catalog.entries.filter((entry) => entry.confidence === "documented").length, 2);
  assert(catalog.entries.every((entry) => !("cause" in entry) && !("fix" in entry)));
  return "35 entries; 33 verified, 2 documented, 10 free";
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
  assert.doesNotMatch(body, /(?:local|session)Storage/);
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
  const probes = await Promise.all(urls.map(async (url) => ({ url, response: await request(url) })));
  const failures = probes.filter(({ response: item }) => item.status !== 200);
  assert.deepEqual(failures.map(({ url, response: item }) => item.status + " " + url), []);
  return urls.length + " sitemap URLs returned 200";
});

await check("homepage internal links", async () => {
  const { body } = await text(STORE);
  const links = [...new Set(internalLinks(body, STORE))];
  const probes = await Promise.all(links.map(async (url) => ({ url, response: await request(url) })));
  const failures = probes.filter(({ response: item }) => item.status !== 200);
  assert.deepEqual(failures.map(({ url, response: item }) => item.status + " " + url), []);
  return links.length + " internal links returned 200";
});

await check("all fix pages preserve the free and paid boundary", async () => {
  const failures = [];
  await Promise.all(catalog.entries.map(async (entry) => {
    const htmlUrl = new URL("fixes/" + entry.id + ".html", STORE);
    const mdUrl = new URL("fixes/" + entry.id + ".md", STORE);
    const [htmlResult, mdResult] = await Promise.all([text(htmlUrl), text(mdUrl)]);
    try {
      assert.equal(htmlResult.response.status, 200);
      assert.equal(mdResult.response.status, 200);
      assert(htmlResult.body.includes('<link rel="canonical" href="' + htmlUrl + '">'));
      assert(htmlResult.body.includes('<link rel="alternate" type="text/markdown" href="' + mdUrl + '">'));
      if (entry.sample) {
        assert.match(htmlResult.body, /<h2>Cause<\/h2>/);
        assert.match(htmlResult.body, /<h2>Fix<\/h2>/);
        assert.match(htmlResult.body, /<h2>Verification<\/h2>/);
        assert.doesNotMatch(htmlResult.body, /id="request-offer"/);
        assert.match(mdResult.body, /## Cause/);
      } else {
        assert.doesNotMatch(htmlResult.body, /<h2>Cause<\/h2>/);
        assert.match(htmlResult.body, /id="request-offer"/);
        assert.match(htmlResult.body, /private offer token stays in this page's memory/);
        assert.doesNotMatch(htmlResult.body, /paymentOffer\s*[:=]\s*["'][A-Za-z0-9_-]+\./);
        assert(mdResult.body.includes("Diagnosis and remedy are paid"), "paid Markdown is missing its gate statement");
        assert.doesNotMatch(mdResult.body, /## Cause/);
      }
    } catch (error) {
      failures.push(entry.id + ": " + error.message);
    }
  }));
  assert.deepEqual(failures, []);
  return catalog.entries.length + " HTML and Markdown pairs validated";
});

await check("robots, agent docs, offer document, and OpenAPI", async () => {
  const [robots, llms, llmsFull, fareboxResult, openapiResult] = await Promise.all([
    text(new URL("robots.txt", STORE)),
    text(new URL("llms.txt", STORE)),
    text(new URL("llms-full.txt", STORE)),
    json(new URL(".well-known/farebox.json", STORE)),
    json(new URL("openapi.json", STORE)),
  ]);
  assert.match(robots.body, /Sitemap: https:\/\/b-hash88\.github\.io\/knownfix\/sitemap\.xml/);
  assert(llms.body.includes("get_offer"), "llms.txt is missing get_offer");
  assert(llms.body.includes("paymentOffer"), "llms.txt is missing the private offer credential");
  assert.match(llmsFull.body, /x-payment-offer/);
  assert.equal(fareboxResult.data.backend.checkoutEnabled, true);
  assert.equal(fareboxResult.data.offer.inventory, 35);
  assert.equal(fareboxResult.data.settlement.scheme, "signed-bearer-offer+evm-payment");
  assert.equal(openapiResult.data.info.version, "0.3.0");
  for (const path of ["/offer", "/fix/{id}", "/skills", "/skill/{id}", "/requests", "/audit", "/health", "/books"]) {
    assert(openapiResult.data.paths[path], "OpenAPI is missing " + path);
  }
  return "discovery and machine contracts agree";
});

await check("backend health, security headers, and CORS preflight", async () => {
  const { response, data } = await json(API + "/health");
  assert.equal(response.status, 200);
  assert.deepEqual(data, { ok: true, inventory: 35, chainId: 8453, kv: true, checkoutEnabled: true });
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

await check("catalog, strong match, and honest miss", async () => {
  const [catalogResult, matchResult, missResult] = await Promise.all([
    json(API + "/catalog"),
    json(API + "/match?q=" + encodeURIComponent('DeclarationError: Function "mcopy" not found')),
    json(API + "/match?q=" + encodeURIComponent("quasar-lantern-9842 impossible frobnication")),
  ]);
  assert.equal(catalogResult.response.status, 200);
  assert.equal(catalogResult.data.entries.length, 35);
  assert(catalogResult.data.entries.every((entry) => !("cause" in entry) && !("fix" in entry)));
  assert.equal(matchResult.data.matches[0].id, "oz5-mcopy-cancun");
  assert.deepEqual(missResult.data.matches, []);
  assert.equal(missResult.data.next, "no match");
  return "strong match ranks first; unrelated query stays empty";
});

await check("free delivery and paid denial do not cross the boundary", async () => {
  const freeResult = await json(API + "/fix/oz5-mcopy-cancun");
  assert.equal(freeResult.response.status, 200);
  assert.equal(freeResult.data.tier, "free-sample");
  assert(freeResult.data.cause && freeResult.data.fix && freeResult.data.citation);
  const paidResult = await json(API + "/fix/windows-libuv-assert-on-exit");
  assert.equal(paidResult.response.status, 402);
  assert.equal(paidResult.data.error, "payment_required");
  assert(!("cause" in paidResult.data) && !("fix" in paidResult.data));
  assert.match(paidResult.response.headers.get("www-authenticate") || "", /Farebox/);
  return "free body delivered; paid body withheld with 402";
});

await check("signed offer issuance, validation, and product binding", async () => {
  const offerResult = await json(API + "/offer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productType: "fix", productId: "windows-libuv-assert-on-exit" }),
  });
  assert.equal(offerResult.response.status, 201);
  assert.equal(offerResult.response.headers.get("cache-control"), "no-store");
  assert.equal(offerResult.data.spec, "knownfix-payment-offer/1.0");
  assert.equal(offerResult.data.productId, "windows-libuv-assert-on-exit");
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

await check("books HTML and JSON describe the same six-stage funnel", async () => {
  const [htmlResult, jsonResult] = await Promise.all([
    text(API + "/books", { headers: { accept: "text/html" } }),
    json(API + "/books?format=json"),
  ]);
  assert.equal(htmlResult.response.status, 200);
  assert.match(htmlResult.body, /Conversion funnel/i);
  assert.match(htmlResult.body, /Current bottleneck:/);
  assert.match(htmlResult.body, /as of \d{4}-\d{2}-\d{2}/);
  assert.doesNotMatch(htmlResult.body, /Loading ledger/);
  assert.equal(jsonResult.data.spec, "knownfix-books/0.5");
  assert.equal(jsonResult.data.conversionFunnel.length, 6);
  assert.equal(typeof jsonResult.data.nextExperiment, "string");
  assert.equal(typeof jsonResult.data.salesSettledOnChain, "number");
  assert.equal(typeof jsonResult.data.externalSalesSettledOnChain, "number");
  assert.equal(typeof jsonResult.data.operatorPaymentTests, "number");
  assert.equal(
    jsonResult.data.salesSettledOnChain,
    jsonResult.data.externalSalesSettledOnChain + jsonResult.data.operatorPaymentTests,
  );
  assert.equal(typeof jsonResult.data.intent.paywallHits, "number");
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

await check("MCP initialize, registry, search, free fix, offer, and request gate", async () => {
  const initialized = await mcp(1, "initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "knownfix-live-e2e", version: "1.0.0" },
  });
  assert.equal(initialized.result.serverInfo.name, "knownfix");
  const listed = await mcp(2, "tools/list");
  assert.equal(listed.result.tools.length, 10);
  const names = listed.result.tools.map((tool) => tool.name);
  for (const name of ["search_fixes", "get_offer", "get_fix", "list_catalog", "check_request"]) {
    assert(names.includes(name), "MCP is missing " + name);
  }
  const searched = parseToolText(await mcp(3, "tools/call", {
    name: "search_fixes",
    arguments: { query: 'DeclarationError: Function "mcopy" not found' },
  }));
  assert.equal(searched.matches[0].id, "oz5-mcopy-cancun");
  assert(searched.fix?.fix, "free top match did not include its body");
  const freeFix = parseToolText(await mcp(4, "tools/call", {
    name: "get_fix",
    arguments: { id: "oz5-mcopy-cancun" },
  }));
  assert.equal(freeFix.tier, "free-sample");
  assert(freeFix.cause && freeFix.fix);
  const offer = parseToolText(await mcp(5, "tools/call", {
    name: "get_offer",
    arguments: { productType: "fix", productId: "windows-libuv-assert-on-exit" },
  }));
  assert.equal(offer.spec, "knownfix-payment-offer/1.0");
  assert.match(offer.token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  const stockedRequest = parseToolText(await mcp(6, "tools/call", {
    name: "request_fix",
    arguments: { signature: 'DeclarationError: Function "mcopy" not found', publish: false },
  }));
  assert.equal(stockedRequest.status, "already-stocked");
  assert.equal(stockedRequest.fixId, "oz5-mcopy-cancun");
  assert(!("ticket" in stockedRequest), "stocked request must not mint a free ticket");
  return "10 tools; search, free delivery, signed offer, and stocked-request gate work over MCP";
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
