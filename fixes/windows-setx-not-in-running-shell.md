# Windows: an env var set with setx is missing in the shell that set it

```
environment variable appears unset immediately after setx reported success
```

**Tags:** windows, environment, shell, powershell · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
setx writes the variable to the registry for FUTURE processes only. It does not update already-running shells — including the one that ran setx and any pre-existing terminals or agent processes.

## Fix
Open a NEW shell to pick it up, or set it in the current session ($env:VAR="..." in PowerShell, export in bash), or read the value from a file. Any process spawned before the setx will never see it.

## Verification
This session: a key set via setx was invisible to already-running processes; a new shell and a file-based read both resolved it.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
