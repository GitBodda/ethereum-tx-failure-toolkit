import { analyzeTx } from "./rpc.js";

function printUsage() {
  console.error("Usage: analyze <txHash> [--rpc <url>]");
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2 || args[0] !== "analyze") printUsage();

  const txHash = args[1];
  let rpcUrl = process.env.RPC_URL;
  const rpcFlag = args.indexOf("--rpc");
  if (rpcFlag !== -1 && args[rpcFlag + 1]) rpcUrl = args[rpcFlag + 1];

  if (!rpcUrl) {
    console.error("Error: RPC URL not provided. Set RPC_URL env or use --rpc <url>.");
    process.exit(1);
  }

  const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
  if (!txHashRegex.test(txHash)) {
    console.log(JSON.stringify({
      txHash,
      status: "unknown",
      category: "invalid_tx_hash",
      message: "Transaction hash is invalid."
    }, null, 2));
    process.exit(0);
  }

  try {
    const result = await analyzeTx(txHash, rpcUrl);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    let msg = "RPC error occurred.";
    if (typeof err === "object" && err && "message" in err && typeof (err as any).message === "string") {
      msg = (err as any).message;
    }
    console.log(JSON.stringify({
      txHash,
      status: "unknown",
      category: "rpc_error",
      message: msg
    }, null, 2));
    process.exit(1);
  }
}

main();
