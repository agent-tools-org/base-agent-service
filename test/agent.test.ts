import { describe, it, expect } from "vitest";
import { performDataAnalysis } from "../src/agent/analysis.js";

describe("performDataAnalysis", () => {
  it("computes correct stats for a normal dataset", () => {
    const result = performDataAnalysis({ dataset: [10, 20, 30, 40, 50] });
    expect(result.count).toBe(5);
    expect(result.sum).toBe(150);
    expect(result.mean).toBe(30);
    expect(result.min).toBe(10);
    expect(result.max).toBe(50);
    expect(result.stddev).toBeCloseTo(14.142, 2);
  });

  it("returns all zeros for an empty dataset", () => {
    const result = performDataAnalysis({ dataset: [] });
    expect(result).toEqual({
      count: 0,
      sum: 0,
      mean: 0,
      min: 0,
      max: 0,
      stddev: 0,
    });
  });

  it("handles a single-element dataset", () => {
    const result = performDataAnalysis({ dataset: [42] });
    expect(result.count).toBe(1);
    expect(result.sum).toBe(42);
    expect(result.mean).toBe(42);
    expect(result.min).toBe(42);
    expect(result.max).toBe(42);
    expect(result.stddev).toBe(0);
  });

  it("returns zero stddev for identical values", () => {
    const result = performDataAnalysis({ dataset: [7, 7, 7, 7] });
    expect(result.mean).toBe(7);
    expect(result.stddev).toBe(0);
  });

  it("handles negative numbers", () => {
    const result = performDataAnalysis({ dataset: [-10, -5, 0, 5, 10] });
    expect(result.count).toBe(5);
    expect(result.sum).toBe(0);
    expect(result.mean).toBe(0);
    expect(result.min).toBe(-10);
    expect(result.max).toBe(10);
    expect(result.stddev).toBeGreaterThan(0);
  });
});
