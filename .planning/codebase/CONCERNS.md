# Codebase Concerns

**Analysis Date:** 2026-02-18

## Test Coverage Gaps

**No automated test suite:**
- What's not tested: All functionality - API integration, error handling, parameter validation, consumption data fetching
- Files: `src/index.ts` (344 lines of untested code)
- Risk: Critical functionality could break silently. No regression detection for API changes or parameter handling issues.
- Priority: High

**Manual .env file parsing not tested:**
- What's not tested: Edge cases in environment variable loading (empty values, malformed lines, special characters)
- Files: `src/index.ts` (lines 21-33)
- Risk: Silent failures if .env file has unexpected format. Malformed env vars could be silently skipped.
- Priority: Medium

## Input Validation Gaps

**No parameter validation:**
- Problem: Arguments from MCP calls are cast to types using TypeScript `as` operator without runtime validation
- Files: `src/index.ts` (lines 265-273 for electricity, 286-294 for gas)
- Risk: Invalid parameter types (negative pageSize, invalid dates, non-numeric pageSize) are passed to API without validation. API calls may fail with confusing errors from Octopus.
- Improvement path: Add runtime validation using schema validator (e.g., Zod) before passing to `fetchConsumption()`

**No MPAN/MPRN format validation:**
- Problem: MPAN and MPRN are not validated for correct format (length, numeric pattern)
- Files: `src/index.ts` (lines 108-126)
- Risk: Invalid identifiers are sent to API, producing cryptic "meter not found" errors instead of clear validation messages
- Improvement path: Add format validation - MPAN should be 13 digits, MPRN should be 10 digits

**No date/time format validation:**
- Problem: `periodFrom` and `periodTo` are not validated to be ISO 8601 format
- Files: `src/index.ts` (lines 136-137, 268-269, 289-290)
- Risk: Invalid dates are sent to API, producing unclear error messages
- Improvement path: Validate dates are ISO 8601 with UTC indicator before API call

**No page_size bounds checking:**
- Problem: pageSize parameter not validated against API limits (max 25000 mentioned in docs but not enforced)
- Files: `src/index.ts` (lines 138, 192-195 documentation)
- Risk: Large page_size values could be rejected by API with unclear errors
- Improvement path: Validate pageSize is between 1 and 25000

## Security Considerations

**API credentials in stdout:**
- Risk: Server outputs configuration status (including API key presence) to stderr during startup, visible in logs
- Files: `src/index.ts` (lines 328-336)
- Current mitigation: Only shows "✓ Set" without actual value
- Recommendations: Remove verbose credential checking from logs. Suppress all startup output to avoid accidental credential leakage in log aggregation systems.

**Hard-coded API base URL:**
- Risk: Production API endpoint is hard-coded, no ability to use staging/test endpoints
- Files: `src/index.ts` (line 36)
- Current mitigation: URL is documented and version-controlled
- Recommendations: Consider allowing override via environment variable for testing

**Basic auth credentials in memory:**
- Risk: API key stored in plaintext in memory as part of process environment
- Files: `src/index.ts` (lines 77, 145)
- Current mitigation: Process-level isolation in Node.js, .env file is .gitignored
- Recommendations: No additional mitigation possible in this architecture, but users should be aware credentials are in process memory

## Error Handling Issues

**Silent failure on .env file read:**
- Problem: If .env file exists but is unreadable (permission denied), error is silently caught and ignored
- Files: `src/index.ts` (lines 21-33)
- Cause: Broad catch block that swallows all errors
- Workaround: Manual verification that .env file is readable
- Improvement: Log permission errors to help debug configuration issues

**Minimal error context in API responses:**
- Problem: When API returns error (e.g., 401 Unauthorized, 404 Not Found), the response body is returned as-is without additional context
- Files: `src/index.ts` (lines 154-159)
- Risk: Users see raw API error messages which may be unclear (e.g., "Meter not found" without indicating which MPAN/MPRN was invalid)
- Improvement path: Enhance error messages to include request details (meter type, identifier used)

**No timeout handling:**
- Problem: fetch() calls have no timeout specified
- Files: `src/index.ts` (lines 147-152)
- Risk: Hung connections could cause MCP server to become unresponsive indefinitely
- Improvement path: Set timeout on fetch requests (e.g., 30 seconds)

**Generic error handling doesn't preserve error types:**
- Problem: All errors caught at line 309 are converted to string, losing error context and type information
- Files: `src/index.ts` (lines 309-320)
- Risk: Difficult to distinguish between network errors, auth errors, and validation errors in logs
- Improvement path: Preserve error type information in response

## Fragile Areas

**Single file monolith:**
- Files: `src/index.ts` (344 lines)
- Why fragile: All functionality (config loading, API client, MCP server setup, request handlers) in single file makes it difficult to test, maintain, and extend
- Safe modification: Any changes require understanding full file context. New features get added to same file, increasing complexity.
- Test coverage: 0% - no unit tests means any changes must be manually tested end-to-end

**Inconsistent parameter naming:**
- Problem: Internal parameters use camelCase (`serialNumber`, `periodFrom`) while MCP parameters use snake_case (`serial_number`, `period_from`)
- Files: `src/index.ts` (lines 46-55, 265-273)
- Why fragile: Easy to mix up parameter names when modifying handler logic, causing parameter mismatches
- Safe modification: Parameter conversion logic (lines 265-273, 286-294) should be extracted to helper function to prevent duplication

**Electricity and gas consumption handlers are duplicated:**
- Problem: Nearly identical code for handling electricity and gas consumption requests
- Files: `src/index.ts` (lines 264-284 vs 285-305)
- Why fragile: Any fix to one must be applied to both. Easy to miss one handler when fixing bugs.
- Safe modification: Extract common handler logic into reusable function

## Known Bugs

**Potential type casting bug with undefined values:**
- Symptoms: If MCP caller passes `null` or undefined for optional parameters, the `as string` cast could result in unexpected behavior
- Files: `src/index.ts` (lines 266-272)
- Trigger: Calling with `{"mpan": null, "serial_number": null}`
- Current behavior: `null` is cast to string "null" instead of being treated as undefined
- Workaround: Only pass parameters you want to set

**Date validation not enforced at MCP level:**
- Symptoms: Invalid date format accepted by MCP, rejected by Octopus API with unclear error
- Trigger: Call with `period_from: "2024-01-01"` (missing time component)
- Current behavior: Passed to API, fails with Octopus error message
- Workaround: Follow documentation and use ISO 8601 format with Z suffix

## Performance Bottlenecks

**No pagination handling in response:**
- Problem: If Octopus API returns `next` field with pagination token, it's ignored and only first page returned to user
- Files: `src/index.ts` (lines 161, 63-68 interface)
- Cause: Response is serialized to JSON immediately without checking pagination
- Improvement path: Implement response chunking or provide pagination token in returned data so caller can fetch subsequent pages

**Inefficient .env parsing:**
- Problem: Manual string splitting and parsing instead of using established library
- Files: `src/index.ts` (lines 21-33)
- Cause: Avoids dependency on dotenv package "for quiet loading"
- Impact: Minimal - .env is only parsed once at startup
- Improvement path: Consider using dotenv with quiet option instead of custom parser

## Missing Critical Features

**No input rate limiting:**
- Problem: No mechanism to prevent excessive API calls through rapid MCP invocations
- Risk: User could trigger thousands of API calls, hitting rate limits or incurring unexpected costs
- Blocks: Production-safe usage without external rate limiting

**No caching of consumption data:**
- Problem: Every request hits the Octopus API, no local cache
- Risk: Same query executed twice uses twice the API quota
- Blocks: Efficient repeated queries impossible

**No API quota tracking:**
- Problem: No monitoring of how many API calls have been made
- Risk: Users can exceed quota limits without warning
- Blocks: Quota management

**No support for tariff or standing charge data:**
- Problem: Only consumption endpoints supported, no access to pricing or tariff information
- Risk: Incomplete energy data available to Claude
- Blocks: Cost calculation features

## Scaling Limits

**Single-threaded execution:**
- Current capacity: Handles one API request at a time (stdio transport is sequential)
- Limit: If Octopus API is slow or unavailable, MCP server becomes unresponsive to other requests
- Scaling path: MCP protocol itself is sequential, limitation is architectural

**Memory usage:**
- Current capacity: Entire API response loaded into memory for JSON serialization
- Limit: Very large consumption datasets (e.g., 25000 page_size items) could consume significant memory
- Scaling path: Stream response data instead of buffering, implement pagination awareness

## Dependencies at Risk

**Minimal dependencies - Low risk:**
- `@modelcontextprotocol/sdk` ^1.24.3 - Core dependency, actively maintained by Anthropic
- `dotenv` ^17.2.3 - Loaded but not actually used (custom parser used instead)
- `@types/node` ^24.10.1 - Type definitions, no runtime risk

**Note:** dotenv is listed as dependency but custom parsing code bypasses it (lines 21-33), creating confusion about whether it's needed

## Environmental Configuration Issues

**No validation of required configuration:**
- Problem: If OCTOPUS_API_KEY is missing, error only thrown when API call attempted
- Files: `src/index.ts` (line 104)
- Risk: Server starts successfully but fails at first API call
- Improvement: Validate and fail fast at startup

**Configuration state not exposed:**
- Problem: Configuration validation output goes to stderr, no programmatic way to check configuration status
- Files: `src/index.ts` (lines 328-336)
- Risk: Automation scripts can't verify configuration before attempting operations

---

*Concerns audit: 2026-02-18*
