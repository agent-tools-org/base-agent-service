import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';

const chain = defineChain({
  id: 1660990954,
  name: 'Status Network Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://public.sepolia.rpc.status.network'] } },
  blockExplorers: { default: { name: 'Blockscout', url: 'https://sepoliascan.status.network' } },
});

async function main() {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const artifact = JSON.parse(fs.readFileSync('artifacts/AgentServiceRegistry.json', 'utf8'));

  const wallet = createWalletClient({ account, chain, transport: http() });
  const pub = createPublicClient({ chain, transport: http() });

  console.log('Deploying AgentServiceRegistry from', account.address);
  const hash = await wallet.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    gasPrice: 0n,
    gas: 3000000n,
  });
  console.log('TX:', hash);
  const receipt = await pub.waitForTransactionReceipt({ hash });
  console.log('Contract:', receipt.contractAddress);
  console.log('Block:', receipt.blockNumber, 'Gas:', receipt.gasUsed);

  const addr = receipt.contractAddress!;
  const regHash = await wallet.writeContract({
    address: addr, abi: artifact.abi, functionName: 'registerService',
    args: ['AI Data Analysis', 'On-demand data analysis by AI agents', 1000000000000000n, 'https://agent-service.example.com/analyze'],
    gasPrice: 0n, gas: 500000n,
  });
  const regRx = await pub.waitForTransactionReceipt({ hash: regHash });
  console.log('Service registered, block:', regRx.blockNumber);

  fs.mkdirSync('proof', { recursive: true });
  fs.writeFileSync('proof/gasless-deploy.json', JSON.stringify({
    deployer: account.address, contractAddress: addr,
    deployTxHash: hash, deployBlock: Number(receipt.blockNumber),
    actionTxHash: regHash, actionBlock: Number(regRx.blockNumber),
    gasUsed: Number(receipt.gasUsed + regRx.gasUsed), effectiveGasPrice: 0,
    explorerUrl: `https://sepoliascan.status.network/address/${addr}`,
    network: 'Status Network Sepolia', chainId: 1660990954,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log('Proof saved to proof/gasless-deploy.json');
}

main().catch(e => { console.error(e.message); process.exit(1); });
