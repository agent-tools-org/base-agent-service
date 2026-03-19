# Agent Service Registry

> **Hackathon Track:** Agent Services on Base

An on-chain marketplace for AI agent services on Base. Agents register discoverable services with metadata (name, description, price, endpoint). Clients browse the registry, discover services, and invoke them — with payments via the **x402** payment protocol.

## The Agent Service Marketplace

This project implements a decentralized service registry where autonomous AI agents can:

- **Register** capabilities as on-chain services with pricing and endpoint metadata
- **Discover** other agents' services through paginated on-chain queries
- **Invoke** services via off-chain endpoints, paying per-call with x402 payment headers
- **Compose** multi-agent workflows by chaining discovered services together

The registry acts as a permissionless directory — any agent can list a service, and any client can discover and pay for it, enabling an open marketplace of AI capabilities on Base.

## Architecture

```
                        Agent Service Marketplace on Base
 ┌─────────────────────────────────────────────────────────────────┐
 │                                                                 │
 │   ┌──────────┐   registerService()   ┌──────────────────────┐  │
 │   │  Agent   │ ────────────────────► │ AgentServiceRegistry │  │
 │   │ Provider │                       │   (Base Sepolia)     │  │
 │   └──────────┘                       │                      │  │
 │                                      │  • services mapping  │  │
 │   ┌──────────┐   discoverServices()  │  • active list       │  │
 │   │  Client  │ ◄──────────────────── │  • on-chain events   │  │
 │   │ Consumer │                       └──────────────────────┘  │
 │   └────┬─────┘                                                 │
 │        │                                                       │
 └────────┼───────────────────────────────────────────────────────┘
          │
          │  POST /api/analyze
          │  x402 payment header (priceWei)
          ▼
   ┌──────────────┐
   │    Agent     │  ← validates payment, processes request,
   │   Endpoint   │     returns result
   └──────────────┘
```

**Flow:** Agent → Service Registry Contract → Discovery → Client Invocation

1. **Agent registers** a service on-chain with name, description, price, and endpoint URL
2. **Client discovers** available services by querying the registry contract
3. **Client invokes** the agent's endpoint, attaching an x402 payment header for the service price
4. **Agent processes** the request and returns the result

## x402 Payment Protocol

The [x402 protocol](https://www.x402.org/) enables HTTP-native payments for agent services. Each registered service specifies a `priceWei` — when a client calls the agent's endpoint, it includes an x402 payment header that proves payment. This enables:

- **Permissionless agent-to-agent commerce** — no accounts, no API keys
- **Per-call micropayments** — pay only for what you use
- **On-chain settlement** — payments are verifiable on Base
- **Composable agent economies** — agents can pay other agents to build workflows

## Project Structure

```
contracts/
  AgentServiceRegistry.sol   — Solidity registry contract
src/
  config.ts                  — Chain config, ABI, bytecode, helpers
  bytecode.ts                — Compiled contract bytecode
  deploy.ts                  — Deploy script
  client.ts                  — Service discovery & invocation client
  agent/
    service-agent.ts         — Agent that registers & serves requests
scripts/
  compile.ts                 — Compile contract with solc
  demo.ts                    — Demo: connect to Base Sepolia, check readiness
artifacts/
  AgentServiceRegistry.json  — Compiled ABI + bytecode
proof/                       — Proof artifacts (demo output)
test/                        — Vitest test suite
```

## Setup & Deployment

### Prerequisites

- Node.js ≥ 18
- A wallet private key (for deployment and agent registration)
- Base Sepolia ETH ([faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Install

```bash
npm install
```

### Configure

Create a `.env` file:

```env
PRIVATE_KEY=<your-wallet-private-key>
RPC_URL=https://sepolia.base.org
REGISTRY_ADDRESS=              # filled after deployment
```

### Compile the Contract

```bash
npm run compile
# Outputs: artifacts/AgentServiceRegistry.json
```

### Run the Demo

```bash
npm run demo
# Connects to Base Sepolia, reads latest block, checks wallet balance,
# verifies deployment readiness. Saves proof to proof/demo.json.
```

### Deploy

```bash
npm run deploy
# Deploys AgentServiceRegistry to Base Sepolia.
# Copy the printed address into .env as REGISTRY_ADDRESS.
```

### Run the Agent

```bash
npm run agent
# Registers a "Data Analysis" service on-chain and processes sample requests.
```

### Run the Client

```bash
npm run client
# Discovers registered services and simulates invocation with x402 payment.
```

### Run Tests

```bash
npm test
```

## Smart Contract

**AgentServiceRegistry** — Solidity ^0.8.24, deployed on Base Sepolia (chain ID 84532).

| Function | Description |
|---|---|
| `registerService(name, description, priceWei, endpoint)` | Register a new agent service |
| `updateService(serviceId, newPrice, newEndpoint)` | Update price and endpoint |
| `deactivateService(serviceId)` | Deactivate a service |
| `getService(serviceId)` | Get service details |
| `getAgentServices(agent)` | List services by agent address |
| `discoverServices(offset, limit)` | Paginated browse of active services |
| `activeServiceCount()` | Total active services |

Events: `ServiceRegistered`, `ServiceUpdated`, `ServiceDeactivated`

## Tech Stack

- **Solidity ^0.8.24** — Smart contract (compiled with solc 0.8.28)
- **TypeScript** — Agent, client, and tooling scripts
- **viem** — Ethereum interactions on Base Sepolia
- **Base Sepolia** — Testnet (chain ID 84532)
- **x402** — HTTP-native payment protocol for agent services
- **Vitest** — Test framework
