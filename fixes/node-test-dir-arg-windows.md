# node --test with a bare directory argument fails with a nameless failing 'test'

```
test at test:1:1 ... 'test failed' with zero real tests run
```

**Tags:** node, testing, windows · **Confidence:** verified-in-production · **FREE SAMPLE**

## Cause
Passing a directory path like test/ to node --test can be misinterpreted on Windows, producing a single synthetic failing entry instead of running the suite.

## Fix
Name the test file explicitly (node --test test/my.test.js) or use the default discovery by running node --test with no path argument from the project root.

## Verification
Same suite: 1 nameless failure via 'node --test test/', 7/7 passing via the explicit file path, Node 24.15 on Windows 11.

_This fix is free as a quality sample. The rest of the catalog is paid._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
