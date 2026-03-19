/**
 * Service Agent — registers a "Data Analysis" service on-chain and
 * listens for simulated service requests.
 *
 * Usage:
 *   PRIVATE_KEY=<key> REGISTRY_ADDRESS=<addr> npx tsx src/agent/service-agent.ts
 */

import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  baseSepolia,
  registryAbi,
  getRegistryAddress,
  getPrivateKey,
} from "../config.js";

// ---- Simulated data-analysis service logic ----

import {
  performDataAnalysis,
  type AnalysisRequest,
} from "./analysis.js";

import { validateServiceRegistration } from "../validation.js";

// ---- Main agent flow ----

async function main() {
  const account = privateKeyToAccount(getPrivateKey());
  const registryAddress = getRegistryAddress();

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  console.log(`🤖 Service Agent: ${account.address}`);
  console.log(`   Registry     : ${registryAddress}\n`);

  // 1. Register the "Data Analysis" service on-chain
  const serviceName = "Data Analysis";
  const serviceDesc =
    "Statistical analysis of numeric datasets — returns count, sum, mean, min, max, and stddev.";
  const priceWei = parseEther("0.0001"); // 0.0001 ETH per invocation
  const endpoint = `https://agent.example.com/api/analyze`;

  // Validate inputs before sending the on-chain transaction
  validateServiceRegistration({
    name: serviceName,
    description: serviceDesc,
    priceWei,
    endpoint,
  });

  console.log(`Registering service "${serviceName}" …`);

  const registerHash = await walletClient.writeContract({
    address: registryAddress,
    abi: registryAbi,
    functionName: "registerService",
    args: [serviceName, serviceDesc, priceWei, endpoint],
  });

  const registerReceipt = await publicClient.waitForTransactionReceipt({
    hash: registerHash,
  });

  // Parse the ServiceRegistered event to get the service ID
  const registeredLog = registerReceipt.logs[0];
  console.log(`✅ Service registered! tx: ${registerHash}`);
  console.log(`   Block: ${registerReceipt.blockNumber}\n`);

  // 2. Read back our service from the registry
  const agentServiceIds = (await publicClient.readContract({
    address: registryAddress,
    abi: registryAbi,
    functionName: "getAgentServices",
    args: [account.address],
  })) as readonly bigint[];

  const latestServiceId = agentServiceIds[agentServiceIds.length - 1];

  const service = (await publicClient.readContract({
    address: registryAddress,
    abi: registryAbi,
    functionName: "getService",
    args: [latestServiceId],
  })) as {
    id: bigint;
    agent: `0x${string}`;
    name: string;
    description: string;
    priceWei: bigint;
    endpoint: string;
    active: boolean;
    timestamp: bigint;
  };

  console.log("Registered service details:");
  console.log(`  ID          : ${service.id}`);
  console.log(`  Name        : ${service.name}`);
  console.log(`  Price       : ${formatEther(service.priceWei)} ETH`);
  console.log(`  Endpoint    : ${service.endpoint}`);
  console.log(`  Active      : ${service.active}\n`);

  // 3. Simulate incoming service requests
  console.log("📡 Listening for simulated service requests …\n");

  const sampleRequests: AnalysisRequest[] = [
    { dataset: [10, 20, 30, 40, 50] },
    { dataset: [3, 7, 12, 5, 9, 15, 22] },
    { dataset: [100, 200, 150, 175, 225, 190] },
  ];

  for (let i = 0; i < sampleRequests.length; i++) {
    const req = sampleRequests[i];
    console.log(`--- Request #${i + 1} ---`);
    console.log(`  Input dataset: [${req.dataset.join(", ")}]`);

    const result = performDataAnalysis(req);

    console.log("  Result:");
    console.log(`    Count  : ${result.count}`);
    console.log(`    Sum    : ${result.sum}`);
    console.log(`    Mean   : ${result.mean}`);
    console.log(`    Min    : ${result.min}`);
    console.log(`    Max    : ${result.max}`);
    console.log(`    Stddev : ${result.stddev}`);
    console.log();
  }

  console.log("✅ Agent finished processing all requests.");
}

main().catch((err) => {
  console.error("Agent error:", err);
  process.exit(1);
});
