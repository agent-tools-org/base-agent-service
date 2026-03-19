import { describe, it, expect } from "vitest";
import { parseEther, formatEther, encodeFunctionData } from "viem";
import { registryAbi } from "../src/config.js";

describe("payment handling", () => {
  it("parseEther and formatEther roundtrip for service price", () => {
    const priceEth = "0.0001";
    const priceWei = parseEther(priceEth);
    expect(formatEther(priceWei)).toBe(priceEth);
  });

  it("handles zero price in wei", () => {
    const priceWei = 0n;
    expect(formatEther(priceWei)).toBe("0");
  });

  it("handles 1 wei (smallest unit)", () => {
    const priceWei = 1n;
    expect(formatEther(priceWei)).toBe("0.000000000000000001");
  });

  it("handles a large price (1000 ETH)", () => {
    const priceWei = parseEther("1000");
    expect(priceWei).toBe(1000n * 10n ** 18n);
    expect(formatEther(priceWei)).toBe("1000");
  });

  it("encodes updateService with new price correctly", () => {
    const newPrice = parseEther("0.005");
    const data = encodeFunctionData({
      abi: registryAbi,
      functionName: "updateService",
      args: [0n, newPrice, "https://new-endpoint.example.com/api"],
    });
    expect(data).toMatch(/^0x/);
    expect(data.length).toBeGreaterThan(10);
  });
});
