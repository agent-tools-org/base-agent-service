/**
 * Input validation for service registration parameters.
 *
 * These validations should be performed client-side before submitting
 * transactions to avoid wasting gas on invalid inputs.
 */

/** Maximum allowed service name length (characters). */
const MAX_NAME_LENGTH = 256;

/** Maximum allowed endpoint URL length (characters). */
const MAX_ENDPOINT_LENGTH = 2048;

/** Maximum reasonable price in wei (10,000 ETH). */
const MAX_PRICE_WEI = 10_000n * 10n ** 18n;

/**
 * Error thrown when service registration input fails validation.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate a service name: must be non-empty and within length limits.
 */
export function validateServiceName(name: string): void {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("Service name must not be empty");
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new ValidationError(
      `Service name exceeds maximum length of ${MAX_NAME_LENGTH} characters`
    );
  }
}

/**
 * Validate a service price in wei: must be non-negative and within
 * a reasonable upper bound.
 */
export function validateServicePrice(priceWei: bigint): void {
  if (priceWei < 0n) {
    throw new ValidationError("Service price must not be negative");
  }
  if (priceWei > MAX_PRICE_WEI) {
    throw new ValidationError(
      "Service price exceeds maximum allowed value (10,000 ETH)"
    );
  }
}

/**
 * Validate a service endpoint URL: must be non-empty, a valid URL,
 * and use http or https protocol.
 */
export function validateEndpointUrl(endpoint: string): void {
  const trimmed = endpoint.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("Service endpoint must not be empty");
  }
  if (trimmed.length > MAX_ENDPOINT_LENGTH) {
    throw new ValidationError(
      `Service endpoint exceeds maximum length of ${MAX_ENDPOINT_LENGTH} characters`
    );
  }
  // Reject whitespace inside the endpoint string. `new URL()` may
  // auto-encode spaces, but for service endpoints we want a strict format.
  if (/\s/.test(trimmed)) {
    throw new ValidationError(`Service endpoint is not a valid URL: ${endpoint}`);
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new ValidationError(
      `Service endpoint is not a valid URL: ${endpoint}`
    );
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ValidationError(
      `Service endpoint must use http or https protocol, got: ${url.protocol}`
    );
  }
}

/**
 * Validate all parameters for service registration.
 *
 * @throws {ValidationError} if any parameter is invalid.
 */
export function validateServiceRegistration(params: {
  name: string;
  description: string;
  priceWei: bigint;
  endpoint: string;
}): void {
  validateServiceName(params.name);
  validateServicePrice(params.priceWei);
  validateEndpointUrl(params.endpoint);
}
