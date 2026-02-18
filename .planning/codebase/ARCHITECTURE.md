# Architecture

**Analysis Date:** 2026-02-18

## Pattern Overview

**Overall:** MCP Server (Model Context Protocol) following the single-class monolithic pattern

**Key Characteristics:**
- Stdio-based server transport for standard input/output communication
- Tool registration and request-response handler pattern for MCP protocol
- Direct API client implementation with basic authentication
- Configuration-driven design for meter identifiers and API credentials

## Layers

**Configuration Layer:**
- Purpose: Load and validate environment variables and credentials
- Location: `src/index.ts` (lines 14-82)
- Contains: Environment variable parsing, `OctopusConfig` interface definition, server initialization
- Depends on: Environment variables (`.env` file), process module
- Used by: `OctopusEnergyServer` constructor

**MCP Protocol Layer:**
- Purpose: Handle Model Context Protocol server setup and request/response routing
- Location: `src/index.ts` (lines 84-96, 164-322)
- Contains: Server instantiation, handler registration via `setRequestHandler`
- Depends on: `@modelcontextprotocol/sdk/server`
- Used by: Main entry point for all client communication

**API Integration Layer:**
- Purpose: Communicate with Octopus Energy API for consumption data
- Location: `src/index.ts` (lines 99-162)
- Contains: `fetchConsumption` method, URL construction, query parameter building, basic auth
- Depends on: Native `fetch` API, URL parameters, Octopus Energy API
- Used by: Tool handlers for electricity and gas consumption

**Tool Handler Layer:**
- Purpose: Implement MCP tools and orchestrate parameter mapping
- Location: `src/index.ts` (lines 255-321)
- Contains: Tool call routing, parameter extraction, error handling and response formatting
- Depends on: API Integration layer
- Used by: MCP protocol to respond to `CallToolRequest`

## Data Flow

**Tool Invocation Flow:**

1. Client calls `get_electricity_consumption` or `get_gas_consumption` via MCP
2. `CallToolRequestSchema` handler receives request with tool name and parameters
3. Parameters are extracted and mapped to `ConsumptionParams` object (snake_case from request → camelCase internally)
4. `fetchConsumption` method is invoked with type ("electricity" or "gas") and parameters
5. Method resolves identifiers from parameters or falls back to config values
6. URL is constructed using base endpoint, meter identifiers, and query parameters
7. HTTP request is made with Basic Auth header (API key as username)
8. Response is parsed and returned as JSON string within MCP text content
9. Errors are caught and returned with `isError: true` flag

**Tool Definition Flow:**

1. Client calls `ListToolsRequest` via MCP
2. `ListToolsRequestSchema` handler returns hardcoded array of two tool definitions
3. Each tool includes name, description, and JSON schema for input validation

**State Management:**
- Configuration state is instantiated once in `OctopusEnergyServer.constructor`
- MCP server instance is created and maintained for the lifetime of the process
- No session or request-scoped state; stateless computation for each request
- Environment variables read at startup and cached in `OctopusConfig`

## Key Abstractions

**OctopusConfig:**
- Purpose: Encapsulate meter and API credentials
- Location: `src/index.ts` (lines 38-44)
- Pattern: Typed interface with optional meter fields, required API key
- Used by: Server initialization and API requests

**ConsumptionParams:**
- Purpose: Represent normalized consumption query parameters
- Location: `src/index.ts` (lines 46-55)
- Pattern: Typed interface with optional fields, supports both electricity (mpan) and gas (mprn)
- Used by: Tool handlers and API integration layer

**ConsumptionResult & ConsumptionResponse:**
- Purpose: Type API response data
- Location: `src/index.ts` (lines 57-68)
- Pattern: Typed interfaces matching Octopus Energy API response structure
- Used by: API layer for response parsing and validation

**OctopusEnergyServer:**
- Purpose: Encapsulate all server logic and lifecycle
- Location: `src/index.ts` (lines 71-337)
- Pattern: Single class with private methods, public `run` method as entry point
- Methods:
  - `constructor`: Initialize MCP server and config
  - `setupHandlers`: Register request handlers
  - `fetchConsumption`: Perform API calls
  - `run`: Start server and log status

## Entry Points

**Main Entry Point:**
- Location: `src/index.ts` (lines 339-344)
- Triggers: Executed when `node dist/index.js` is run
- Responsibilities: Instantiate server, start it, catch fatal errors

**Tool: get_electricity_consumption**
- Location: Handler within `CallToolRequestSchema` (lines 264-284)
- Triggers: MCP client calls tool with name
- Responsibilities: Extract parameters, call API, return formatted response

**Tool: get_gas_consumption**
- Location: Handler within `CallToolRequestSchema` (lines 285-305)
- Triggers: MCP client calls tool with name
- Responsibilities: Extract parameters, call API, return formatted response

**Tool: ListTools (implicit)**
- Location: Handler within `ListToolsRequestSchema` (lines 166-253)
- Triggers: MCP client requests available tools
- Responsibilities: Return static tool definitions with schemas

## Error Handling

**Strategy:** Try-catch wrapping with error response formatting

**Patterns:**
- Missing configuration: Throw descriptive `Error` with guidance on environment variables
- Missing parameters: Throw `Error` indicating required field and fallback sources
- API failures: Fetch response status and error text, throw `Error` with status code and response body
- Tool handler errors: Catch any `Error` instance, format as MCP text response with `isError: true`
- Fatal errors: Top-level catch in `run()` method logs to stderr and exits with code 1
- Silent failures: Environment file loading wrapped in try-catch, silently continues if file missing

## Cross-Cutting Concerns

**Logging:**
- Uses `console.error` for server status messages (stderr to avoid interfering with MCP stdio protocol)
- Logs configuration status after server connects
- Indicates which config values are set (checkmark) vs. not set (cross/circle)

**Validation:**
- Input validation via TypeScript strict mode compile-time checking
- Runtime validation of required fields in `fetchConsumption` method
- API response validation through `response.ok` check
- MCP protocol validation handled by SDK schema handlers

**Authentication:**
- Basic Auth implementation: API key as username, empty password
- Credentials base64-encoded in Authorization header
- API key required at startup; missing key throws error during tool invocation

**Configuration:**
- Environment variables loaded from `.env` file in project root
- Manual parsing of `.env` to avoid verbose dotenv output
- Fallback to runtime parameter values for meter identifiers
- Server initialization logs configuration status to stderr for debugging

---

*Architecture analysis: 2026-02-18*
