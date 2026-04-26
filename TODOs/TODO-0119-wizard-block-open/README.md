# TODO-0119 — `/block` + `/open` → interactive class status wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/block CLASS_ID` and `/open CLASS_ID` require typing a class ID.

## Solution

Both commands launch the same wizard — only the target status differs:

```
/block  (or /open)
  → [class KB]      (skip if 1 class)
  → confirm card:
      "🔒 Close class NAME?" (or "🔓 Open class NAME?")
      [✅ Confirm / ❌ Cancel]
  → PATCH class status + send status summary
```

## Wizard state

```js
{ ns: "wstatus", step: "class"|"confirm",
  classId, targetStatus, classTitle, expires }
```

## Callback namespace: `wstatus`

| Callback data | Step | Action |
|---|---|---|
| `wstatus:cls:<id>` | class | save classId + title, show confirm |
| `wstatus:confirm:yes` | confirm | PATCH status + send summary |
| `wstatus:confirm:no` | confirm | cancel |

The `targetStatus` ("closed"/"open") is stored in state when the
command is invoked — determines the confirm message text and the PATCH value.

## i18n keys needed (DEFAULTS)

```
wstatus_confirm_block: "🔒 Close class *{title}*?"
wstatus_confirm_open:  "🔓 Open class *{title}*?"
wstatus_blocked:       "🔒 {title} is now closed."
wstatus_opened:        "🔓 {title} is now open."
```

## TDD plan

- State machine: /block → class → confirm yes → status="closed"
- State machine: /open → class → confirm yes → status="open"
- State machine: cancel → no change
- State machine: expired guards

## Acceptance criteria

- [ ] `/block` (no args) launches wizard with targetStatus="closed"
- [ ] `/open` (no args) launches wizard with targetStatus="open"
- [ ] Old `/block ID` and `/open ID` retired
- [ ] Confirm card shows class name and target action
- [ ] Single-class: skip class picker
