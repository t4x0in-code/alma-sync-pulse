# TODO-0111 — `/add` → fully interactive wizard

**Priority:** P1
**Status:** done — 2026-04-25 · claude-sonnet-4-6
**Depends on:** TODO-0110

## Problem

`/add CLASS_ID L|F NAME [AGE]` requires the admin to know and type the
class ID, gender code, full name, and optional age in one line.
Nobody types IDs. The command is unusable in practice.

`/addwizard` already exists but is a separate command. `/add` still
accepts the one-liner form. Goal: make `/add` alone launch the same
wizard as `/addwizard`, retire the one-liner syntax.

## Solution

Change the regex from:
```js
bot.onText(/^\/add\s+(\S+)\s+(L|F)\s+(.+?)(?:\s+(\d{1,3}))?$/i, ...)
```
To:
```js
bot.onText(/^\/add$/, (msg) => { /* launch addwizard */ })
```

Internally: redirect to the existing `addwizardState` flow — same
code path as `/addwizard`. Keep `/addwizard` as an alias.

## Flow (already implemented in TODO-0007/0009)

```
/add  →  (same as /addwizard)
  class KB → gender KB → name text → age text/skip
  → avatar KB → confirm KB → INSERT + list
```

## Backward compatibility

Old one-liner `/add id L name` is retired. Anyone using it switches to
`/add` (interactive). No REST API change.

## i18n keys needed

None — reuses all `add_wizard_*` keys.

## TDD plan

- Unit: `/add` with no args triggers wizard state init (step = "class")
- Regression: existing wizard tests all pass unchanged

## Acceptance criteria

- [ ] `/add` (no args) starts the same wizard as `/addwizard`
- [ ] Old `/add CLASS_ID L|F NAME [AGE]` syntax no longer matched
- [ ] `/addwizard` still works as alias
- [ ] All existing 134 tests pass
