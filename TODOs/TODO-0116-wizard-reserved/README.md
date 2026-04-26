# TODO-0116 — `/reserved` → auto class picker

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/reserved CLASS_ID` requires a class ID argument.
When only 1 class exists it's always the same ID — pointless typing.
When multiple classes, forces the admin to know the ID.

## Solution

Mirror the `/list` pattern already implemented:

```
/reserved
  → if 1 class:   show reserved list immediately
  → if N classes: [class KB] → then show reserved list
```

No confirm step — this is read-only display.

## Callback namespace: `wres`

| Callback data | Action |
|---|---|
| `wres:cls:<id>` | edit message to reserved list for that class |

## i18n keys needed (DEFAULTS)

```
wres_select_class: "🔒 Select class to view Stammplätze:"
```
(reuse existing `no_reserved` key for empty state)

## TDD plan

- Unit: single-class → no picker, direct list
- Unit: multi-class → picker shown

## Acceptance criteria

- [ ] `/reserved` (no args) works — no ID needed
- [ ] Old `/reserved ID` retired
- [ ] Auto-shows list when 1 class
- [ ] Class picker shown when multiple classes
