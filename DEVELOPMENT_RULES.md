# Development Rules

## Testing Rule (Critical)
**For every bug fix, degradation, or penalty, implement 2+ regression tests for the correspondent case-reason-of-error.**

Rationale: Prevents reintroduction of past issues. Each bug fix must come with tests verifying:
1. The bug is fixed (positive case)
2. The bug cannot regress (negative cases)

## TDD Flow
1. Write failing test first
2. Fix code until test passes
3. Verify all tests pass before commit

## Pre-commit Hook
- Tests run automatically before each commit
- Must pass all tests to allow commit

## Test Files Location
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests

## Related Files
- `tests/unit/i18n.test.ts` - i18n function tests
- `tests/unit/i18n-regression.test.ts` - Regression tests for i18n bugs
- `tests/unit/regression.test.ts` - General regression tests
- `tests/integration/bot-commands.test.ts` - Bot command tests