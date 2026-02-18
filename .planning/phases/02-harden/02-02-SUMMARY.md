---
phase: 02-harden
plan: 02
subsystem: api
tags: [fetch, abort-signal, timeout, error-handling, fail-fast, startup-validation]

# Dependency graph
requires:
  - phase: 01-restructure
    provides: Modular api-client.ts and index.ts as standalone files to modify
provides:
  - 30-second fetch timeout via AbortSignal.timeout with contextual error messages
  - Fail-fast API key validation at process startup before server creation
  - Enriched API error messages including meter type and identifier

affects: [future phases that add new API calls or modify startup behavior]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AbortSignal.timeout(ms) passed as signal option to fetch for built-in timeout (Node 18+)"
    - "Try/catch around fetch checking DOMException name === 'TimeoutError' for timeout detection"
    - "Synchronous fail-fast check at module scope before async server setup"

key-files:
  created: []
  modified:
    - src/api-client.ts
    - src/index.ts

key-decisions:
  - "FETCH_TIMEOUT_MS constant defined at module level (30000ms) for single source of truth"
  - "TimeoutError check uses DOMException name check (not AbortError) per Node 18+ behavior"
  - "Defense-in-depth apiKey check preserved in api-client.ts; index.ts check is the primary gate"
  - "Fail-fast check placed at module scope (synchronous), not inside async run() function"

patterns-established:
  - "Timeout pattern: wrap fetch in try/catch, detect DOMException TimeoutError, rethrow with context"
  - "Error context pattern: include meter type and identifier in all API error messages"

requirements-completed: [ROBUS-01, ROBUS-02, ROBUS-03]

# Metrics
duration: 2min
completed: 2026-02-18
---

# Phase 2 Plan 02: Robustness Hardening Summary

**30-second fetch timeout via AbortSignal.timeout, fail-fast API key validation at startup, and contextual error messages naming meter type and identifier in all API errors**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-18T13:54:06Z
- **Completed:** 2026-02-18T13:56:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `FETCH_TIMEOUT_MS = 30000` constant and `AbortSignal.timeout` to every fetch call in api-client.ts
- Timeout errors are caught via `DOMException name === "TimeoutError"` and re-thrown with meter type and identifier context
- API HTTP errors now include meter type and identifier in the message for easier debugging
- Startup check in index.ts exits with code 1 and clear stderr message before `createServer()` if `OCTOPUS_API_KEY` is missing

## Task Commits

Each task was committed atomically:

1. **Task 1: Add fetch timeout and contextual error messages to API client** - `94448a9` (feat)
2. **Task 2: Add fail-fast API key check at startup** - `dfb16b8` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/api-client.ts` - Added FETCH_TIMEOUT_MS constant, AbortSignal.timeout to fetch, try/catch for TimeoutError, enriched error messages with meter type and identifier
- `src/index.ts` - Added synchronous fail-fast check for config.apiKey before createServer(), exits with code 1 and clear stderr message

## Decisions Made
- FETCH_TIMEOUT_MS constant at module level so timeout value appears once (used in AbortSignal.timeout call and in the human-readable error message)
- Node 18+ AbortSignal.timeout throws `DOMException` with `name === "TimeoutError"` (not `AbortError`), so TimeoutError check is used
- Defense-in-depth apiKey check in api-client.ts is preserved; the new index.ts check is the primary gate for normal server startup
- Fail-fast check runs at module scope (synchronously), not inside async `run()`, ensuring process exits before any transport connection

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 3 ROBUS requirements (ROBUS-01, ROBUS-02, ROBUS-03) fully addressed
- Phase 2 hardening complete; server now handles timeouts, missing keys, and provides clear error context
- No blockers for any future phase

---
*Phase: 02-harden*
*Completed: 2026-02-18*

## Self-Check: PASSED

- FOUND: src/api-client.ts
- FOUND: src/index.ts
- FOUND: .planning/phases/02-harden/02-02-SUMMARY.md
- FOUND commit: 94448a9 (Task 1)
- FOUND commit: dfb16b8 (Task 2)
