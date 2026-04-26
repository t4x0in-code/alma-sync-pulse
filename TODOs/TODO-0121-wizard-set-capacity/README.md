# TODO-0121 — `/set_capacity` → interactive capacity wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/set_capacity CLASS_ID N` requires class ID + exact number in one line.

## Solution

```
/set_capacity
  → [class KB]          (skip if 1 class)
  → "Enter new capacity:" (text input, validated 1–200)
  → confirm card:
      "📏 Set capacity of NAME to N? (current: M)"
      [✅ Confirm / ❌ Cancel]
  → PATCH max_capacity + send status line
```

## Wizard state

```js
{ ns: "wcap", step: "class"|"number"|"confirm",
  classId, classTitle, currentCap, newCap, expires }
```

## Callback namespace: `wcap`

| Callback data | Step | Action |
|---|---|---|
| `wcap:cls:<id>` | class | save classId + current cap, ask for number |
| `wcap:confirm:yes` | confirm | PATCH max_capacity = newCap |
| `wcap:confirm:no` | confirm | cancel |

## Text input: `step === "number"` (bot.on("message"))

- Parse integer, validate 1–200
- Invalid → re-prompt with error
- Valid → save newCap, show confirm

## i18n keys needed (DEFAULTS)

```
wcap_enter:      "📏 Enter new capacity (1–200):"
wcap_invalid:    "❌ Must be a number between 1 and 200."
wcap_confirm:    "📏 Set *{title}* capacity: {current} → {new}?"
wcap_success:    "📏 {title}: max {n}"
```

## TDD plan

- State machine: full path with valid number → PATCH
- State machine: invalid number → re-prompt, state unchanged
- State machine: cancel → no change
- State machine: expired guards
- Unit: number validation (1, 200 pass; 0, 201 fail)

## Acceptance criteria

- [ ] `/set_capacity` (no args) launches wizard
- [ ] Old `/set_capacity ID N` retired
- [ ] Invalid input re-prompts, does not advance
- [ ] Confirm shows current AND new capacity
- [ ] Single-class: no picker
