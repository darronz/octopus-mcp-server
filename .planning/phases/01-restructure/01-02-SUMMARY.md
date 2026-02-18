---
phase: 01-restructure
plan: "02"
subsystem: api
tags: [typescript, mcp, es-modules, octopus-energy, handler, server]

requires:
  - phase: 01-01
    provides: "src/types.ts (OctopusConfig, ConsumptionParams) and src/api-client.ts (fetchConsumption)"
provides:
  - "src/handlers.ts - getToolDefinitions() returning both tool schemas, handleConsumption() single shared function for electricity and gas"
  - "src/server.ts - createServer(config) factory returning fully configured MCP Server instance with handler registration"
affects: [01-03]

tech-stack:
  added: []
  patterns:
    - "Single shared handler function for multiple meter types (type discriminator pattern)"
    - "Error propagation: handleConsumption throws, server.ts catches and returns isError response"
    - "Factory function pattern: createServer() returns configured Server instance, run() stays in entry point"

key-files:
  created:
    - src/handlers.ts
    - src/server.ts
  modified: []

key-decisions:
  - "handleConsumption has no try/catch - throws on error, caller (server.ts) handles error formatting"
  - "createServer() only configures the server; transport connection and logging remain in index.ts entry point"
  - "type discriminator sets mpan for electricity and mprn for gas, leaving the other undefined"

patterns-established:
  - "Shared handler pattern: single function with type discriminator replaces duplicated electricity/gas blocks"
  - "MCP server wiring isolated in server.ts; transport and startup lifecycle in entry point only"

requirements-completed: [STRUC-01, STRUC-02]

duration: 1min
completed: 2026-02-18
---

# Phase 1 Plan 02: Create Handlers and Server Modules Summary

**Single shared handleConsumption function with type discriminator replacing duplicated electricity/gas blocks, plus MCP server factory in src/server.ts**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-18T13:14:59Z
- **Completed:** 2026-02-18T13:16:09Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `src/handlers.ts` exporting `getToolDefinitions()` (both tool schemas) and `handleConsumption()` (single shared function for electricity and gas - STRUC-02 fulfilled)
- Created `src/server.ts` exporting `createServer(config)` that builds and returns a fully configured MCP Server instance with both request handlers registered
- Both files compile cleanly under `tsc --noEmit` with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/handlers.ts with shared consumption handler** - `9b8969e` (feat)
2. **Task 2: Create src/server.ts with MCP server factory** - `fbd40ec` (feat)

## Files Created/Modified
- `src/handlers.ts` - Shared MCP tool handler logic: `getToolDefinitions()` and `handleConsumption()`
- `src/server.ts` - MCP server factory: `createServer(config)` returning configured Server instance

## Decisions Made
- `handleConsumption` has no try/catch block; it throws on error and the caller (`server.ts`) is responsible for wrapping in `{ isError: true }` response format
- `createServer()` only handles server instantiation and handler registration; the `run()` method (transport connection and logging) remains in `index.ts` entry point
- Type discriminator pattern: `mpan` set for electricity type, `mprn` set for gas type, with the other explicitly set to `undefined` in `ConsumptionParams`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Both new files compiled without any TypeScript errors on the first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `src/handlers.ts` and `src/server.ts` ready to be imported by `src/index.ts` (Plan 01-03)
- Plan 01-03 will update `src/index.ts` to import from the new modules and remove the old duplicated code

---
*Phase: 01-restructure*
*Completed: 2026-02-18*

## Self-Check: PASSED

- FOUND: src/handlers.ts
- FOUND: src/server.ts
- FOUND: .planning/phases/01-restructure/01-02-SUMMARY.md
- FOUND commit 9b8969e (feat: create src/handlers.ts)
- FOUND commit fbd40ec (feat: create src/server.ts)
