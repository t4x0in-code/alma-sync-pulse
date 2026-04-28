# Development Rules

## Deployment Rule (Critical)

**For any dev environment deployment or redeployment, use only `./deploy.sh` from the project root.**

Rationale:

1. This repository uses a current local `DEV_ENV` that is exposed to public DNS through an SSH tunnel.
2. Any local redeploy is immediately publicly accessible.
3. `deploy.sh` is the canonical, conflict-safe flow (stale container cleanup + rebuild + startup + health checks).

Mandatory for all agents:

1. Do not run ad-hoc compose commands as the primary deployment path.
2. Use `./deploy.sh` as the single source of truth for (re)deployment.
3. Treat deployment changes as public-facing immediately after local redeploy.
4. After any code/config fix or change intended for local dev, automatically run `./deploy.sh` from project root to redeploy and verify health checks.

## Agent Execution Policy (Critical)

Mandatory for all agents:

1. For every implemented fix/change, redeploy local `DEV_ENV` automatically via `./deploy.sh` unless the user explicitly says to skip deployment.
2. Never create a git commit without explicit user confirmation in the current conversation.
3. If deployment fails, report the failure with the relevant logs and stop before any commit action.

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
