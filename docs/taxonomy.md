# Failure Taxonomy

This toolkit classifies Ethereum transaction outcomes into the following categories:

## success
- **What it means:** Transaction executed successfully.
- **Typical symptoms:** Status is successful, no errors.
- **Detection:** Receipt status is 1.
- **Next steps:** No action needed.

## invalid_tx_hash
- **What it means:** Provided transaction hash is not valid.
- **Typical symptoms:** Hash format is incorrect.
- **Detection:** Regex check fails.
- **Next steps:** Check and correct the transaction hash.

## not_found
- **What it means:** Transaction not found on chain.
- **Typical symptoms:** No receipt or transaction data.
- **Detection:** RPC returns not found.
- **Next steps:** Verify hash and network; check propagation.

## rpc_error
- **What it means:** RPC endpoint returned an error.
- **Typical symptoms:** Error message from RPC, no data.
- **Detection:** RPC call fails or returns error.
- **Next steps:** Check RPC URL, network, or try another endpoint.

## revert_reason
- **What it means:** Transaction reverted with a standard reason string.
- **Typical symptoms:** Revert data decodes to a reason string.
- **Detection:** Revert selector matches standard reason.
- **Next steps:** Review contract logic and revert reason.

## panic
- **What it means:** Transaction reverted with a Solidity panic code.
- **Typical symptoms:** Revert data decodes to a panic code.
- **Detection:** Revert selector matches panic signature.
- **Next steps:** Investigate contract for panics (e.g., overflows).

## custom_error
- **What it means:** Transaction reverted with a custom error.
- **Typical symptoms:** Revert data decodes to a custom error signature.
- **Detection:** Revert selector does not match standard errors.
- **Next steps:** Check contract ABI for custom errors.

## out_of_gas
- **What it means:** Transaction likely ran out of gas.
- **Typical symptoms:** Gas used is near gas limit, no revert data.
- **Detection:** Heuristic based on gas usage.
- **Next steps:** Increase gas limit or optimize contract.

## failed_unknown_reason
- **What it means:** Transaction failed, but no revert data or clear reason.
- **Typical symptoms:** Status failed, no revert data.
- **Detection:** No revert data, not out of gas.
- **Next steps:** Review contract and transaction details.