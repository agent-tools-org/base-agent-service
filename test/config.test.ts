import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  baseSepolia,
  registryAbi,
  registryBytecode,
  getRegistryAddress,
  getPrivateKey,
} from "../src/config.js";

describe("baseSepolia chain config", () => {
  it("has chain ID 84532", () => {
    expect(baseSepolia.id).toBe(84532);
  });

  it("has name 'Base Sepolia'", () => {
    expect(baseSepolia.name).toBe("Base Sepolia");
  });

  it("uses ETH as native currency", () => {
    expect(baseSepolia.nativeCurrency).toEqual({
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    });
  });

  it("has a default RPC URL", () => {
    const urls = baseSepolia.rpcUrls.default.http;
    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toContain("base.org");
  });

  it("is marked as testnet", () => {
    expect(baseSepolia.testnet).toBe(true);
  });

  it("has a block explorer URL", () => {
    expect(baseSepolia.blockExplorers?.default.url).toBe(
      "https://sepolia.basescan.org"
    );
  });
});

describe("registryAbi", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(registryAbi)).toBe(true);
    expect(registryAbi.length).toBeGreaterThan(0);
  });

  it("contains registerService function", () => {
    const fn = registryAbi.find(
      (e) => e.type === "function" && e.name === "registerService"
    );
    expect(fn).toBeDefined();
  });

  it("contains getService view function", () => {
    const fn = registryAbi.find(
      (e) => e.type === "function" && e.name === "getService"
    );
    expect(fn).toBeDefined();
    expect((fn as any).stateMutability).toBe("view");
  });

  it("contains discoverServices view function", () => {
    const fn = registryAbi.find(
      (e) => e.type === "function" && e.name === "discoverServices"
    );
    expect(fn).toBeDefined();
  });

  it("contains ServiceRegistered event", () => {
    const ev = registryAbi.find(
      (e) => e.type === "event" && e.name === "ServiceRegistered"
    );
    expect(ev).toBeDefined();
  });

  it("contains ServiceDeactivated event", () => {
    const ev = registryAbi.find(
      (e) => e.type === "event" && e.name === "ServiceDeactivated"
    );
    expect(ev).toBeDefined();
  });
});

describe("registryBytecode", () => {
  it("starts with 0x", () => {
    expect(registryBytecode.startsWith("0x")).toBe(true);
  });
});

describe("getRegistryAddress", () => {
  const original = process.env.REGISTRY_ADDRESS;

  afterEach(() => {
    if (original !== undefined) {
      process.env.REGISTRY_ADDRESS = original;
    } else {
      delete process.env.REGISTRY_ADDRESS;
    }
  });

  it("returns the address from env", () => {
    process.env.REGISTRY_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
    expect(getRegistryAddress()).toBe(
      "0x1234567890abcdef1234567890abcdef12345678"
    );
  });

  it("throws when REGISTRY_ADDRESS is not set", () => {
    delete process.env.REGISTRY_ADDRESS;
    expect(() => getRegistryAddress()).toThrow("REGISTRY_ADDRESS not set");
  });
});

describe("getPrivateKey", () => {
  const original = process.env.PRIVATE_KEY;

  afterEach(() => {
    if (original !== undefined) {
      process.env.PRIVATE_KEY = original;
    } else {
      delete process.env.PRIVATE_KEY;
    }
  });

  it("returns key with 0x prefix when already prefixed", () => {
    process.env.PRIVATE_KEY = "0xabc123";
    expect(getPrivateKey()).toBe("0xabc123");
  });

  it("adds 0x prefix when missing", () => {
    process.env.PRIVATE_KEY = "abc123";
    expect(getPrivateKey()).toBe("0xabc123");
  });

  it("throws when PRIVATE_KEY is not set", () => {
    delete process.env.PRIVATE_KEY;
    expect(() => getPrivateKey()).toThrow("PRIVATE_KEY not set");
  });
});
