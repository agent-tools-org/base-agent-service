import { describe, it, expect } from "vitest";
import { registryAbi } from "../src/config.js";

describe("discoverServices ABI", () => {
  const discoverFn = registryAbi.find(
    (e) => e.type === "function" && e.name === "discoverServices"
  ) as Extract<(typeof registryAbi)[number], { type: "function"; name: "discoverServices" }>;

  it("has offset and limit parameters of type uint256", () => {
    expect(discoverFn.inputs).toHaveLength(2);
    expect(discoverFn.inputs[0]).toMatchObject({ name: "offset", type: "uint256" });
    expect(discoverFn.inputs[1]).toMatchObject({ name: "limit", type: "uint256" });
  });

  it("returns a tuple array matching the Service struct", () => {
    expect(discoverFn.outputs).toHaveLength(1);
    const output = discoverFn.outputs![0];
    expect(output.type).toBe("tuple[]");
    // AbiParameter includes optional `components` for tuple types
    const components = output.components;
    expect(components).toBeDefined();
    const fieldNames = components!.map((c) => c.name);
    expect(fieldNames).toEqual([
      "id",
      "agent",
      "name",
      "description",
      "priceWei",
      "endpoint",
      "active",
      "timestamp",
    ]);
  });
});

describe("getAgentServices ABI", () => {
  const fn = registryAbi.find(
    (e) => e.type === "function" && e.name === "getAgentServices"
  ) as Extract<(typeof registryAbi)[number], { type: "function"; name: "getAgentServices" }>;

  it("takes an address and returns uint256 array", () => {
    expect(fn.inputs).toHaveLength(1);
    expect(fn.inputs[0].type).toBe("address");
    expect(fn.outputs).toHaveLength(1);
    expect(fn.outputs![0].type).toBe("uint256[]");
  });
});

describe("activeServiceCount ABI", () => {
  const fn = registryAbi.find(
    (e) => e.type === "function" && e.name === "activeServiceCount"
  ) as Extract<(typeof registryAbi)[number], { type: "function"; name: "activeServiceCount" }>;

  it("has no inputs and returns uint256", () => {
    expect(fn.inputs).toHaveLength(0);
    expect(fn.outputs).toHaveLength(1);
    expect(fn.outputs![0].type).toBe("uint256");
  });
});

describe("nextServiceId ABI", () => {
  const fn = registryAbi.find(
    (e) => e.type === "function" && e.name === "nextServiceId"
  ) as Extract<(typeof registryAbi)[number], { type: "function"; name: "nextServiceId" }>;

  it("has no inputs and returns uint256", () => {
    expect(fn.inputs).toHaveLength(0);
    expect(fn.outputs).toHaveLength(1);
    expect(fn.outputs![0].type).toBe("uint256");
  });
});
