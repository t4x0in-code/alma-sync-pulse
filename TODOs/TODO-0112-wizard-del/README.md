# TODO-0112 — `/del` → interactive enrollment delete wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/del ENROLLMENT_ID` requires knowing a numeric ID from `/list`.
Two-command workflow with ID copy-paste — unusable on mobile.

## Solution

`/del` with no args launches an interactive picker:

```
/del
  → [class KB]          (skip if 1 class)
  → [enrollment KB]     (name + gender + age per button)
  → [✅ Confirm delete / ❌ Cancel]
  → DELETE + send updated list
```

## Wizard state

```js
{ ns: "wdel", step: "class"|"enrollment"|"confirm",
  classId, enrollmentId, enrollmentName, expires }
```

## Callback namespace: `wdel`

| Callback data | Step | Action |
|---|---|---|
| `wdel:cls:<id>` | class | save classId, show enrollment KB |
| `wdel:enroll:<id>` | enrollment | save enrollmentId, show confirm |
| `wdel:confirm:yes` | confirm | DELETE enrollment + pairs, print list |
| `wdel:confirm:no` | confirm | cancel |

## Enrollment KB format

One button per enrollment, label:
```
🕺 Name, age   (or 💃 Name, age)
```

## i18n keys needed (DEFAULTS)

```
wdel_select:    "👤 Select enrollment to delete:"
wdel_confirm:   "🗑 Delete *{name}*?"
wdel_success:   "🗑 {name} deleted."
wdel_empty:     "No enrollments to delete."
```

## TDD plan

- State machine: class → enrollment → confirm (yes) → success
- State machine: confirm no → cancelled, no DB change
- State machine: expired guard at each step
- Integration (REST proxy): DELETE enrollment reduces count by 1

## Acceptance criteria

- [ ] `/del` (no args) launches wizard
- [ ] Old `/del ID` syntax retired
- [ ] Empty class shows `wdel_empty` and stops
- [ ] Confirm shows enrollment name before delete
- [ ] On delete: updated list sent automatically
