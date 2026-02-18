# Codebase Structure

**Analysis Date:** 2026-02-18

## Directory Layout

```
octopus-mcp-server/
├── src/                    # TypeScript source code
│   └── index.ts            # Single monolithic server implementation
├── dist/                   # Compiled JavaScript output (generated)
│   ├── index.js            # Compiled entry point executable
│   └── index.d.ts          # TypeScript declaration file
├── .planning/              # GSD planning and documentation
│   └── codebase/           # Architecture and design documents
├── package.json            # Node.js project manifest and scripts
├── tsconfig.json           # TypeScript compiler configuration
├── .env.example            # Template for environment variables (no secrets)
├── .gitignore              # Git ignore patterns
└── README.md               # Project documentation
```

## Directory Purposes

**src/:**
- Purpose: Source code directory containing all TypeScript implementation
- Contains: Single TypeScript file with complete server implementation
- Key files: `src/index.ts` (344 lines, monolithic implementation)

**dist/:**
- Purpose: Compiled JavaScript output for production execution
- Contains: Transpiled JavaScript and TypeScript declaration files
- Generated: Yes (via `npm run build` or `tsc`)
- Committed: No (in `.gitignore`)
- Key files: `dist/index.js` (executable entry point)

**.planning/codebase/:**
- Purpose: GSD-managed documentation and architecture analysis
- Contains: ARCHITECTURE.md, STRUCTURE.md, and other analysis documents
- Generated: Yes (by GSD mapping tools)
- Committed: Yes (for team reference)

## Key File Locations

**Entry Points:**
- `src/index.ts`: Main implementation file, contains shebang (`#!/usr/bin/env node`) for CLI execution
- `dist/index.js`: Compiled executable; specified in `package.json` bin field as `octopus-mcp-server`

**Configuration:**
- `package.json`: Project metadata, dependencies, and npm scripts
- `tsconfig.json`: TypeScript compiler options (ES2022 target, strict mode)
- `.env`: Runtime environment variables (API key, meter identifiers) - loaded at startup
- `.env.example`: Template for `.env` showing required variables

**Core Logic:**
- `src/index.ts`: Complete application logic including:
  - Configuration loading (lines 14-82)
  - Server class definition (lines 71-337)
  - API integration (lines 99-162)
  - Request handlers (lines 164-322)

**Testing:**
- Not applicable: No test files in codebase

## Naming Conventions

**Files:**
- Single source file: `index.ts` (standard entry point naming)
- Compiled output: `index.js` with declaration file `index.d.ts`
- Environment: `.env` and `.env.example`
- Configuration: `tsconfig.json` (standard TypeScript config)

**Directories:**
- `src`: Standard source directory for TypeScript projects
- `dist`: Standard distribution/compiled output directory
- `.planning`: GSD-specific planning directory

**Classes & Types:**
- `OctopusEnergyServer`: PascalCase class name, wraps all server functionality
- `OctopusConfig`, `ConsumptionParams`, `ConsumptionResult`, `ConsumptionResponse`: PascalCase interfaces

**Functions & Methods:**
- Private methods: `setupHandlers()`, `fetchConsumption()` (camelCase with underscore for multi-word)
- Public methods: `run()` (camelCase)

**Variables & Constants:**
- Constants: `OCTOPUS_API_BASE` (UPPER_SNAKE_CASE for immutable values)
- Configuration keys: `OCTOPUS_API_KEY`, `ELECTRICITY_MPAN`, etc. (UPPER_SNAKE_CASE)
- Parameters: `mpan`, `mprn`, `periodFrom` (camelCase)

## Where to Add New Code

**New Feature:**
- Primary code: `src/index.ts` (add method to `OctopusEnergyServer` class)
- Tool definition: Add to `tools` array within `ListToolsRequestSchema` handler (lines 167-250)
- Tool handler: Add conditional branch in `CallToolRequestSchema` handler (lines 256-321)

**New Tool Example Structure:**
```typescript
// 1. Define tool in ListToolsRequestSchema handler
{
  name: "new_tool_name",
  description: "...",
  inputSchema: { type: "object", properties: {...}, required: [...] }
}

// 2. Add handler in CallToolRequestSchema
if (name === "new_tool_name") {
  const params: SomeParamType = { ... };
  const data = await this.someMethod(params);
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
}

// 3. Add supporting method to class (if needed)
private async someMethod(params: SomeParamType): Promise<SomeReturnType> {
  // Implementation
}
```

**New Configuration Parameter:**
- Add to `OctopusConfig` interface (lines 38-44)
- Load from environment in constructor (lines 76-82)
- Reference in methods as `this.config.paramName`

**Utilities/Shared Helpers:**
- Currently not separated: All code lives in `src/index.ts`
- If extracting common functionality: Create separate files in `src/` directory (e.g., `src/api.ts`, `src/types.ts`)
- Export interfaces and functions using ES6 exports
- Import in `index.ts` and maintain single entry point

## Special Directories

**node_modules/:**
- Purpose: npm dependency packages
- Generated: Yes (via `npm install`)
- Committed: No (in `.gitignore`)
- Never modify directly; update via `package.json` and `npm install`

**.git/:**
- Purpose: Git version control metadata
- Generated: Yes (git repository)
- Contains: Commit history, branch info, etc.
- Never modify directly

**dist/:**
- Purpose: Compiled JavaScript output
- Generated: Yes (via `npm run build`)
- Committed: No (in `.gitignore`)
- Regenerate with `npm run build` when source changes

## Scaling Considerations

**Monolithic to Modular Transition:**
If this project grows beyond a single tool server, consider:

1. **Create `src/types.ts`**: Move all interfaces
   - `OctopusConfig`, `ConsumptionParams`, `ConsumptionResult`, `ConsumptionResponse`

2. **Create `src/api.ts`**: Move API integration
   - `fetchConsumption` method as standalone function
   - Build URL helper
   - Auth header construction

3. **Create `src/server.ts`**: Move server class
   - `OctopusEnergyServer` class definition
   - Handler registration

4. **Keep `src/index.ts`**: Entry point only
   - Import server class
   - Instantiate and run

Example refactored structure:
```
src/
├── index.ts          # Entry point (10 lines)
├── types.ts          # Interfaces
├── api.ts            # API integration functions
├── handlers.ts       # MCP tool handlers
└── server.ts         # Server class definition
```

---

*Structure analysis: 2026-02-18*
