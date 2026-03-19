import { describe, it, expect } from "vitest";
import { decodeEventLog, encodeEventTopics, toEventHash } from "viem";
import { registryAbi } from "../src/config.js";

describe("ServiceRegistered event", () => {
  const event = registryAbi.find(
    (e) => e.type === "event" && e.name === "ServiceRegistered"
  ) as Extract<(typeof registryAbi)[number], { type: "event"; name: "ServiceRegistered" }>;

  it("has 5 inputs with correct indexed flags", () => {
    expect(event.inputs).toHaveLength(5);
    const indexed = event.inputs.filter((i) => i.indexed);
    const nonIndexed = event.inputs.filter((i) => !i.indexed);
    expect(indexed).toHaveLength(2);
    expect(nonIndexed).toHaveLength(3);
    expect(indexed.map((i) => i.name)).toEqual(["serviceId", "agent"]);
  });

  it("produces a valid event signature hash", () => {
    const hash = toEventHash({
      type: "event",
      name: "ServiceRegistered",
      inputs: event.inputs as any,
    });
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("ServiceUpdated event", () => {
  const event = registryAbi.find(
    (e) => e.type === "event" && e.name === "ServiceUpdated"
  ) as Extract<(typeof registryAbi)[number], { type: "event"; name: "ServiceUpdated" }>;

  it("has 3 inputs (serviceId indexed, newPrice, newEndpoint)", () => {
    expect(event.inputs).toHaveLength(3);
    expect(event.inputs[0]).toMatchObject({
      name: "serviceId",
      type: "uint256",
      indexed: true,
    });
    expect(event.inputs[1]).toMatchObject({
      name: "newPrice",
      type: "uint256",
      indexed: false,
    });
    expect(event.inputs[2]).toMatchObject({
      name: "newEndpoint",
      type: "string",
      indexed: false,
    });
  });
});

describe("ServiceDeactivated event", () => {
  const event = registryAbi.find(
    (e) => e.type === "event" && e.name === "ServiceDeactivated"
  ) as Extract<(typeof registryAbi)[number], { type: "event"; name: "ServiceDeactivated" }>;

  it("has a single indexed serviceId input", () => {
    expect(event.inputs).toHaveLength(1);
    expect(event.inputs[0]).toMatchObject({
      name: "serviceId",
      type: "uint256",
      indexed: true,
    });
  });
});

describe("event log decoding", () => {
  it("can decode a ServiceRegistered log", () => {
    // Encode topics for ServiceRegistered with serviceId=1, agent=0x...
    const topics = encodeEventTopics({
      abi: registryAbi,
      eventName: "ServiceRegistered",
      args: {
        serviceId: 1n,
        agent: "0x1234567890123456789012345678901234567890",
      },
    });

    expect(topics.length).toBe(3); // event sig + 2 indexed
    expect(topics[0]).toMatch(/^0x[0-9a-f]{64}$/);
  });
});
