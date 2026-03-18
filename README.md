# Agent Service Registry

> **Hackathon Track:** Agent Services on Base

On-chain registry for agent services on Base. Agents register discoverable services with metadata (name, description, price, endpoint). Clients browse the registry, discover services, and invoke them — with payments via x402.

## Architecture

```
┌──────────┐     registerService()     ┌─────────────────────────┐
│  Agent   │ ──────────────────────►   │  AgentServiceRegistry   │
│  (provider) │                        │  (Base Sepolia)         │
└──────────┘                           │                         │
                                       │  • services mapping     │
┌──────────┐     discoverServices()    │  • active list          │
│  Client  │ ◄─────────────────────    │  • events               │
│  (consumer) │                        └─────────────────────────┘
└──────────┘
      │
      │  POST /api/analyze  (x402 payment header)
      ▼
┌──────────┐
│  Agent   │  ← processes request, returns result
│  Endpoint│
└──────────┘
```

## Project Structure

```
contracts/
  AgentServiceRegistry.sol   — Solidity registry contract
src/
  config.ts                  — Chain config, ABI, helpers
  deploy.ts                  — Deploy script
  client.ts                  — Service discovery & invocation client
  agent/
    service-agent.ts         — Agent that registers & serves requests
proof/                       — Proof artifacts
```

## Quick Start

```bash
# Install dependencies
npm install

# Set environment
cp .env.example .env
# Edit .env — add your PRIVATE_KEY

# Deploy the registry contract
npm run deploy
# Copy the printed REGISTRY_ADDRESS into .env

# Run the agent (registers a service + processes sample requests)
npm run agent

# Run the client (discovers services + simulates invocation)
npm run client
```

## Smart Contract

**AgentServiceRegistry** — deployed on Base Sepolia (chain ID 84532).

| Function | Description |
|---|---|
| `registerService(name, description, priceWei, endpoint)` | Register a new agent service |
| `updateService(serviceId, newPrice, newEndpoint)` | Update price and endpoint |
| `deactivateService(serviceId)` | Deactivate a service |
| `getService(serviceId)` | Get service details |
| `getAgentServices(agent)` | List services by agent address |
| `discoverServices(offset, limit)` | Paginated browse of active services |

Events: `ServiceRegistered`, `ServiceUpdated`, `ServiceDeactivated`

## x402 Payment Flow

The registry stores a `priceWei` per service. Clients include an x402 payment header when calling the agent's endpoint, enabling permissionless agent-to-agent commerce on Base.

## Tech Stack

- **Solidity ^0.8.24** — Smart contract
- **TypeScript** — Agent and client scripts
- **viem** — Ethereum interactions on Base Sepolia
- **Base Sepolia** — Testnet (chain ID 84532)
