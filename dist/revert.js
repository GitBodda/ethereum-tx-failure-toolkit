// Helper to deeply search for revert data in error objects
export function findRevertData(obj) {
    if (!obj || typeof obj !== "object")
        return undefined;
    if (typeof obj === "string" && obj.startsWith("0x"))
        return obj;
    for (const key of Object.keys(obj)) {
        if (key.toLowerCase().includes("data") || key.toLowerCase().includes("result")) {
            const val = obj[key];
            if (typeof val === "string" && val.startsWith("0x"))
                return val;
            const found = findRevertData(val);
            if (found)
                return found;
        }
        if (typeof obj[key] === "object") {
            const found = findRevertData(obj[key]);
            if (found)
                return found;
        }
    }
    return undefined;
}
// Helper to decode revert data
export function decodeRevertData(data) {
    if (!data || !data.startsWith("0x") || data.length < 10) {
        return { category: "failed_unknown_reason", message: "No revert data." };
    }
    const selector = data.slice(0, 10);
    if (selector === "0x08c379a0" && data.length >= 138) {
        // Error(string)
        try {
            const reasonHex = data.slice(10 + 64, 10 + 64 + 64);
            const reasonLen = parseInt(data.slice(74, 74 + 64), 16) * 2;
            const reason = Buffer.from(data.slice(138, 138 + reasonLen), "hex").toString();
            return { category: "revert_reason", message: reason, revertSelector: selector };
        }
        catch {
            return { category: "revert_reason", message: "Failed to decode revert reason.", revertSelector: selector };
        }
    }
    if (selector === "0x4e487b71" && data.length >= 74) {
        // Panic(uint256)
        const codeHex = data.slice(10 + 64, 10 + 64 + 64);
        const code = parseInt(codeHex, 16);
        const panicCodes = {
            0x01: "Assertion failed",
            0x11: "Arithmetic overflow/underflow",
            0x12: "Division/modulo by zero",
            0x21: "Invalid enum value",
            0x22: "Storage byte array incorrectly encoded",
            0x31: "Empty array pop",
            0x32: "Out-of-bounds array access",
            0x41: "Out-of-bounds allocation",
            0x51: "Uninitialized function pointer"
        };
        const msg = panicCodes[code] || `Panic code 0x${code.toString(16)}`;
        return { category: "panic", message: msg, revertSelector: selector };
    }
    // Custom error
    return { category: "custom_error", message: `Custom error selector: ${selector}`, revertSelector: selector };
}
