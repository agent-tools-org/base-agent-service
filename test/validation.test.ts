import { describe, it, expect } from "vitest";
import {
  ValidationError,
  validateServiceName,
  validateServicePrice,
  validateEndpointUrl,
  validateServiceRegistration,
} from "../src/validation.js";

describe("validateServiceName", () => {
  it("accepts a valid name", () => {
    expect(() => validateServiceName("Data Analysis")).not.toThrow();
  });

  it("accepts a name with surrounding whitespace", () => {
    expect(() => validateServiceName("  Data Analysis  ")).not.toThrow();
  });

  it("rejects an empty string", () => {
    expect(() => validateServiceName("")).toThrow(ValidationError);
    expect(() => validateServiceName("")).toThrow("must not be empty");
  });

  it("rejects a whitespace-only string", () => {
    expect(() => validateServiceName("   ")).toThrow(ValidationError);
    expect(() => validateServiceName("   ")).toThrow("must not be empty");
  });

  it("rejects a name exceeding 256 characters", () => {
    const longName = "A".repeat(257);
    expect(() => validateServiceName(longName)).toThrow(ValidationError);
    expect(() => validateServiceName(longName)).toThrow("exceeds maximum length");
  });

  it("accepts a name exactly at 256 characters", () => {
    const maxName = "A".repeat(256);
    expect(() => validateServiceName(maxName)).not.toThrow();
  });
});

describe("validateServicePrice", () => {
  it("accepts zero price (free service)", () => {
    expect(() => validateServicePrice(0n)).not.toThrow();
  });

  it("accepts a normal price", () => {
    expect(() => validateServicePrice(100000000000000n)).not.toThrow();
  });

  it("rejects a negative price", () => {
    expect(() => validateServicePrice(-1n)).toThrow(ValidationError);
    expect(() => validateServicePrice(-1n)).toThrow("must not be negative");
  });

  it("rejects a price exceeding 10,000 ETH", () => {
    const tooExpensive = 10_001n * 10n ** 18n;
    expect(() => validateServicePrice(tooExpensive)).toThrow(ValidationError);
    expect(() => validateServicePrice(tooExpensive)).toThrow("exceeds maximum");
  });

  it("accepts exactly 10,000 ETH", () => {
    const maxPrice = 10_000n * 10n ** 18n;
    expect(() => validateServicePrice(maxPrice)).not.toThrow();
  });
});

describe("validateEndpointUrl", () => {
  it("accepts a valid HTTPS URL", () => {
    expect(() => validateEndpointUrl("https://agent.example.com/api")).not.toThrow();
  });

  it("accepts a URL with surrounding whitespace", () => {
    expect(() =>
      validateEndpointUrl("  https://agent.example.com/api/analyze  ")
    ).not.toThrow();
  });

  it("accepts an uppercase scheme", () => {
    expect(() => validateEndpointUrl("HTTPS://agent.example.com/api")).not.toThrow();
  });

  it("accepts a valid HTTP URL", () => {
    expect(() => validateEndpointUrl("http://localhost:3000/api")).not.toThrow();
  });

  it("rejects an empty string", () => {
    expect(() => validateEndpointUrl("")).toThrow(ValidationError);
    expect(() => validateEndpointUrl("")).toThrow("must not be empty");
  });

  it("rejects a whitespace-only string", () => {
    expect(() => validateEndpointUrl("   ")).toThrow(ValidationError);
    expect(() => validateEndpointUrl("   ")).toThrow("must not be empty");
  });

  it("rejects a non-URL string", () => {
    expect(() => validateEndpointUrl("not-a-url")).toThrow(ValidationError);
    expect(() => validateEndpointUrl("not-a-url")).toThrow("not a valid URL");
  });

  it("rejects a URL with ftp protocol", () => {
    expect(() => validateEndpointUrl("ftp://files.example.com/data")).toThrow(ValidationError);
    expect(() => validateEndpointUrl("ftp://files.example.com/data")).toThrow("http or https");
  });

  it("rejects a javascript protocol", () => {
    expect(() => validateEndpointUrl("javascript:alert(1)")).toThrow(ValidationError);
    expect(() => validateEndpointUrl("javascript:alert(1)")).toThrow(
      "http or https"
    );
  });

  it("rejects a URL exceeding 2048 characters", () => {
    const longUrl = "https://example.com/" + "a".repeat(2030);
    expect(() => validateEndpointUrl(longUrl)).toThrow(ValidationError);
    expect(() => validateEndpointUrl(longUrl)).toThrow("exceeds maximum length");
  });

  it("rejects URLs containing spaces in the URL string", () => {
    expect(() => validateEndpointUrl("https://example.com/a b")).toThrow(
      ValidationError
    );
    expect(() => validateEndpointUrl("https://example.com/a b")).toThrow(
      "not a valid URL"
    );
  });

  it("accepts a URL with path and query parameters", () => {
    expect(() =>
      validateEndpointUrl("https://api.example.com/v1/analyze?format=json")
    ).not.toThrow();
  });
});

describe("validateServiceRegistration", () => {
  const validParams = {
    name: "Data Analysis",
    description: "Analyze numeric datasets",
    priceWei: 100000000000000n,
    endpoint: "https://agent.example.com/api/analyze",
  };

  it("accepts valid registration parameters", () => {
    expect(() => validateServiceRegistration(validParams)).not.toThrow();
  });

  it("rejects when name is empty", () => {
    expect(() =>
      validateServiceRegistration({ ...validParams, name: "" })
    ).toThrow("must not be empty");
  });

  it("rejects when price is negative", () => {
    expect(() =>
      validateServiceRegistration({ ...validParams, priceWei: -1n })
    ).toThrow("must not be negative");
  });

  it("rejects when endpoint is not a valid URL", () => {
    expect(() =>
      validateServiceRegistration({ ...validParams, endpoint: "bad" })
    ).toThrow("not a valid URL");
  });

  it("accepts an empty description (description is not validated)", () => {
    expect(() =>
      validateServiceRegistration({ ...validParams, description: "" })
    ).not.toThrow();
  });

  it("accepts whitespace-padded name and endpoint", () => {
    expect(() =>
      validateServiceRegistration({
        ...validParams,
        name: "  Data Analysis  ",
        endpoint: "  https://agent.example.com/api/analyze  ",
      })
    ).not.toThrow();
  });

  it("rejects javascript protocol endpoints", () => {
    expect(() =>
      validateServiceRegistration({
        ...validParams,
        endpoint: "javascript:alert(1)",
      })
    ).toThrow("http or https");
  });

  it("rejects endpoints containing spaces", () => {
    expect(() =>
      validateServiceRegistration({
        ...validParams,
        endpoint: "https://example.com/a b",
      })
    ).toThrow("not a valid URL");
  });
});
