# Coding Conventions

**Analysis Date:** 2026-02-18

## Naming Patterns

**Files:**
- Single file module: `index.ts` - Entry point named `index.ts`
- TypeScript extension used exclusively: `.ts`

**Functions:**
- camelCase for method names: `fetchConsumption()`, `setupHandlers()`, `run()`
- Private methods prefixed with underscore: `private async fetchConsumption()`, `private setupHandlers()`
- Verb-based naming for functions that perform actions: `fetch*`, `setup*`, `get*`

**Variables:**
- camelCase for local variables and parameters: `apiKey`, `serialNumber`, `periodFrom`, `pageSize`
- SCREAMING_SNAKE_CASE for constants: `OCTOPUS_API_BASE`
- Descriptive names for complex types: `queryParams`, `errorMessage`, `identifier`

**Types:**
- PascalCase for interfaces: `OctopusConfig`, `ConsumptionParams`, `ConsumptionResult`, `ConsumptionResponse`
- PascalCase for classes: `OctopusEnergyServer`
- Union types for specific constraints: `type === "electricity" | "gas"`, `groupBy?: "day" | "week" | "month" | "quarter"`

**Environment Variables:**
- SCREAMING_SNAKE_CASE: `OCTOPUS_API_KEY`, `ELECTRICITY_MPAN`, `ELECTRICITY_SERIAL_NUMBER`, `GAS_MPRN`, `GAS_SERIAL_NUMBER`
- Config-specific grouping: `ELECTRICITY_*` for electricity meters, `GAS_*` for gas meters

## Code Style

**Formatting:**
- No explicit formatter configured (no `.prettierrc` or Prettier config)
- Consistent indentation: 2 spaces throughout
- Quotes: Double quotes for strings (`"string"`)
- Trailing commas in objects: Present in multi-line objects
- Arrow functions preferred over function expressions where applicable

**Linting:**
- No ESLint configuration present (no `.eslintrc*` file)
- TypeScript strict mode enabled in `tsconfig.json`:
  - `"strict": true` enforces type checking
  - `"esModuleInterop": true` allows CommonJS/ESM interoperability

**TypeScript Configuration:**
- Target: ES2022
- Module: Node16 (for ES modules)
- Strict mode: Enabled
- Declaration files: Generated (`.d.ts`)

## Import Organization

**Order:**
1. Node.js built-in modules: `import { fileURLToPath } from "url"`
2. Third-party packages: `import { Server } from "@modelcontextprotocol/sdk/server/index.js"`
3. Local modules/types: (None used, single-file module)

**Path Style:**
- Full import paths with explicit file extensions: `from "@modelcontextprotocol/sdk/server/index.js"`
- No path aliases configured
- Absolute imports from npm packages

**Module Format:**
- ES modules (`"type": "module"` in `package.json`)
- Explicit `.js` extension in imports even for TypeScript (compiled output)

## Error Handling

**Patterns:**
- Error throwing with descriptive messages: `throw new Error("OCTOPUS_API_KEY environment variable is not set")`
- Error context included: Error messages explain what is missing and how to fix it
- Instance checking: `error instanceof Error` to determine error type
- Try-catch blocks for file I/O: `.env` file reading wrapped in try-catch with silent failure
- Error propagation: Try-catch returns early if critical configuration missing
- API error messages include status code: `Octopus Energy API error (${response.status})`
- Graceful degradation: Missing `.env` file is non-fatal, logged to stderr

**Pattern in setupHandlers:**
```typescript
try {
  // validate input
  if (!args) {
    throw new Error("No arguments provided");
  }
  // perform action
  // return success result
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text", text: `Error: ${errorMessage}` }],
    isError: true,
  };
}
```

## Logging

**Framework:** `console.error()` - Direct console for logging to stderr

**Patterns:**
- Configuration status logged after server starts: Server initialization details
- Logging to stderr prevents interference with MCP protocol (stdout is reserved)
- Checkmark/circle indicators for configuration status: `✓ Set`, `✗ Not set`, `○ Not set`
- Multi-line configuration output for readability

**Log Points:**
- `console.error("Octopus Energy MCP Server running on stdio")` - Server start
- Configuration check results with visual indicators
- Fatal errors: `console.error("Fatal error:", error)`

## Comments

**When to Comment:**
- Clarify non-obvious intent: "Load .env from the project root directory (silently)"
- Explain workarounds: "Use Basic Auth with API key as username"
- Describe data transformations: "Build query parameters"
- API contract explanations: Return type descriptions in tool definitions

**JSDoc/TSDoc:**
- Used for tool definitions with detailed descriptions
- Parameter descriptions in tool input schemas
- No function-level JSDoc present in source code

**Comment Style:**
- Inline comments for code sections: `// comment`
- Comment above affected code block
- Silent failures documented: `// .env file doesn't exist or can't be read - this is okay`

## Function Design

**Size:**
- Small focused functions: `fetchConsumption()` at 63 lines, `setupHandlers()` at 159 lines
- Reasonable method complexity with clear responsibilities

**Parameters:**
- Typed parameters with interfaces: `params: ConsumptionParams`
- Optional parameters in interface fields: `mpan?: string`
- Union types for specific cases: `type: "electricity" | "gas"`
- Parameter count: Methods use 1-2 parameters (prefer objects over multiple params)

**Return Values:**
- Explicit return types: `Promise<ConsumptionResponse>`, `Promise<void>`, `async () =>`
- Union return types: `string | null`, `number | undefined`
- Consistent with MCP protocol response structure

## Module Design

**Exports:**
- Single default export through class instantiation: `const server = new OctopusEnergyServer()`
- No explicit module.exports (ES modules)
- CLI shebang for executable: `#!/usr/bin/env node` at file start

**Barrel Files:**
- Not applicable (single-file module)

**Class Encapsulation:**
- Private methods/properties: `private server`, `private config`, `private async fetchConsumption()`
- Public methods: `async run()`
- Initialization in constructor: Configuration loading and server setup
- Dependency injection: Server instance passed via constructor parameters

## Configuration Management

**Environment Variables:**
- Read from `.env` file in project root
- Manual parsing to avoid verbose logging: Custom .env reader implemented
- Fallback pattern: Environment variables with optional config values
- Silent failure for optional config: Missing optional meter details logged but not fatal

**Config Structure:**
- Centralized in `OctopusConfig` interface
- Loaded in constructor and stored as instance property
- Validation occurs at point of use: Error thrown when identifier missing

---

*Convention analysis: 2026-02-18*
