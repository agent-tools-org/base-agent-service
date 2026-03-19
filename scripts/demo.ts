/**
 * Demo script — connects to Base Sepolia, reads chain info,
 * shows wallet status, and checks deployment readiness.
 *
 * Usage:
 *   npx tsx scripts/demo.ts
 *
 * Requires PRIVATE_KEY in .env (or environment).
 */

import * as fs from "fs";
import * as path from "path";

// Load .env if present (no external dependency needed)
const envPath = path.resolve(".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const val = trimmed.slice(idx + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, registryBytecode, getPrivateKey } from "../src/config.js";

interface DemoResult {
  timestamp: string;
  chain: { id: number; name: string };
  latestBlock: { number: string; hash: string; timestamp: string };
  wallet: { address: string; balanceETH: string; balanceWei: string };
  contract: { bytecodeChars: number; ready: boolean };
  deploymentReady: boolean;
}

async function main() {
  console.log("🔗 Base Agent Service Registry — Demo\n");

  // 1. Connect to Base Sepolia
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const chainId = await publicClient.getChainId();
  console.log(`Chain ID   : ${chainId}`);
  console.log(`Chain name : ${baseSepolia.name}`);

  // 2. Read latest block
  const block = await publicClient.getBlock({ blockTag: "latest" });
  console.log(`\nLatest block:`);
  console.log(`  Number    : ${block.number}`);
  console.log(`  Hash      : ${block.hash}`);
  console.log(`  Timestamp : ${new Date(Number(block.timestamp) * 1000).toISOString()}`);

  // 3. Wallet from PRIVATE_KEY
  const account = privateKeyToAccount(getPrivateKey());
  console.log(`\nWallet     : ${account.address}`);

  // 4. Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  const balanceETH = formatEther(balance);
  console.log(`Balance    : ${balanceETH} ETH`);

  // 5. Deployment readiness
  const bytecodeReady = registryBytecode.length > 2; // more than just "0x"
  const hasFunds = balance > 0n;
  const deploymentReady = bytecodeReady && hasFunds;

  console.log(`\nDeployment readiness:`);
  console.log(`  Bytecode compiled : ${bytecodeReady ? "✅" : "❌"} (${registryBytecode.length} chars)`);
  console.log(`  Wallet funded     : ${hasFunds ? "✅" : "⚠️  No funds — request from Base Sepolia faucet"}`);
  console.log(`  Ready to deploy   : ${deploymentReady ? "✅ YES" : "❌ NO"}`);

  // 6. Save proof
  const result: DemoResult = {
    timestamp: new Date().toISOString(),
    chain: { id: chainId, name: baseSepolia.name },
    latestBlock: {
      number: block.number.toString(),
      hash: block.hash,
      timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
    },
    wallet: {
      address: account.address,
      balanceETH,
      balanceWei: balance.toString(),
    },
    contract: {
      bytecodeChars: registryBytecode.length,
      ready: bytecodeReady,
    },
    deploymentReady,
  };

  const proofDir = path.resolve("proof");
  if (!fs.existsSync(proofDir)) {
    fs.mkdirSync(proofDir, { recursive: true });
  }
  const proofPath = path.join(proofDir, "demo.json");
  fs.writeFileSync(proofPath, JSON.stringify(result, null, 2) + "\n");
  console.log(`\n📄 Proof saved to ${proofPath}`);
  console.log("\n✅ Demo complete.");
}

main().catch((err) => {
  console.error("Demo failed:", err.message || err);
  process.exit(1);
});
