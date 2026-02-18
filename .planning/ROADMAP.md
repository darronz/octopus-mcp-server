# Roadmap: Octopus Energy MCP Server

## Overview

This milestone hardens a working 344-line single-file TypeScript MCP server into a well-structured, reliable, and tested codebase. The work progresses in three natural steps: split the monolith into testable modules, add validation and robustness to the handlers, then cover the hardened code with unit tests. No new features are added — the goal is confidence that the existing features work correctly.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Restructure** - Split monolithic index.ts into modules and remove unused dependency
- [ ] **Phase 2: Harden** - Add input validation, safe parameter handling, timeout, and fail-fast startup
- [ ] **Phase 3: Test** - Install test framework and write unit tests for all hardened behavior

## Phase Details

### Phase 1: Restructure
**Goal**: Codebase is split into clearly-scoped modules with no duplication, ready for testing
**Depends on**: Nothing (first phase)
**Requirements**: STRUC-01, STRUC-02, CLEAN-01, CLEAN-02
**Success Criteria** (what must be TRUE):
  1. Source is organized into separate files: types, API client, handlers, server, entry point
  2. A single shared function handles both electricity and gas handler logic (no copy-paste duplication)
  3. The dotenv package is absent from package.json and all import references are removed
  4. The server still starts and responds correctly to Claude Desktop after restructuring
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Create src/types.ts (shared interfaces) and src/api-client.ts (standalone fetchConsumption)
- [ ] 01-02-PLAN.md — Create src/handlers.ts (shared handler + tool definitions) and src/server.ts (MCP server factory)
- [ ] 01-03-PLAN.md — Rewrite src/index.ts as thin entry point, remove dotenv from package.json, verify build

### Phase 2: Harden
**Goal**: The server validates all inputs and fails clearly when something is wrong
**Depends on**: Phase 1
**Requirements**: VALID-01, VALID-02, VALID-03, VALID-04, ROBUS-01, ROBUS-02, ROBUS-03
**Success Criteria** (what must be TRUE):
  1. Calling a tool with a malformed date, MPAN, MPRN, or out-of-range page_size returns a descriptive error rather than passing bad data to the API
  2. Missing or null args are handled without TypeScript unsafe casts — parameters extract safely with defaults or errors
  3. API calls that hang are cancelled after 30 seconds and return a timeout error
  4. Starting the server without OCTOPUS_API_KEY set exits immediately with a clear message instead of failing silently on first request
  5. Error messages include which meter type and identifier was being queried when the failure occurred
**Plans**: TBD

### Phase 3: Test
**Goal**: Unit tests cover the API client, validation, and parameter extraction so regressions are caught automatically
**Depends on**: Phase 2
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. Running `npm test` executes the test suite and produces a pass/fail result
  2. Tests verify that the API client constructs correct URLs and auth headers for electricity and gas endpoints
  3. Tests verify that each validation rule (dates, MPAN, MPRN, page_size) rejects invalid input and accepts valid input
  4. Tests verify that parameter extraction handles missing, null, and valid values correctly
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Restructure | 2/3 | In Progress|  |
| 2. Harden | 0/TBD | Not started | - |
| 3. Test | 0/TBD | Not started | - |
