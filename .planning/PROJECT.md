# Octopus Energy MCP Server

## What This Is

An MCP server that lets Claude query electricity and gas consumption data from the Octopus Energy API. Used via Claude Desktop's MCP integration with stdio transport.

## Core Value

Reliable, well-structured MCP server that returns accurate Octopus Energy consumption data with clear error messages when things go wrong.

## Requirements

### Validated

- ✓ Fetch electricity consumption data via MCP tool — existing
- ✓ Fetch gas consumption data via MCP tool — existing
- ✓ Support date range filtering, pagination, grouping — existing
- ✓ Load meter credentials from .env or tool parameters — existing
- ✓ Basic Auth with Octopus Energy API — existing

### Active

- [ ] Split monolithic index.ts into separate modules (types, API client, handlers, server)
- [ ] Remove duplicated electricity/gas handler logic
- [ ] Add runtime input validation (dates, MPAN/MPRN format, page_size bounds)
- [ ] Add fetch timeout to prevent hung connections
- [ ] Fix unsafe type casting (args cast as string without null checks)
- [ ] Remove unused dotenv dependency
- [ ] Fail fast at startup when API key is missing
- [ ] Add unit tests for API client, validation, and error handling
- [ ] Add test infrastructure (framework, scripts, config)

### Out of Scope

- New API endpoints (tariffs, account info, standing charges) — focus is hardening, not features
- CI/CD pipeline — local development only for now
- Publishing to npm — not needed yet

## Context

- Brownfield project with 344-line single-file TypeScript implementation
- MCP SDK v1.24.3 with stdio transport
- No existing tests or test framework
- Codebase map available at `.planning/codebase/`
- Key concerns identified: duplicated handlers, unsafe casting, no validation, no timeouts, unused dependency

## Constraints

- **Runtime**: Node.js 18+ with ES modules
- **Protocol**: MCP stdio transport (stdout reserved for protocol, logging to stderr only)
- **API**: Octopus Energy REST API v1 with Basic Auth
- **Compatibility**: Must remain compatible with Claude Desktop MCP configuration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Split into modules | 344 lines manageable but separation improves testability and maintainability | — Pending |
| Add tests | No existing tests, need to validate refactoring doesn't break behavior | — Pending |
| Keep feature scope unchanged | User wants to harden, not expand | — Pending |

---
*Last updated: 2026-02-18 after initialization*
