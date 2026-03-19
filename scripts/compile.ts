/**
 * Compile AgentServiceRegistry.sol using solc and save artifacts.
 *
 * Outputs:
 *   artifacts/AgentServiceRegistry.json  — { abi, bytecode }
 *
 * Usage:
 *   npx tsx scripts/compile.ts
 */

import * as fs from "fs";
import * as path from "path";
import solc from "solc";

const contractPath = path.resolve("contracts", "AgentServiceRegistry.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "AgentServiceRegistry.sol": { content: source },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
    optimizer: { enabled: true, runs: 200 },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  const fatal = output.errors.filter(
    (e: { severity: string }) => e.severity === "error"
  );
  if (fatal.length > 0) {
    console.error("Compilation errors:");
    for (const err of fatal) {
      console.error(err.formattedMessage);
    }
    process.exit(1);
  }
  // Print warnings
  for (const warn of output.errors) {
    if (warn.severity === "warning") {
      console.warn(warn.formattedMessage);
    }
  }
}

const contract =
  output.contracts["AgentServiceRegistry.sol"]["AgentServiceRegistry"];

if (!contract) {
  console.error("Contract not found in compilation output");
  process.exit(1);
}

const artifact = {
  contractName: "AgentServiceRegistry",
  abi: contract.abi,
  bytecode: "0x" + contract.evm.bytecode.object,
};

const artifactsDir = path.resolve("artifacts");
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

const outPath = path.join(artifactsDir, "AgentServiceRegistry.json");
fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2) + "\n");

console.log(`✅ Compiled AgentServiceRegistry.sol`);
console.log(`   ABI entries : ${artifact.abi.length}`);
console.log(`   Bytecode    : ${artifact.bytecode.length} chars`);
console.log(`   Output      : ${outPath}`);
