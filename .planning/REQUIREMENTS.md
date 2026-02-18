# Requirements: Octopus Energy MCP Server

**Defined:** 2026-02-18
**Core Value:** Reliable, well-structured MCP server that returns accurate Octopus Energy consumption data with clear error messages when things go wrong.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Code Structure

- [x] **STRUC-01**: Source split into separate modules: types, API client, handlers, server, entry point
- [x] **STRUC-02**: Duplicated electricity/gas handler logic extracted into shared function

### Validation

- [x] **VALID-01**: Runtime validation of date parameters (ISO 8601 format with UTC indicator)
- [x] **VALID-02**: Runtime validation of MPAN format (13 digits) and MPRN format (10 digits)
- [x] **VALID-03**: Runtime validation of page_size (1-25000 range)
- [x] **VALID-04**: Safe parameter extraction from args (null/undefined handled correctly instead of unsafe casting)

### Robustness

- [x] **ROBUS-01**: Fetch timeout on API calls (30 second default)
- [x] **ROBUS-02**: Server fails fast at startup when OCTOPUS_API_KEY is missing
- [x] **ROBUS-03**: Enhanced error messages include request context (meter type, identifier used)

### Cleanup

- [x] **CLEAN-01**: Remove unused dotenv dependency from package.json
- [x] **CLEAN-02**: Keep manual .env parser (remove dotenv import references)

### Testing

- [x] **TEST-01**: Test framework installed and configured (Vitest)
- [x] **TEST-02**: Unit tests for API client (URL construction, auth headers, error handling)
- [x] **TEST-03**: Unit tests for input validation logic
- [x] **TEST-04**: Unit tests for parameter extraction and mapping

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Features

- **FEAT-01**: Tariff/pricing data endpoint
- **FEAT-02**: Account info endpoint (auto-discover meters)
- **FEAT-03**: Standing charges endpoint

### Infrastructure

- **INFRA-01**: CI/CD pipeline
- **INFRA-02**: npm publishing

## Out of Scope

| Feature | Reason |
|---------|--------|
| New API endpoints | Focus is hardening, not feature expansion |
| CI/CD pipeline | Local development only for now |
| npm publishing | Not needed yet |
| SSE/Streamable HTTP transport | Stdio sufficient for Claude Desktop |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRUC-01 | Phase 1 | Complete (01-01) |
| STRUC-02 | Phase 1 | Complete |
| CLEAN-01 | Phase 1 | Complete |
| CLEAN-02 | Phase 1 | Complete |
| VALID-01 | Phase 2 | Complete |
| VALID-02 | Phase 2 | Complete |
| VALID-03 | Phase 2 | Complete |
| VALID-04 | Phase 2 | Complete |
| ROBUS-01 | Phase 2 | Complete |
| ROBUS-02 | Phase 2 | Complete |
| ROBUS-03 | Phase 2 | Complete |
| TEST-01 | Phase 3 | Complete |
| TEST-02 | Phase 3 | Complete |
| TEST-03 | Phase 3 | Complete |
| TEST-04 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after 01-01 completion (STRUC-01 complete)*
