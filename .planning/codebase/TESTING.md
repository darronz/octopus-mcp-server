# Testing Patterns

**Analysis Date:** 2026-02-18

## Test Framework

**Status:**
- No test framework configured
- No test files present in codebase
- No test runner dependencies installed

**Available Commands:**
```bash
npm run build       # Compile TypeScript
npm run start       # Run compiled server
npm run dev         # Build and run
npm run watch       # Watch TypeScript compilation
```

**Testing Infrastructure:**
- Not detected: No Jest, Vitest, Mocha, or other test runners
- Not detected: No assertion libraries
- Not detected: No test configuration files

## Test File Organization

**Location:**
- No test files present - Pattern not established

**Naming:**
- Proposed pattern based on TypeScript convention: `*.test.ts` or `*.spec.ts`
- No existing tests to reference

**Structure:**
- Not established

## Testing Approach

**Current State:**
The codebase has no automated tests. The project is a single-file MCP server implementation that relies on:
- TypeScript's strict type checking
- Manual testing via the MCP protocol
- Integration testing through actual Octopus Energy API calls

**Testability Notes:**
- Class-based design allows for dependency injection and testing
- Methods are marked private/public appropriately for control flow
- Error handling is explicit and could be tested
- No external dependencies beyond MCP SDK and dotenv

## Test Coverage Gaps

**Untested Areas:**
- `fetchConsumption()` method: Core API integration logic
  - Files: `src/index.ts` (lines 99-162)
  - Risk: API integration errors would only be discovered at runtime
  - This includes URL building, query parameter formatting, authentication

- `setupHandlers()` method: Tool registration and request handling
  - Files: `src/index.ts` (lines 164-322)
  - Risk: Tool invocation logic could break silently
  - This includes parameter mapping, error wrapping, response formatting

- `.env` file parsing: Environment variable loading
  - Files: `src/index.ts` (lines 20-33)
  - Risk: Malformed .env files could cause silent failures
  - Tested implicitly but no explicit test coverage

- Configuration validation: Meter parameter validation
  - Files: `src/index.ts` (lines 103-127)
  - Risk: Missing configuration could be caught late
  - Error messages are good but validation itself untested

- API error handling: Non-200 HTTP responses
  - Files: `src/index.ts` (lines 154-159)
  - Risk: Different API error formats could cause parsing failures
  - Status code extraction and error message parsing not verified

- Tool parameter transformation: camelCase to snake_case mapping
  - Files: `src/index.ts` (lines 265-273, 286-294)
  - Risk: Parameter name mismatches could go unnoticed
  - Mapping between MCP schema (snake_case) and internal params (camelCase) not validated

**Priority: High**
- API integration test would catch real failures
- Tool parameter tests would prevent runtime errors
- Error handling tests would ensure graceful degradation

## Recommended Testing Strategy

**Unit Testing Setup** (if tests were added):
- Framework: Jest or Vitest (both work with TypeScript/Node.js)
- Mocking: Mock `fetch()` for API calls
- Structure: One test file per class/module

**Proposed Test Areas:**
```typescript
// Mock examples for testing patterns:
// 1. API Success Response
describe('fetchConsumption', () => {
  it('should build correct URL for electricity consumption', async () => {
    // Mock fetch to verify URL construction
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return error response
  });
});

// 2. Tool Handler Tests
describe('setupHandlers', () => {
  it('should map electricity parameters correctly', async () => {
    // Verify parameter transformation
  });

  it('should return error content on failure', async () => {
    // Verify error response structure
  });
});

// 3. Configuration Tests
describe('OctopusEnergyServer', () => {
  it('should load config from environment variables', () => {
    // Verify constructor config loading
  });

  it('should throw error when required params missing', async () => {
    // Verify validation logic
  });
});
```

## Mocking Approach (If Implemented)

**Global Fetch:**
- Mock `fetch()` globally to control API responses
- Return structured `Response` objects with `.ok`, `.status`, `.json()`, `.text()` methods

**Environment Variables:**
- Use `process.env` manipulation or test isolation
- Set/reset environment variables between test cases

**What to Mock:**
- `fetch()` calls to Octopus Energy API
- `process.env` for configuration testing
- File system calls (optional - .env is not critical)

**What NOT to Mock:**
- Class instantiation (`OctopusEnergyServer`)
- MCP SDK classes (would test only internal logic)
- Core business logic (want integration-style tests)

## Integration Testing

**Current Verification:**
- Manual testing only via the MCP protocol
- Real API calls to Octopus Energy
- Requires valid credentials in `.env` file

**E2E Tests:**
- Not configured
- Would require: MCP client library and test Octopus Energy account
- Scope: Full server startup → tool invocation → API response

## Error Testing Patterns (If Implemented)

**API Errors:**
```typescript
// Test structure for error handling
it('should throw on API error', async () => {
  const mockResponse = {
    ok: false,
    status: 401,
    text: async () => 'Unauthorized'
  };
  // fetch.mockResolvedValueOnce(mockResponse)
  // expect(() => server.fetchConsumption(...)).rejects.toThrow('401')
});
```

**Validation Errors:**
```typescript
// Test configuration validation
it('should throw when MPAN not provided', async () => {
  const server = new OctopusEnergyServer(); // No ELECTRICITY_MPAN env var
  // expect(() => server.fetchConsumption('electricity', {})).rejects.toThrow('MPAN is required')
});
```

**Graceful Failures:**
```typescript
// Test silent failure of .env loading
it('should start without .env file', () => {
  // Delete .env, instantiate server
  // expect(server.config.apiKey).toBeDefined() from other source
});
```

## Implementation Recommendations

**If Adding Tests Now:**

1. **Choose framework:** Vitest (faster) or Jest (more mature)
2. **Config file:** Create `vitest.config.ts` or `jest.config.js`
3. **Directory:** Create `src/__tests__/` or `tests/` directory
4. **Dependencies:** Add test runner + @types/jest or similar
5. **Scripts:** Add `npm run test` and `npm run test:watch` to package.json

**Test File Example Location:**
- `src/index.test.ts` (co-located with source)
- Or `tests/server.test.ts` (separate directory)

**Suggested package.json additions:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^0.34.0",
    "@vitest/ui": "^0.34.0"
  }
}
```

---

*Testing analysis: 2026-02-18*
