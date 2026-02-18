# Technology Stack

**Analysis Date:** 2026-02-18

## Languages

**Primary:**
- TypeScript 5.9.3 - Entire source code in `src/index.ts`

## Runtime

**Environment:**
- Node.js 18+ (recommended in README)
- Type: ES Module (`"type": "module"` in package.json)

**Package Manager:**
- npm
- Lockfile: package-lock.json (present)

## Frameworks

**Core:**
- @modelcontextprotocol/sdk 1.24.3 - MCP server framework for LLM integration
  - Server class: `src/index.ts` line 6
  - StdioServerTransport for stdio-based communication

**Build/Dev:**
- TypeScript 5.9.3 - Language compilation
  - Target: ES2022
  - Module: Node16
  - Config: `tsconfig.json`

## Key Dependencies

**Critical:**
- @modelcontextprotocol/sdk 1.24.3 - Provides Server, StdioServerTransport, and tool schema types
  - Used in `src/index.ts` lines 6-12 for server setup
  - Implements MCP protocol for tool exposure

**Utilities:**
- dotenv 17.2.3 - Environment variable loading (installed but manually parsed in code)
  - Note: Manual .env parsing used instead of dotenv's default behavior to avoid verbose output
  - Parsing logic: `src/index.ts` lines 14-33

**Development:**
- @types/node 24.10.1 - Node.js type definitions

## Configuration

**Environment:**
- .env file in project root (not committed to git)
- Manual parsing in `src/index.ts` lines 20-33 instead of using dotenv directly
- Environment variables used:
  - `OCTOPUS_API_KEY` (required) - Octopus Energy API authentication
  - `ELECTRICITY_MPAN` (optional) - 13-digit electricity meter point number
  - `ELECTRICITY_SERIAL_NUMBER` (optional) - Electricity meter serial
  - `GAS_MPRN` (optional) - 10-digit gas meter point number
  - `GAS_SERIAL_NUMBER` (optional) - Gas meter serial number

**Build:**
- tsconfig.json in project root
  - Output: ./dist
  - Input: ./src/**/*
  - Strict mode enabled
  - Declaration files generated

## Platform Requirements

**Development:**
- Node.js v18 or higher
- npm for package management
- TypeScript 5.9.3 for compilation

**Production/Deployment:**
- Node.js v18 or higher
- Distribution: Claude Desktop via MCP server configuration
- Deployment via `claude_desktop_config.json`:
  - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
  - Windows: %APPDATA%\Claude\claude_desktop_config.json
- Entry point: dist/index.js (Node.js executable with shebang)

## Build and Run Scripts

```bash
npm run build       # TypeScript compilation (tsc)
npm run start       # Run compiled dist/index.js
npm run dev         # Build and run in one step (tsc && node dist/index.js)
npm run watch       # TypeScript watch mode (tsc --watch)
```

## API Integration

**Octopus Energy API:**
- Base URL: https://api.octopus.energy/v1
- Authentication: Basic Auth with API key as username
- Endpoints used:
  - `{base}/electricity-meter-points/{mpan}/meters/{serial}/consumption/`
  - `{base}/gas-meter-points/{mprn}/meters/{serial}/consumption/`
- HTTP client: Native Fetch API (Node.js built-in)
- Request headers: Authorization (Basic), Content-Type (application/json)

---

*Stack analysis: 2026-02-18*
