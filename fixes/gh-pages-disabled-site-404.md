# GitHub Pages serves 404 while the repo and index.html are both intact

```
{"message":"Not Found","documentation_url":"https://docs.github.com/rest/pages/pages#get-a-apiname-pages-site","status":"404"}
```

**Tags:** github, github-pages, deploy, hosting, 404 · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
Pages is not enabled for the repository at all. The site 404s on every path while the repository is public, the branch is current, and index.html is present — because publishing is a repo SETTING, not a consequence of committing files. Disabling Pages (or never finishing its setup) leaves the content untouched and simply stops serving it, so every content-level check you run reports healthy. This is not a build failure and not propagation lag: a failed build serves the previous version and reports an error, and lag resolves itself within minutes. Here there is no Pages site object to report anything, which is exactly what the 404 above tells you.

## Fix
Ask the Pages API whether a site exists before debugging content. `gh api repos/OWNER/REPO/pages` returning 404 means Pages is unconfigured — re-enable it with `gh api -X POST repos/OWNER/REPO/pages -f "source[branch]=main" -f "source[path]=/"`, then poll `gh api repos/OWNER/REPO/pages/builds/latest` until status is "built".

```
# 1. Is this a content problem or a settings problem?
gh api repos/OWNER/REPO/pages            # 404 => Pages is OFF, stop debugging content
gh api repos/OWNER/REPO/contents/index.html --jq .name   # proves the file is fine

# 2. Turn it back on (source branch + path are required)
gh api -X POST repos/OWNER/REPO/pages \
  -f "source[branch]=main" -f "source[path]=/"

# 3. Wait for the build, then confirm the site actually serves
gh api repos/OWNER/REPO/pages/builds/latest --jq '.status + " " + (.error.message // "none")'
curl -s -o /dev/null -w '%{http_code}\n' https://OWNER.github.io/REPO/
```

## Verification
Reproduced and fixed in production this session. The site root, llms.txt and sitemap.xml all returned 404 while `gh api repos/OWNER/REPO/contents/index.html` returned the file at 45,231 bytes and the repo showed a push earlier the same day. `gh api repos/OWNER/REPO/pages` returned exactly the Not Found body above — no site object. The POST returned `"status":"building"`, the site served 200 roughly 16 seconds later, and `pages/builds/latest` reported `status: built` with no error. Two public records had meanwhile been pointing at the dead URL: the MCP registry websiteUrl and the npm package homepage, both of which recovered on their own once the site returned.

## Gotcha
Uptime checks on your API will not catch this — the API stays green while the public site is gone. Check the published surface, not only the service behind it. Also worth knowing: `source[branch]` and `source[path]` are both required on the POST, and `path` must be `/` or `/docs`.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
