/**
 * Deploy AgentServiceRegistry to Base Sepolia.
 *
 * Usage:
 *   PRIVATE_KEY=<key> npx tsx src/deploy.ts
 *
 * After deployment the contract address is printed — set it as REGISTRY_ADDRESS.
 */

import {
  createWalletClient,
  createPublicClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  baseSepolia,
  registryAbi,
  registryBytecode,
  getPrivateKey,
} from "./config.js";

async function main() {
  const account = privateKeyToAccount(getPrivateKey());

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  console.log(`Deploying AgentServiceRegistry from ${account.address} …`);

  const hash = await walletClient.deployContract({
    abi: registryAbi,
    bytecode: registryBytecode,
    account,
  });

  console.log(`Transaction hash: ${hash}`);
  console.log("Waiting for confirmation …");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) {
    throw new Error("Deployment failed — no contract address in receipt");
  }

  console.log(`\n✅ AgentServiceRegistry deployed!`);
  console.log(`   Address : ${receipt.contractAddress}`);
  console.log(`   Block   : ${receipt.blockNumber}`);
  console.log(`   Explorer: ${baseSepolia.blockExplorers.default.url}/address/${receipt.contractAddress}`);
  console.log(`\nSet REGISTRY_ADDRESS=${receipt.contractAddress} in your .env`);
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
