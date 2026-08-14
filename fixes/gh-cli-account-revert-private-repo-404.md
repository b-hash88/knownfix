# git push to your own private repo fails with 'repository not found'

```
fatal: repository 'https://github.com/OWNER/REPO.git/' not found
```

**Tags:** github, gh-cli, git, auth · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
The gh CLI's active account silently reverted to a different logged-in account that has no access to the private repo. git uses gh as its credential helper, so it now presents the wrong account's token and the private repo appears not to exist (404, not 403).

## Fix
Confirm the active account with `gh api user --jq .login`; if it's the wrong one, `gh auth switch -u <correct-account>` then `gh auth setup-git` and retry the push. A 404 (not 403) on a repo you own is the tell that it's an identity problem, not a missing repo.

## Verification
Reproduced this session: push 404'd on a private repo; gh api user showed the wrong account; switching accounts fixed the identical push immediately.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
