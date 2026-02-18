/**
 * Pure validation functions for input parameters.
 * Each function accepts `unknown` input, returns validated typed output or
 * undefined for optional fields, and throws descriptive errors for invalid input.
 * No side effects; no imports from other project modules.
 */

/**
 * Validates an ISO 8601 UTC date string (e.g. "2024-01-15T00:00:00Z").
 * Returns undefined if value is absent (dates are optional).
 */
export function validateDate(value: unknown, paramName: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`${paramName} must be a string`);
  }
  const iso8601UtcPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  if (!iso8601UtcPattern.test(value)) {
    throw new Error(
      `Invalid ${paramName}: must be ISO 8601 format with UTC indicator (e.g., 2024-01-15T00:00:00Z)`
    );
  }
  // Verify the date actually represents a valid calendar date (e.g. reject 2024-13-01)
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    throw new Error(
      `Invalid ${paramName}: must be ISO 8601 format with UTC indicator (e.g., 2024-01-15T00:00:00Z)`
    );
  }
  return value;
}

/**
 * Validates an MPAN (Meter Point Administration Number): exactly 13 digits.
 * Returns undefined if value is absent (falls back to config).
 */
export function validateMpan(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error("MPAN must be a string");
  }
  if (!/^\d{13}$/.test(value)) {
    throw new Error(`Invalid MPAN: must be exactly 13 digits (got: '${value}')`);
  }
  return value;
}

/**
 * Validates an MPRN (Meter Point Reference Number): exactly 10 digits.
 * Returns undefined if value is absent (falls back to config).
 */
export function validateMprn(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error("MPRN must be a string");
  }
  if (!/^\d{10}$/.test(value)) {
    throw new Error(`Invalid MPRN: must be exactly 10 digits (got: '${value}')`);
  }
  return value;
}

/**
 * Validates page_size: a whole number between 1 and 25000 inclusive.
 * Returns undefined if value is absent (API uses its default).
 */
export function validatePageSize(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error("page_size must be a number");
  }
  if (!Number.isInteger(value)) {
    throw new Error(`page_size must be a whole number (got: ${value})`);
  }
  if (value < 1 || value > 25000) {
    throw new Error(`page_size must be between 1 and 25000 (got: ${value})`);
  }
  return value;
}

/**
 * Extracts an optional string parameter safely (no `as` cast).
 * Returns undefined if value is absent.
 */
export function extractString(value: unknown, paramName: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`${paramName} must be a string`);
  }
  return value;
}

/**
 * Extracts and validates the group_by parameter.
 * Returns undefined if value is absent.
 */
export function extractGroupBy(value: unknown): "day" | "week" | "month" | "quarter" | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error("group_by must be a string");
  }
  const allowed = ["day", "week", "month", "quarter"] as const;
  if (!allowed.includes(value as (typeof allowed)[number])) {
    throw new Error(`group_by must be one of: day, week, month, quarter (got: '${value}')`);
  }
  return value as "day" | "week" | "month" | "quarter";
}
