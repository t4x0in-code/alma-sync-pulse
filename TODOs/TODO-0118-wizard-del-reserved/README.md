# TODO-0118 — `/del_reserved` → interactive Stammplatz delete wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/del_reserved RESERVED_ID` requires a numeric ID from `/reserved`.

## Solution

```
/del_reserved
  → [class KB]           (skip if 1 class)
  → [Stammplätze KB]     (one button per reserved pair)
  → confirm card:
      "🗑 Delete Stammplatz LL–FF  note?"
      [✅ Delete / ❌ Cancel]
  → DELETE + show updated Stammplätze list
```

## Wizard state

```js
{ ns: "wdelres", step: "class"|"reserved"|"confirm",
  classId, reservedId, label, expires }
```

## Callback namespace: `wdelres`

| Callback data | Step | Action |
|---|---|---|
| `wdelres:cls:<id>` | class | save classId, show reserved KB |
| `wdelres:res:<id>` | reserved | save reservedId + label, confirm |
| `wdelres:confirm:yes` | confirm | DELETE + show list |
| `wdelres:confirm:no` | confirm | cancel |

## Reserved KB format

One button per reserved pair:
```
🔒 LL–FF  note
```

If empty: show `no_reserved` and stop.

## i18n keys needed (DEFAULTS)

```
wdelres_confirm: "🗑 Delete Stammplatz *{label}*?"
wdelres_success: "🗑 Stammplatz {label} deleted."
```
(reuse `no_reserved` for empty state)

## TDD plan

- State machine: full path → DELETE
- State machine: empty reserved list → stops
- State machine: cancel → no change
- State machine: expired guards

## Acceptance criteria

- [ ] `/del_reserved` (no args) launches wizard
- [ ] Old `/del_reserved ID` retired
- [ ] Empty list shows message and stops
- [ ] Confirm shows LL–FF before delete
