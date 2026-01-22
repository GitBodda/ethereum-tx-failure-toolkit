
# Ethereum Transaction Failure Toolkit

## What this project does
Analyzes Ethereum transaction failures and classifies them into clear categories with actionable explanations. Outputs structured JSON for easy integration and debugging.

## Features
- Detects and classifies transaction failures (revert, out of gas, RPC errors, etc.)
- Decodes revert reasons and panic codes
- Outputs clean, minimal JSON for automation or UX
- CLI and Node.js integration
- Includes real-world fixtures and a clear failure taxonomy

## Installation
```sh
npm install
```

## Quickstart
```sh
# Set your RPC URL (do not share real keys)
export RPC_URL="https://your.ethereum.node"

# Analyze a transaction
npm run dev -- analyze <txHash>
```

## Output format example
```json
{
    "txHash": "0x...",
    "status": "failed",
    "category": "custom_error",
    "message": "Custom error: ...",
    "recommendation": "Check contract ABI for custom errors.",
    "revertSelector": "0x..."
}
```

## How it works
- Fetches transaction and receipt via Ethereum JSON-RPC
- Replays failed transactions to extract revert data
- Decodes revert reasons, panic codes, and custom errors
- Applies heuristics for out-of-gas and unknown failures

## Fixtures & Taxonomy
- [Failure taxonomy](docs/taxonomy.md)
- [Test fixtures](examples/fixtures.json)

# Ethereum Transaction Failure Analysis & UX Toolkit

## Overview

This project is an open-source, Ethereum-focused developer tool that aims to make failed transactions easier to understand.

Transaction failures on Ethereum often result in vague error messages, lost gas, and confusion for both users and developers. Existing tooling usually exposes low-level execution data without translating it into clear, actionable explanations.

This toolkit focuses on analyzing failed Ethereum transactions and presenting structured, human-readable insights that can be reused by developers, wallets, and UX teams.

The project is Ethereum-first and designed as a public good.

---

## Problem Statement

Failed transactions remain one of the most frustrating aspects of interacting with Ethereum.

In practice:
- Users lose gas without understanding what went wrong
- Wallets often display generic failure messages
- Developers rely on manual inspection of receipts, traces, and RPC outputs

While Ethereum has strong infrastructure, the UX around transaction failures is still fragmented and inconsistent. The problem is not lack of data, but lack of clear interpretation.

---

## Proposed Solution

A focused toolkit that:
- Analyzes failed Ethereum transactions
- Classifies failure reasons into clear categories
- Produces structured outputs suitable for both machines and humans

The goal is not to replace existing tools, but to complement them with better clarity and usability.

---

## Target Users

- Ethereum dApp developers
- Wallet teams
- Infrastructure providers
- UX and developer experience teams
- Independent builders debugging failed transactions

---

## Why Ethereum

This project is designed specifically around Ethereum execution semantics and RPC behavior.

It directly supports Ethereum ecosystem priorities:
- Improving developer experience
- Reducing UX friction
- Supporting open-source infrastructure
- Making failure states more understandable

Ethereum is the primary focus and design constraint.

---

## Scope

### In Scope
- Ethereum mainnet and testnets
- Failed transaction analysis
- Open-source tooling
- Developer-focused outputs

### Out of Scope (initial phase)
- Token design or monetization
- Commercial features
- Multi-chain support

---

## Technical Approach (High Level)

- Ethereum JSON-RPC (receipts, traces, revert data)
- Failure pattern detection and classification
- Structured output format
- Optional lightweight UI for visualization

The architecture prioritizes clarity, maintainability, and reuse.

The initial focus is correctness and clarity before performance optimization.

---

## Open Source Commitment

- Fully open-source
- MIT License
- Public development
- Community feedback encouraged

---

## Milestones (Overview)

- Research and failure taxonomy
- Core analysis engine
- Developer interface and UX layer
- Testing and refinement

Detailed milestones are documented in ROADMAP.md.

---

## Human Impact

Clearer explanations of transaction failures help:
- Reduce wasted gas
- Lower frustration for new users
- Improve trust in Ethereum tooling
- Support independent developers and small teams

---

## Project Status

Early-stage planning and research phase.  
Repository initialized with public documentation.

---

## CLI Usage

### Prerequisites
- Node.js >= 18
- Set your Ethereum RPC URL securely as an environment variable:
  
  export RPC_URL="https://your.ethereum.node"

### Analyze a Transaction

#### Development mode

    npm run dev -- analyze <txHash>

#### Build and run

    npm run build
    node dist/index.js analyze <txHash>

#### CLI (after npm link)

    txft analyze <txHash>

#### Optional: Override RPC URL

    npm run dev -- analyze <txHash> --rpc https://your.ethereum.node

### Output
The CLI prints a structured JSON result with status, category, and recommendations.


---

## Revert Reason Decoding

When a transaction fails (status = "0x0"), the toolkit attempts to extract and decode the revert reason using the following logic:

- **Revert reason (Error(string))**: If the revert data starts with `0x08c379a0`, the reason string is decoded and shown in the output as `revert_reason`.
- **Panic(uint256)**: If the revert data starts with `0x4e487b71`, the panic code is decoded and mapped to a human-readable message (e.g., arithmetic overflow, division by zero). Output category is `panic`.
- **Custom error selector**: For other selectors, the first 4 bytes are shown as `custom_error` and the selector is included for debugging.
- **Out of gas**: If gas used is >= 98% of gas limit, the category is set to `out_of_gas`.
- **Unknown**: If no revert data is found, the category is `failed_unknown_reason`.

The output JSON includes extra fields:
- `revertData`: Raw revert data if available
- `revertSelector`: The 4-byte selector if available

---

### Notes
- Never share your real RPC URLs or keys publicly.
- Only mainnet-compatible RPC endpoints are supported.
