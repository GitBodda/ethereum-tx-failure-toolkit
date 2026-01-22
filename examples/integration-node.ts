// Minimal integration example for Node.js
import { analyzeTx } from '../src/rpc.js';

(async () => {
  const txHash = '0x2e16ce6f3389b316f94cec33688c1a69bdc1347c012833af52eb9c8acc594a88';
  const rpcUrl = process.env.RPC_URL || '<your_rpc_url>';
  const result = await analyzeTx(txHash, rpcUrl);
  console.log(result);
})();
