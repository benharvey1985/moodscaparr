<!-- generated-by: gsd-doc-writer -->

# Testing

## Test Framework and Setup

No test framework is currently configured in `package.json`. The project does not have any test runner (Jest, Vitest, Playwright, etc.) in its dependencies. There are no test files in the repository.

To add testing, a framework needs to be installed and configured. Suggested approach:

```bash
# For unit/integration tests
npm install -D vitest @vitejs/plugin-react

# For component tests
npm install -D @testing-library/react @testing-library/jest-dom

# For E2E tests
npm install -D @playwright/test
```

## Running Tests

No test commands are currently defined. Once a framework is added, update `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

## Writing New Tests

No test naming conventions or test helpers exist yet. When introducing tests, establish a convention such as:

- Unit tests: `src/**/*.test.ts` alongside the source files
- Component tests: `components/**/*.test.tsx` alongside components
- Test utilities: `test/setup.ts` or `test/helpers.ts`

## Coverage Requirements

No coverage thresholds are configured. Coverage can be added alongside the test framework:

```bash
# Vitest example with coverage
npm install -D @vitest/coverage-v8
```

## CI Integration

No CI workflows are configured (no `.github/workflows/` directory). CI can be added using GitHub Actions with a workflow that runs linting and tests on push/PR.
