// Minimal JSON-RPC transport for Ethereum
export async function jsonRpcTransport(rpcUrl, payload) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}
