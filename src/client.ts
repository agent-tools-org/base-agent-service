/**
 * Client — discovers available services from the on-chain registry
 * and invokes an agent's service endpoint (simulated).
 *
 * Usage:
 *   REGISTRY_ADDRESS=<addr> npx tsx src/client.ts
 */

import { createPublicClient, http, formatEther } from "viem";
import {
  baseSepolia,
  registryAbi,
  getRegistryAddress,
} from "./config.js";

interface ServiceData {
  id: bigint;
  agent: `0x${string}`;
  name: string;
  description: string;
  priceWei: bigint;
  endpoint: string;
  active: boolean;
  timestamp: bigint;
}

async function main() {
  const registryAddress = getRegistryAddress();

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  console.log("🔍 Agent Service Discovery Client");
  console.log(`   Registry: ${registryAddress}\n`);

  // 1. Check total active services
  const activeCount = (await publicClient.readContract({
    address: registryAddress,
    abi: registryAbi,
    functionName: "activeServiceCount",
  })) as bigint;

  console.log(`Total active services: ${activeCount}\n`);

  if (activeCount === 0n) {
    console.log("No services registered yet. Run the agent first: npm run agent");
    return;
  }

  // 2. Discover services (paginated)
  const PAGE_SIZE = 10n;
  const services = (await publicClient.readContract({
    address: registryAddress,
    abi: registryAbi,
    functionName: "discoverServices",
    args: [0n, PAGE_SIZE],
  })) as readonly ServiceData[];

  console.log("=== Available Services ===\n");

  for (const svc of services) {
    console.log(`  [ID ${svc.id}] ${svc.name}`);
    console.log(`    Agent      : ${svc.agent}`);
    console.log(`    Description: ${svc.description}`);
    console.log(`    Price      : ${formatEther(svc.priceWei)} ETH`);
    console.log(`    Endpoint   : ${svc.endpoint}`);
    console.log(`    Active     : ${svc.active}`);
    console.log(`    Registered : ${new Date(Number(svc.timestamp) * 1000).toISOString()}`);
    console.log();
  }

  // 3. Pick the first service and simulate invocation
  const target = services[0];
  console.log(`=== Invoking Service [ID ${target.id}] "${target.name}" ===\n`);

  console.log(`  Endpoint   : ${target.endpoint}`);
  console.log(`  Price      : ${formatEther(target.priceWei)} ETH`);
  console.log(`  Agent      : ${target.agent}\n`);

  // Simulate calling the service endpoint (x402 payment would happen here)
  console.log("  [SIM] Sending x402 payment header …");
  console.log(`  [SIM] POST ${target.endpoint}`);
  console.log('  [SIM] Body: { "dataset": [42, 17, 88, 63, 5, 91, 34] }');
  console.log();

  // Simulated response
  const simulatedResponse = {
    count: 7,
    sum: 340,
    mean: 48.571,
    min: 5,
    max: 91,
    stddev: 30.117,
  };

  console.log("  [SIM] Response received:");
  console.log(`    Count  : ${simulatedResponse.count}`);
  console.log(`    Sum    : ${simulatedResponse.sum}`);
  console.log(`    Mean   : ${simulatedResponse.mean}`);
  console.log(`    Min    : ${simulatedResponse.min}`);
  console.log(`    Max    : ${simulatedResponse.max}`);
  console.log(`    Stddev : ${simulatedResponse.stddev}`);
  console.log();

  console.log("✅ Discovery + invocation flow complete.");
}

main().catch((err) => {
  console.error("Client error:", err);
  process.exit(1);
});
