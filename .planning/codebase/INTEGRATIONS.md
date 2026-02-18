# External Integrations

**Analysis Date:** 2026-02-18

## APIs & External Services

**Octopus Energy API:**
- Service: Octopus Energy REST API
- What it's used for: Retrieve electricity and gas consumption data for smart meters
  - Electricity meter consumption in kWh (0.045 kWh precision)
  - Gas meter consumption in kWh (SMETS1) or cubic meters (SMETS2)
- SDK/Client: Native Fetch API (Node.js built-in)
- Base URL: https://api.octopus.energy/v1
- Authentication: HTTP Basic Auth (API key as username)
  - API key encoding: `src/index.ts` line 145 - `Buffer.from("${apiKey}:").toString("base64")`
- Implementation: `src/index.ts` lines 99-162 (`fetchConsumption` method)

## Data Storage

**Databases:**
- None - This is a stateless API gateway server

**File Storage:**
- Local filesystem only - Configuration via .env file
- No persistent data storage

**Caching:**
- None - Real-time queries to Octopus Energy API

## Authentication & Identity

**Auth Provider:**
- Octopus Energy API (custom)
  - Implementation: HTTP Basic Authentication
  - Mechanism: `src/index.ts` lines 144-150
    - API key provided as Basic Auth username (password empty)
    - Base64 encoding: `Buffer.from("${apiKey}:").toString("base64")`
    - Header: `Authorization: Basic ${encodedKey}`
  - Configuration: OCTOPUS_API_KEY environment variable

## Service Communication

**LLM Integration:**
- Model Context Protocol (MCP) via StdioServerTransport
- Implementation: `src/index.ts` lines 324-326
- Server connection: stdio-based for Claude Desktop integration
- Exported tools:
  - `get_electricity_consumption` - Query electricity consumption data
  - `get_gas_consumption` - Query gas consumption data

## Monitoring & Observability

**Error Tracking:**
- None - Errors returned as tool response with isError flag
- Error handling: `src/index.ts` lines 309-320
  - Try-catch blocks around API calls
  - Error messages returned to LLM via MCP response

**Logs:**
- stderr logging only (doesn't interfere with MCP protocol)
- Status messages logged to stderr: `src/index.ts` lines 329-335
  - Configuration status on startup
  - API key presence indicator

## CI/CD & Deployment

**Hosting:**
- Claude Desktop (local machine)
- Manual deployment via MCP server configuration
- Configuration locations:
  - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
  - Windows: %APPDATA%\Claude\claude_desktop_config.json

**CI Pipeline:**
- None detected

**Build Process:**
- Local TypeScript compilation: `npm run build`
- Output: dist/index.js (ES Module with Node16 module resolution)

## Environment Configuration

**Required env vars:**
- `OCTOPUS_API_KEY` - Octopus Energy API authentication (required at runtime)

**Optional env vars:**
- `ELECTRICITY_MPAN` - Default electricity meter identifier (13 digits)
- `ELECTRICITY_SERIAL_NUMBER` - Default electricity meter serial number
- `GAS_MPRN` - Default gas meter identifier (10 digits)
- `GAS_SERIAL_NUMBER` - Default gas meter serial number

**Secrets location:**
- .env file in project root (not committed to git)
- Can be overridden via Claude Desktop config env section
  - See README.md lines 101-107 for desktop config example
- Manual parsing in `src/index.ts` lines 20-33 to avoid dotenv's verbose output

## API Query Parameters

**Octopus Energy Consumption Endpoints Support:**
- `period_from` - ISO 8601 datetime (e.g., "2024-01-01T00:00:00Z")
- `period_to` - ISO 8601 datetime with UTC indicator
- `page_size` - Results per page (default: 100, max: 25000)
- `order_by` - "period" for ascending order (default: latest first)
- `group_by` - Aggregation level: "day", "week", "month", or "quarter"

**Tool Parameters:**
- Implementation: `src/index.ts` lines 134-140
- URLSearchParams construction for query string building
- Conditional inclusion (only append if provided)

## Meter Details

**Electricity Meters:**
- Identifier: MPAN (Meter Point Administration Number) - 13 digits
- Serial number required for consumption API calls
- Configuration keys: ELECTRICITY_MPAN, ELECTRICITY_SERIAL_NUMBER
- API endpoint: `/electricity-meter-points/{mpan}/meters/{serial}/consumption/`

**Gas Meters:**
- Identifier: MPRN (Meter Point Reference Number) - 10 digits
- Serial number required for consumption API calls
- Units: kWh (SMETS1 meters) or cubic meters (SMETS2 meters)
- Configuration keys: GAS_MPRN, GAS_SERIAL_NUMBER
- API endpoint: `/gas-meter-points/{mprn}/meters/{serial}/consumption/`

## Response Format

**Consumption API Response Structure:**
```typescript
{
  count: number;
  next: string | null;        // Next page URL if pagination available
  previous: string | null;    // Previous page URL
  results: [
    {
      consumption: number;    // kWh or cubic meters
      interval_start: string; // ISO 8601 datetime
      interval_end: string;   // ISO 8601 datetime
    }
  ];
}
```

**Tool Response Format:**
- Success: JSON response from Octopus API formatted as text
- Error: Error message with isError flag set to true
- Implementation: `src/index.ts` lines 277-319

## Error Handling

**API Error States:**
- Non-OK HTTP response: `src/index.ts` lines 154-159
  - Captures HTTP status code and response text
  - Throws error with format: `"Octopus Energy API error (status): message"`
- Missing configuration: `src/index.ts` lines 103-127
  - OCTOPUS_API_KEY required
  - MPAN/MPRN required (either from parameter or environment)
  - Serial number required (either from parameter or environment)

---

*Integration audit: 2026-02-18*
