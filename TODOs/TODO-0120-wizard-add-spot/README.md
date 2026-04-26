# TODO-0120 — `/add_spot` → interactive +1 capacity wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/add_spot CLASS_ID` requires a class ID. A quick capacity bump should
be instant with zero typing.

## Solution

```
/add_spot
  → [class KB]     (skip if 1 class)
  → confirm card:
      "➕ Add 1 spot to NAME? (current: N)"
      [✅ Add / ❌ Cancel]
  → PATCH max_capacity + 1 + send status line
```

## Wizard state

```js
{ ns: "wspot", step: "class"|"confirm",
  classId, classTitle, currentCap, expires }
```

## Callback namespace: `wspot`

| Callback data | Step | Action |
|---|---|---|
| `wspot:cls:<id>` | class | save classId + cap, show confirm |
| `wspot:confirm:yes` | confirm | PATCH +1, send status |
| `wspot:confirm:no` | confirm | cancel |

## i18n keys needed (DEFAULTS)

```
wspot_confirm: "➕ Add 1 spot to *{title}*? (current: {n})"
wspot_success: "➕ {title}: {n} spots."
```

## TDD plan

- State machine: full path → capacity incremented
- State machine: cancel → unchanged
- State machine: expired guards

## Acceptance criteria

- [ ] `/add_spot` (no args) launches wizard
- [ ] Old `/add_spot ID` retired
- [ ] Confirm shows current capacity before change
- [ ] Single-class: no picker
