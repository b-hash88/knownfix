# Windows Agent Shell Pack

A shell-layer decision system for Windows agents that need to distinguish PowerShell, cmd.exe, MSYS2, Node.js, and process-environment failures before changing the command.

**Price:** $4.00 USDC on Base, or a signed exact-ETH equivalent  
**Contents:** six complete Windows shell and Node.js fixes, a parser ownership decision tree, secret-safe command patterns, and verification checks  
**Updated for:** Windows PowerShell 5.1 and 7, current Node.js test and process behavior, and MSYS2 argument conversion

## Included material

- [Node on Windows: 'Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)' at exit](https://b-hash88.github.io/knownfix/fixes/windows-libuv-assert-on-exit.md) - `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c`
- [node --test with a bare directory argument fails with a nameless failing 'test'](https://b-hash88.github.io/knownfix/fixes/node-test-dir-arg-windows.md) - `test at test:1:1 ... 'test failed' with zero real tests run`
- [PowerShell 5.1: '&&' and '||' are parser errors](https://b-hash88.github.io/knownfix/fixes/ps51-no-pipeline-chain-operators.md) - `The token '&&' is not a valid statement separator in this version`
- [curl -w format strings mangled into C:/Program Files/Git/ paths on git-bash](https://b-hash88.github.io/knownfix/fixes/msys-curl-format-path-mangling.md) - `C:/Program Files/Git/ prefixed onto strings that started with a forward slash`
- [PowerShell Read-Host: secret pasted into the prompt string yields an empty variable](https://b-hash88.github.io/knownfix/fixes/powershell-readhost-prompt-secret.md) - `$t = Read-Host "<the secret itself>" ... later auth fails with ENEEDAUTH / empty credential`
- [Windows: an env var set with setx is missing in the shell that set it](https://b-hash88.github.io/knownfix/fixes/windows-setx-not-in-running-shell.md) - `environment variable appears unset immediately after setx reported success`

## Free decision preview

1. Identify the process that parses the failing line before rewriting its syntax.
2. Separate PowerShell 5.1 grammar from PowerShell 7 features, especially pipeline chaining.
3. Treat Git Bash path conversion as an argument-boundary problem, not a curl problem.
4. Keep secret prompts out of command history and model-visible arguments.
5. Distinguish persistent setx writes from the environment inherited by the current process.
6. Let Node providers and handles close cleanly before process exit on Windows.

The paid body supplies exact commands, version branches, failure-layer checks, secret-handling constraints, and verification procedures for all six cases.

Purchase through KnownFix's `get_offer` and `get_skill` MCP tools using product id `windows-agent-shell-pack`.

[KnownFix storefront](https://b-hash88.github.io/knownfix/) | [Agent store guide](https://b-hash88.github.io/knownfix/llms.txt) | [Live skill shelf](https://knownfix-backend-28.b-hash88.deno.net/skills)
