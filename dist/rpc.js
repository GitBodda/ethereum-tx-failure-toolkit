import { findRevertData, decodeRevertData } from "./revert.js";
export async function analyzeTx(txHash, rpcUrl) {
    // Fetch receipt
    const fetchRpc = async (method, params) => {
        const payload = {
            jsonrpc: "2.0",
            method,
            params,
            id: 1
        };
        let response;
        try {
            response = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }
        catch (err) {
            return { error: { message: "Failed to connect to RPC URL." } };
        }
        if (!response.ok) {
            return { error: { message: `RPC error: ${response.status} ${response.statusText}` } };
        }
        return await response.json();
    };
    // Get receipt
    const receiptRes = await fetchRpc("eth_getTransactionReceipt", [txHash]);
    if (receiptRes.error) {
        return {
            txHash,
            status: "unknown",
            category: "rpc_error",
            message: receiptRes.error.message || "RPC returned error."
        };
    }
    const receipt = receiptRes.result;
    if (!receipt) {
        return {
            txHash,
            status: "unknown",
            category: "not_found",
            message: "Transaction not found."
        };
    }
    // Get tx
    const txRes = await fetchRpc("eth_getTransactionByHash", [txHash]);
    if (txRes.error || !txRes.result) {
        return {
            txHash,
            status: "unknown",
            category: "rpc_error",
            message: txRes.error?.message || "Transaction not found."
        };
    }
    const tx = txRes.result;
    // Success
    if (receipt.status === "0x1") {
        return {
            txHash,
            status: "success",
            category: "success",
            message: "Transaction succeeded."
        };
    }
    // Failed: try to extract revert reason
    if (receipt.status === "0x0") {
        let revertData = undefined;
        let revertSelector = undefined;
        let category = "failed_unknown_reason";
        let message = "Transaction failed.";
        let recommendation = "Check contract logic, gas, and error logs.";
        // Try eth_call replay
        try {
            const callParams = [{
                    from: tx.from,
                    to: tx.to,
                    data: tx.input,
                    value: tx.value
                }, receipt.blockNumber];
            const callRes = await fetchRpc("eth_call", callParams);
            // If eth_call returns error, try to extract revert data
            if (callRes.error) {
                revertData = findRevertData(callRes.error) || findRevertData(callRes) || undefined;
            }
            else if (callRes.result && typeof callRes.result === "string" && callRes.result.startsWith("0x")) {
                revertData = callRes.result;
            }
        }
        catch (err) {
            revertData = findRevertData(err) || undefined;
        }
        // Decode revert data
        if (revertData) {
            const decoded = decodeRevertData(revertData);
            category = decoded.category;
            message = decoded.message;
            revertSelector = decoded.revertSelector;
        }
        else {
            // Out of gas heuristic
            if (receipt.gasUsed && tx.gas && typeof receipt.gasUsed === "string" && typeof tx.gas === "string") {
                const used = BigInt(receipt.gasUsed);
                const limit = BigInt(tx.gas);
                if (limit > 0n && used * 100n / limit >= 98n) {
                    category = "out_of_gas";
                    message = "Transaction likely ran out of gas.";
                }
            }
        }
        return {
            txHash,
            status: "failed",
            category,
            message,
            recommendation,
            ...(revertData && revertData !== "0x" ? { revertData } : {}),
            ...(revertSelector && revertSelector.length === 10 ? { revertSelector } : {})
        };
    }
    // Unknown
    return {
        txHash,
        status: "unknown",
        category: "unknown",
        message: "Transaction status unknown."
    };
}
