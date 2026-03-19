/**
 * Deploy AgentServiceRegistry to Status Network Sepolia (gasless chain, gasPrice=0).
 *
 * After deployment, registers a test service ("AI Data Analysis") and
 * saves full proof to proof/gasless-deploy.json.
 *
 * Usage:
 *   npx tsx scripts/gasless-deploy.ts
 */

import * as fs from "fs";
import * as path from "path";
import {
  createWalletClient,
  createPublicClient,
  http,
  defineChain,
  type Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ---- Load .env ----
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

// ---- Status Network Sepolia chain ----
const statusSepolia = defineChain({
  id: 1660990954,
  name: "Status Network Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://public.sepolia.rpc.status.network"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepoliascan.status.network",
    },
  },
});

// ---- Load compiled artifact ----
const artifactPath = path.resolve("artifacts", "AgentServiceRegistry.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const abi: Abi = artifact.abi;
const bytecode: `0x${string}` = artifact.bytecode;

// ---- Helpers ----
function getPrivateKey(): `0x${string}` {
  const key = process.env.PRIVATE_KEY;
  if (!key) {
    throw new Error("PRIVATE_KEY not set in environment");
  }
  return (key.startsWith("0x") ? key : `0x${key}`) as `0x${string}`;
}

async function main() {
  const account = privateKeyToAccount(getPrivateKey());

  const walletClient = createWalletClient({
    account,
    chain: statusSepolia,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: statusSepolia,
    transport: http(),
  });

  // ---- Deploy ----
  console.log(
    `Deploying AgentServiceRegistry to Status Network Sepolia from ${account.address} …`
  );

  const deployHash = await walletClient.deployContract({
    abi,
    bytecode,
    account,
    gasPrice: 0n,
  });

  console.log(`Deploy tx hash: ${deployHash}`);
  console.log("Waiting for confirmation …");

  const deployReceipt = await publicClient.waitForTransactionReceipt({
    hash: deployHash,
  });

  if (!deployReceipt.contractAddress) {
    throw new Error("Deployment failed — no contract address in receipt");
  }

  const contractAddress = deployReceipt.contractAddress;
  console.log(`\n✅ AgentServiceRegistry deployed!`);
  console.log(`   Address : ${contractAddress}`);
  console.log(`   Block   : ${deployReceipt.blockNumber}`);
  console.log(
    `   Explorer: ${statusSepolia.blockExplorers.default.url}/address/${contractAddress}`
  );

  // ---- Register test service ----
  const serviceName = "AI Data Analysis";
  const serviceDescription =
    "On-demand data analysis powered by AI agents";
  const servicePriceWei = 1000000000000000n; // 0.001 ETH
  const serviceEndpoint = "https://agent-service.example.com/analyze";

  console.log(`\nRegistering test service "${serviceName}" …`);

  const registerHash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "registerService",
    args: [serviceName, serviceDescription, servicePriceWei, serviceEndpoint],
    gasPrice: 0n,
  });

  console.log(`Register tx hash: ${registerHash}`);

  const registerReceipt = await publicClient.waitForTransactionReceipt({
    hash: registerHash,
  });

  console.log(`✅ Service registered in block ${registerReceipt.blockNumber}`);

  // ---- Read back service to confirm ----
  const service = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getService",
    args: [0n],
  }) as any;

  console.log(`   Service ID  : ${service.id}`);
  console.log(`   Name        : ${service.name}`);
  console.log(`   Price (wei) : ${service.priceWei}`);
  console.log(`   Endpoint    : ${service.endpoint}`);
  console.log(`   Active      : ${service.active}`);

  // ---- Save proof ----
  const proof = {
    timestamp: new Date().toISOString(),
    chain: {
      id: statusSepolia.id,
      name: statusSepolia.name,
      rpcUrl: statusSepolia.rpcUrls.default.http[0],
    },
    deployer: account.address,
    contract: {
      name: "AgentServiceRegistry",
      address: contractAddress,
      deployTxHash: deployHash,
      deployBlock: deployReceipt.blockNumber.toString(),
      gasPrice: "0",
      explorerUrl: `${statusSepolia.blockExplorers.default.url}/address/${contractAddress}`,
    },
    testService: {
      serviceId: "0",
      name: serviceName,
      description: serviceDescription,
      priceWei: servicePriceWei.toString(),
      endpoint: serviceEndpoint,
      registerTxHash: registerHash,
      registerBlock: registerReceipt.blockNumber.toString(),
      active: true,
    },
  };

  const proofDir = path.resolve("proof");
  if (!fs.existsSync(proofDir)) {
    fs.mkdirSync(proofDir, { recursive: true });
  }
  const proofPath = path.join(proofDir, "gasless-deploy.json");
  fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2) + "\n");

  console.log(`\n📄 Proof saved to ${proofPath}`);
  console.log("\n✅ Gasless deploy complete.");
}

main().catch((err) => {
  console.error("Gasless deploy failed:", err.message || err);
  process.exit(1);
});
