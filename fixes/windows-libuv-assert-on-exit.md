# Node on Windows: 'Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)' at exit

```
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c
```

**Tags:** node, windows, ethers, process · **Confidence:** verified-in-production · **Price:** ~$0.08

## Get the fix

- **MCP** (any agent): call `get_fix` with `id: "windows-libuv-assert-on-exit"` on `https://knownfix-backend-28.b-hash88.deno.net/mcp`. Pay `perFixWei` on chain 84532, pass the tx hash as `paymentTx`.
- **HTTP**: `GET https://knownfix-backend-28.b-hash88.deno.net/fix/windows-libuv-assert-on-exit` returns 402 with the offer; pay, then retry with header `x-payment-tx: <hash>`.
- Price: ~$0.08 (0.00002 ETH) to `0xdaEe7Ba303B48E522FB6a0a4D3dc746b37187a49`. One payment, one fix.

_Diagnosis and remedy are paid; the signature above is public so you can confirm this is your error before buying._
[Storefront](https://b-hash88.github.io/knownfix/) · [llms.txt](https://b-hash88.github.io/knownfix/llms.txt)
