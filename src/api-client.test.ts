import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchConsumption } from "./api-client.js";
import type { OctopusConfig, ConsumptionResponse } from "./types.js";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function mockFetchResponse(body: object, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

// Base config reused across tests
const baseConfig: OctopusConfig = {
  apiKey: "test-api-key",
  electricityMpan: "1234567890123",
  electricitySerialNumber: "E-SERIAL-001",
  gasMprn: "1234567890",
  gasSerialNumber: "G-SERIAL-001",
};

const mockConsumptionResponse: ConsumptionResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { consumption: 1.5, interval_start: "2024-01-01T00:00:00Z", interval_end: "2024-01-01T00:30:00Z" },
    { consumption: 2.1, interval_start: "2024-01-01T00:30:00Z", interval_end: "2024-01-01T01:00:00Z" },
  ],
};

// ---------------------------------------------------------------------------
// URL construction — electricity
// ---------------------------------------------------------------------------

describe("fetchConsumption URL construction (electricity)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct electricity endpoint URL with no query string", async () => {
    await fetchConsumption(baseConfig, "electricity", {});
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(
      "https://api.octopus.energy/v1/electricity-meter-points/1234567890123/meters/E-SERIAL-001/consumption/"
    );
  });

  it("includes no query string when no optional params provided", async () => {
    await fetchConsumption(baseConfig, "electricity", {});
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).not.toContain("?");
  });
});

// ---------------------------------------------------------------------------
// URL construction — gas
// ---------------------------------------------------------------------------

describe("fetchConsumption URL construction (gas)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct gas endpoint URL", async () => {
    await fetchConsumption(baseConfig, "gas", {});
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(
      "https://api.octopus.energy/v1/gas-meter-points/1234567890/meters/G-SERIAL-001/consumption/"
    );
  });
});

// ---------------------------------------------------------------------------
// Auth header tests
// ---------------------------------------------------------------------------

describe("fetchConsumption auth headers", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends Basic Auth header derived from apiKey", async () => {
    await fetchConsumption(baseConfig, "electricity", {});
    const [, options] = fetchMock.mock.calls[0];
    const expectedAuth = `Basic ${Buffer.from("test-api-key:").toString("base64")}`;
    expect(options.headers.Authorization).toBe(expectedAuth);
  });

  it("sends Content-Type: application/json", async () => {
    await fetchConsumption(baseConfig, "electricity", {});
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });
});

// ---------------------------------------------------------------------------
// Query parameter tests
// ---------------------------------------------------------------------------

describe("fetchConsumption query parameters", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("appends all query params when all are provided", async () => {
    await fetchConsumption(baseConfig, "electricity", {
      periodFrom: "2024-01-01T00:00:00Z",
      periodTo: "2024-01-31T23:59:59Z",
      pageSize: 50,
      orderBy: "period",
      groupBy: "day",
    });
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain("period_from=");
    expect(calledUrl).toContain("period_to=");
    expect(calledUrl).toContain("page_size=");
    expect(calledUrl).toContain("order_by=");
    expect(calledUrl).toContain("group_by=");
  });

  it("appends only period_from when only periodFrom is provided", async () => {
    await fetchConsumption(baseConfig, "electricity", {
      periodFrom: "2024-01-01T00:00:00Z",
    });
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain("period_from=");
    expect(calledUrl).not.toContain("period_to=");
    expect(calledUrl).not.toContain("page_size=");
    expect(calledUrl).not.toContain("order_by=");
    expect(calledUrl).not.toContain("group_by=");
  });

  it("encodes the period_from value correctly", async () => {
    await fetchConsumption(baseConfig, "electricity", {
      periodFrom: "2024-01-01T00:00:00Z",
    });
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain("period_from=2024-01-01T00%3A00%3A00Z");
  });
});

// ---------------------------------------------------------------------------
// Parameter override tests
// ---------------------------------------------------------------------------

describe("fetchConsumption parameter overrides", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses params.mpan over config.electricityMpan when provided", async () => {
    await fetchConsumption(baseConfig, "electricity", { mpan: "9999999999999" });
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain("/electricity-meter-points/9999999999999/");
    expect(calledUrl).not.toContain("1234567890123");
  });

  it("uses params.mprn over config.gasMprn when provided", async () => {
    await fetchConsumption(baseConfig, "gas", { mprn: "9876543210" });
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain("/gas-meter-points/9876543210/");
    expect(calledUrl).not.toContain("1234567890");
  });
});

// ---------------------------------------------------------------------------
// Missing identifier error tests
// ---------------------------------------------------------------------------

describe("fetchConsumption missing identifier errors", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws error containing 'MPAN is required' when no electricityMpan in config or params", async () => {
    const config: OctopusConfig = { ...baseConfig, electricityMpan: undefined };
    await expect(fetchConsumption(config, "electricity", {})).rejects.toThrow("MPAN is required");
  });

  it("throws error containing 'MPRN is required' when no gasMprn in config or params", async () => {
    const config: OctopusConfig = { ...baseConfig, gasMprn: undefined };
    await expect(fetchConsumption(config, "gas", {})).rejects.toThrow("MPRN is required");
  });
});

// ---------------------------------------------------------------------------
// Missing serial number error tests
// ---------------------------------------------------------------------------

describe("fetchConsumption missing serial number errors", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws error containing 'Serial number is required' when no electricitySerialNumber", async () => {
    const config: OctopusConfig = { ...baseConfig, electricitySerialNumber: undefined };
    await expect(fetchConsumption(config, "electricity", {})).rejects.toThrow("Serial number is required");
  });
});

// ---------------------------------------------------------------------------
// Missing API key error tests
// ---------------------------------------------------------------------------

describe("fetchConsumption missing API key errors", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws error containing 'OCTOPUS_API_KEY' when apiKey is empty string", async () => {
    const config: OctopusConfig = { ...baseConfig, apiKey: "" };
    await expect(fetchConsumption(config, "electricity", {})).rejects.toThrow("OCTOPUS_API_KEY");
  });
});

// ---------------------------------------------------------------------------
// HTTP error response tests
// ---------------------------------------------------------------------------

describe("fetchConsumption HTTP error responses", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws error containing status code and meter type when API returns 401", async () => {
    fetchMock.mockResolvedValueOnce(mockFetchResponse({ detail: "Unauthorized" }, false, 401));
    await expect(fetchConsumption(baseConfig, "electricity", {})).rejects.toThrow("401");
  });

  it("throws error containing 'electricity' in message on electricity 401", async () => {
    fetchMock.mockResolvedValueOnce(mockFetchResponse({ detail: "Unauthorized" }, false, 401));
    await expect(fetchConsumption(baseConfig, "electricity", {})).rejects.toThrow("electricity");
  });

  it("throws error containing the meter identifier on HTTP error", async () => {
    fetchMock.mockResolvedValueOnce(mockFetchResponse({ detail: "Unauthorized" }, false, 401));
    await expect(fetchConsumption(baseConfig, "electricity", {})).rejects.toThrow("1234567890123");
  });

  it("throws error containing status code when API returns 404", async () => {
    fetchMock.mockResolvedValueOnce(mockFetchResponse({ detail: "Not Found" }, false, 404));
    await expect(fetchConsumption(baseConfig, "gas", {})).rejects.toThrow("404");
  });
});

// ---------------------------------------------------------------------------
// Timeout error tests
// ---------------------------------------------------------------------------

describe("fetchConsumption timeout errors", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws error containing 'timed out' when fetch rejects with TimeoutError", async () => {
    const err = new DOMException("signal timed out", "TimeoutError");
    fetchMock.mockRejectedValueOnce(err);
    await expect(fetchConsumption(baseConfig, "electricity", {})).rejects.toThrow("timed out");
  });

  it("throws error containing '30 seconds' on timeout", async () => {
    const err = new DOMException("signal timed out", "TimeoutError");
    fetchMock.mockRejectedValueOnce(err);
    await expect(fetchConsumption(baseConfig, "electricity", {})).rejects.toThrow("30 seconds");
  });

  it("throws error containing the meter identifier on timeout", async () => {
    const err = new DOMException("signal timed out", "TimeoutError");
    fetchMock.mockRejectedValueOnce(err);
    await expect(fetchConsumption(baseConfig, "electricity", {})).rejects.toThrow("1234567890123");
  });

  it("throws timeout error for gas meter with gas identifier", async () => {
    const err = new DOMException("signal timed out", "TimeoutError");
    fetchMock.mockRejectedValueOnce(err);
    await expect(fetchConsumption(baseConfig, "gas", {})).rejects.toThrow("1234567890");
  });
});

// ---------------------------------------------------------------------------
// Successful response tests
// ---------------------------------------------------------------------------

describe("fetchConsumption successful response", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockConsumptionResponse));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the parsed ConsumptionResponse for electricity", async () => {
    const result = await fetchConsumption(baseConfig, "electricity", {});
    expect(result).toEqual(mockConsumptionResponse);
  });

  it("returns the parsed ConsumptionResponse for gas", async () => {
    const result = await fetchConsumption(baseConfig, "gas", {});
    expect(result).toEqual(mockConsumptionResponse);
  });

  it("returns count, next, previous, and results from response", async () => {
    const result = await fetchConsumption(baseConfig, "electricity", {});
    expect(result.count).toBe(2);
    expect(result.next).toBeNull();
    expect(result.previous).toBeNull();
    expect(result.results).toHaveLength(2);
    expect(result.results[0].consumption).toBe(1.5);
  });
});
