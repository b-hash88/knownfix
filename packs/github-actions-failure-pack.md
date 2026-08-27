# GitHub Actions Failure Pack

Recover GitHub Actions failures by the phase that failed: no run, workflow parse, action resolution, dependency setup, action runtime, command authorization, or a rejected workflow-file push.

**Price:** $5.00 USDC on Base, or a signed exact-ETH equivalent  
**Contents:** seven complete fixes, a failed-phase decision tree, safe diagnostic commands, and read-after-write verification  
**Updated for:** GitHub's Node 24 action-runtime migration and August 2026 action releases

## Included failures

- [GitHub Actions: workflow run is named by its file path and fails instantly (invalid YAML)](https://b-hash88.github.io/knownfix/fixes/gh-actions-invalid-workflow-yaml.md) - `a run appears named `.github/workflows/x.yml` (the file path, not the workflow name) and fails immediately`
- [GitHub Actions: Unable to resolve action, unable to find version](https://b-hash88.github.io/knownfix/fixes/gh-actions-unresolved-action-version.md) - `##[error]Unable to resolve action `actions/checkout@v99`, unable to find version `v99``
- [GitHub Actions: git push in a workflow fails 403 (exit code 128)](https://b-hash88.github.io/knownfix/fixes/gh-actions-token-permissions-403.md) - `fatal: unable to access '...': The requested URL returned error: 403 ... Process completed with exit code 128`
- [actions/setup-node cache fails: Dependencies lock file is not found](https://b-hash88.github.io/knownfix/fixes/gh-actions-setup-node-cache-no-lockfile.md) - `Dependencies lock file is not found in ... Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock`
- [GitHub Actions warns Node 20 is deprecated, running with Node 24 by default](https://b-hash88.github.io/knownfix/fixes/gh-actions-node20-deprecation-runner.md) - `Node 20 is being deprecated. This workflow is running with Node 24 by default. ... ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true`
- [How to skip a GitHub Actions run for a commit ([skip ci])](https://b-hash88.github.io/knownfix/fixes/gh-actions-skip-ci-no-run.md) - `a pushed commit should NOT trigger any workflow run`
- [git push rejected: OAuth App cannot create/update workflow without workflow scope](https://b-hash88.github.io/knownfix/fixes/gh-push-workflow-scope-rejected.md) - `! [remote rejected] main -> main (refusing to allow an OAuth App to create or update workflow `.github/workflows/x.yml` without `workflow` scope)`

## Free decision preview

1. If no run exists, inspect the event, filters, skip tokens, and whether GitHub could parse the workflow.
2. If setup fails immediately, use the exact annotation to separate invalid YAML from an unresolved action ref.
3. If setup-node cannot find a lockfile, point caching at the dependency file the job actually installs from; current releases can auto-enable npm caching.
4. If GitHub warns about Node 20, upgrade the action named in the warning. Changing setup-node's job Node version does not change another action's bundled runtime.
5. If a command receives 403, identify whether the failing credential is GITHUB_TOKEN, a GitHub CLI OAuth token, or a fork/Dependabot read-only token before changing permissions.
6. Verify the corrected run by event and commit SHA, then read back the artifact, commit, tag, or skipped-run state it was meant to produce.

The paid pack supplies exact recovery branches, current action-ref guidance, least-privilege token rules, and verification procedures. Purchase through KnownFix's `get_offer` and `get_skill` MCP tools using product id `github-actions-failure-pack`.

[KnownFix storefront](https://b-hash88.github.io/knownfix/) · [Agent store guide](https://b-hash88.github.io/knownfix/llms.txt) · [Live skill shelf](https://knownfix-backend-28.b-hash88.deno.net/skills)
