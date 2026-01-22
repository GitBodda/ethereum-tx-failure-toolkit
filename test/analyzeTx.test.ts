import { describe, it, expect } from "vitest";
import { analyzeTx } from "../src/rpc.js";

function mockClient(responses: Record<string, any>) {
  return async (method: string, params: any[]) => {
    const key = method + JSON.stringify(params);
    if (key in responses) return responses[key];
    return { error: { message: "not found" } };
  };
}

describe("analyzeTx", () => {
  it("invalid tx hash", async () => {
    const result = await analyzeTx("0x123", "", mockClient({}));
    expect(result.category).toBe("invalid_tx_hash");
  });


  it("not found receipt", async () => {
    const txHash = "0x" + "1".repeat(64);
    const client = mockClient({
      [`eth_getTransactionReceipt[\"${txHash}\"]`]: { result: null }
    });
    const result = await analyzeTx(txHash, "", client);
    expect(result.category).toBe("not_found");
  });


  it("success receipt", async () => {
    const txHash = "0x" + "2".repeat(64);
    const client = mockClient({
      [`eth_getTransactionReceipt[\"${txHash}\"]`]: { result: { status: "0x1" } },
      [`eth_getTransactionByHash[\"${txHash}\"]`]: { result: { gas: "0x5208" } }
    });
    const result = await analyzeTx(txHash, "", client);
    expect(result.category).toBe("success");
  });


  it("failed receipt with custom error selector", async () => {
    const txHash = "0x" + "3".repeat(64);
    const client = async (method: string, params: any[]) => {
      const key = method + JSON.stringify(params);
      if (key === `eth_getTransactionReceipt[\"${txHash}\"]`) {
        return { result: { status: "0x0" } };
      }
      if (key === `eth_getTransactionByHash[\"${txHash}\"]`) {
        return { result: { from: "0x", to: "0x", input: "0x", value: null, gas: "0x5208" } };
      }
      if (key === 'eth_call[{"from":"0x","to":"0x","data":"0x","value":null},null]') {
        const error = new Error("execution reverted");
        (error as any).data = "0x4615d2d9";
        throw error;
      }
      return { error: { message: "not found" } };
    };
    const result = await analyzeTx(txHash, "", client);
    expect(result.category).toBe("custom_error");
    expect(result.revertSelector).toBe("0x4615d2d9");
  });

  it("failed receipt with no revert data", async () => {
    const txHash = "0x" + "4".repeat(64);
    const client = mockClient({
      [`eth_getTransactionReceipt[\"${txHash}\"]`]: { result: { status: "0x0", gasUsed: "0x5208" } },
      [`eth_getTransactionByHash[\"${txHash}\"]`]: { result: { gas: "0x5208" } },
      'eth_call[{"from":"0x","to":"0x","data":"0x","value":null},null]': { result: "0x" }
    });
    const result = await analyzeTx(txHash, "", client);
    expect(["out_of_gas", "failed_unknown_reason"]).toContain(result.category);
  });
});
