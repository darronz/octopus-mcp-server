import { describe, it, expect } from "vitest";
import {
  validateDate,
  validateMpan,
  validateMprn,
  validatePageSize,
  extractString,
  extractGroupBy,
} from "./validation.js";

// ---------------------------------------------------------------------------
// validateDate
// ---------------------------------------------------------------------------

describe("validateDate", () => {
  it("returns undefined for undefined", () => {
    expect(validateDate(undefined, "period_from")).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(validateDate(null, "period_from")).toBeUndefined();
  });

  it("returns the string for a valid ISO 8601 UTC date", () => {
    expect(validateDate("2024-01-15T00:00:00Z", "period_from")).toBe(
      "2024-01-15T00:00:00Z"
    );
  });

  it("returns the string for another valid UTC date using period_to", () => {
    expect(validateDate("2024-12-31T23:59:59Z", "period_to")).toBe(
      "2024-12-31T23:59:59Z"
    );
  });

  it("throws for non-string input: number", () => {
    expect(() => validateDate(20240115, "period_from")).toThrow("period_from");
  });

  it("throws for non-string input: boolean", () => {
    expect(() => validateDate(true, "period_to")).toThrow("period_to");
  });

  it("throws for date without time component", () => {
    expect(() => validateDate("2024-01-15", "period_from")).toThrow(
      "period_from"
    );
  });

  it("throws for date without UTC Z indicator", () => {
    expect(() => validateDate("2024-01-15T00:00:00", "period_from")).toThrow(
      "period_from"
    );
  });

  it("throws for date with offset instead of Z", () => {
    expect(() =>
      validateDate("2024-01-15T00:00:00+01:00", "period_from")
    ).toThrow("period_from");
  });

  it("throws for invalid calendar date: month 13", () => {
    expect(() => validateDate("2024-13-01T00:00:00Z", "period_from")).toThrow(
      "period_from"
    );
  });

  it("throws for invalid calendar date: Feb 30", () => {
    expect(() => validateDate("2024-02-30T00:00:00Z", "period_from")).toThrow(
      "period_from"
    );
  });

  it("includes paramName 'period_from' in error message", () => {
    expect(() => validateDate("bad-date", "period_from")).toThrow("period_from");
  });

  it("includes paramName 'period_to' in error message", () => {
    expect(() => validateDate("bad-date", "period_to")).toThrow("period_to");
  });
});

// ---------------------------------------------------------------------------
// validateMpan
// ---------------------------------------------------------------------------

describe("validateMpan", () => {
  it("returns undefined for undefined", () => {
    expect(validateMpan(undefined)).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(validateMpan(null)).toBeUndefined();
  });

  it("returns the string for a valid 13-digit MPAN", () => {
    expect(validateMpan("1234567890123")).toBe("1234567890123");
  });

  it("throws for non-string input: number", () => {
    expect(() => validateMpan(1234567890123)).toThrow();
  });

  it("throws for 12-digit MPAN (too short)", () => {
    expect(() => validateMpan("123456789012")).toThrow("1234567890");
  });

  it("throws for 14-digit MPAN (too long)", () => {
    expect(() => validateMpan("12345678901234")).toThrow("1234567890");
  });

  it("throws for MPAN with non-digit characters", () => {
    expect(() => validateMpan("123456789012a")).toThrow("123456789012a");
  });

  it("error message includes the invalid value", () => {
    expect(() => validateMpan("bad-mpan")).toThrow("bad-mpan");
  });
});

// ---------------------------------------------------------------------------
// validateMprn
// ---------------------------------------------------------------------------

describe("validateMprn", () => {
  it("returns undefined for undefined", () => {
    expect(validateMprn(undefined)).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(validateMprn(null)).toBeUndefined();
  });

  it("returns the string for a valid 10-digit MPRN", () => {
    expect(validateMprn("1234567890")).toBe("1234567890");
  });

  it("throws for non-string input: number", () => {
    expect(() => validateMprn(1234567890)).toThrow();
  });

  it("throws for 9-digit MPRN (too short)", () => {
    expect(() => validateMprn("123456789")).toThrow("123456789");
  });

  it("throws for 11-digit MPRN (too long)", () => {
    expect(() => validateMprn("12345678901")).toThrow("12345678901");
  });

  it("throws for MPRN with non-digit characters", () => {
    expect(() => validateMprn("123456789a")).toThrow("123456789a");
  });

  it("error message includes the invalid value", () => {
    expect(() => validateMprn("bad-mprn")).toThrow("bad-mprn");
  });
});

// ---------------------------------------------------------------------------
// validatePageSize
// ---------------------------------------------------------------------------

describe("validatePageSize", () => {
  it("returns undefined for undefined", () => {
    expect(validatePageSize(undefined)).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(validatePageSize(null)).toBeUndefined();
  });

  it("returns 1 (minimum boundary)", () => {
    expect(validatePageSize(1)).toBe(1);
  });

  it("returns 100 (typical value)", () => {
    expect(validatePageSize(100)).toBe(100);
  });

  it("returns 25000 (maximum boundary)", () => {
    expect(validatePageSize(25000)).toBe(25000);
  });

  it("throws for non-number input: string '100'", () => {
    expect(() => validatePageSize("100")).toThrow("number");
  });

  it("throws for NaN", () => {
    expect(() => validatePageSize(NaN)).toThrow("number");
  });

  it("throws for non-integer: 1.5", () => {
    expect(() => validatePageSize(1.5)).toThrow("whole number");
  });

  it("throws for 0 (below minimum)", () => {
    expect(() => validatePageSize(0)).toThrow("between 1 and 25000");
  });

  it("throws for -1 (negative)", () => {
    expect(() => validatePageSize(-1)).toThrow("between 1 and 25000");
  });

  it("throws for 25001 (above maximum)", () => {
    expect(() => validatePageSize(25001)).toThrow("between 1 and 25000");
  });

  it("error for non-integer is distinct from out-of-range", () => {
    expect(() => validatePageSize(1.5)).toThrow("whole number");
    expect(() => validatePageSize(0)).toThrow("between 1 and 25000");
  });
});

// ---------------------------------------------------------------------------
// extractString
// ---------------------------------------------------------------------------

describe("extractString", () => {
  it("returns undefined for undefined", () => {
    expect(extractString(undefined, "order_by")).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(extractString(null, "order_by")).toBeUndefined();
  });

  it("returns the string for valid string input", () => {
    expect(extractString("forward", "order_by")).toBe("forward");
  });

  it("throws for non-string input: number", () => {
    expect(() => extractString(42, "order_by")).toThrow("order_by");
  });

  it("throws for non-string input: boolean", () => {
    expect(() => extractString(false, "order_by")).toThrow("order_by");
  });

  it("error message includes paramName", () => {
    expect(() => extractString(99, "serial_number")).toThrow("serial_number");
  });
});

// ---------------------------------------------------------------------------
// extractGroupBy
// ---------------------------------------------------------------------------

describe("extractGroupBy", () => {
  it("returns undefined for undefined", () => {
    expect(extractGroupBy(undefined)).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(extractGroupBy(null)).toBeUndefined();
  });

  it("returns 'day' for valid value", () => {
    expect(extractGroupBy("day")).toBe("day");
  });

  it("returns 'week' for valid value", () => {
    expect(extractGroupBy("week")).toBe("week");
  });

  it("returns 'month' for valid value", () => {
    expect(extractGroupBy("month")).toBe("month");
  });

  it("returns 'quarter' for valid value", () => {
    expect(extractGroupBy("quarter")).toBe("quarter");
  });

  it("throws for non-string input: number", () => {
    expect(() => extractGroupBy(7)).toThrow("string");
  });

  it("throws for invalid string: 'year'", () => {
    expect(() => extractGroupBy("year")).toThrow("year");
  });

  it("throws for invalid string: 'hour'", () => {
    expect(() => extractGroupBy("hour")).toThrow("hour");
  });

  it("throws for empty string", () => {
    expect(() => extractGroupBy("")).toThrow();
  });

  it("error message lists the allowed values", () => {
    expect(() => extractGroupBy("year")).toThrow("day, week, month, quarter");
  });
});
