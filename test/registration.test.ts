import { describe, it, expect } from "vitest";
import { encodeFunctionData } from "viem";
import { registryAbi } from "../src/config.js";

describe("registerService ABI validation", () => {
  const registerFn = registryAbi.find(
    (e) => e.type === "function" && e.name === "registerService"
  ) as Extract<(typeof registryAbi)[number], { type: "function"; name: "registerService" }>;

  it("has exactly 4 input parameters", () => {
    expect(registerFn.inputs).toHaveLength(4);
  });

  it("has inputs with correct names and types", () => {
    const names = registerFn.inputs.map((i) => i.name);
    const types = registerFn.inputs.map((i) => i.type);
    expect(names).toEqual(["name", "description", "priceWei", "endpoint"]);
    expect(types).toEqual(["string", "string", "uint256", "string"]);
  });

  it("returns a serviceId of type uint256", () => {
    expect(registerFn.outputs).toHaveLength(1);
    expect(registerFn.outputs![0].type).toBe("uint256");
    expect(registerFn.outputs![0].name).toBe("serviceId");
  });

  it("can encode a call with empty name", () => {
    const data = encodeFunctionData({
      abi: registryAbi,
      functionName: "registerService",
      args: ["", "description", 1000n, "https://example.com/api"],
    });
    expect(data).toMatch(/^0x/);
    expect(data.length).toBeGreaterThan(10);
  });

  it("can encode a call with zero price", () => {
    const data = encodeFunctionData({
      abi: registryAbi,
      functionName: "registerService",
      args: ["Test Service", "desc", 0n, "https://example.com/api"],
    });
    expect(data).toMatch(/^0x/);
  });

  it("can encode a call with very large price", () => {
    const largePrice = 10n ** 30n; // far beyond typical ETH values
    const data = encodeFunctionData({
      abi: registryAbi,
      functionName: "registerService",
      args: ["Expensive", "desc", largePrice, "https://example.com"],
    });
    expect(data).toMatch(/^0x/);
  });
});

describe("updateService ABI validation", () => {
  const updateFn = registryAbi.find(
    (e) => e.type === "function" && e.name === "updateService"
  ) as Extract<(typeof registryAbi)[number], { type: "function"; name: "updateService" }>;

  it("has inputs: serviceId, newPrice, newEndpoint", () => {
    const names = updateFn.inputs.map((i) => i.name);
    expect(names).toEqual(["serviceId", "newPrice", "newEndpoint"]);
  });

  it("has no outputs (void)", () => {
    expect(updateFn.outputs).toHaveLength(0);
  });
});

describe("deactivateService ABI validation", () => {
  const deactivateFn = registryAbi.find(
    (e) => e.type === "function" && e.name === "deactivateService"
  ) as Extract<(typeof registryAbi)[number], { type: "function"; name: "deactivateService" }>;

  it("takes a single uint256 serviceId", () => {
    expect(deactivateFn.inputs).toHaveLength(1);
    expect(deactivateFn.inputs[0].name).toBe("serviceId");
    expect(deactivateFn.inputs[0].type).toBe("uint256");
  });
});
