# TODO-0117 — `/add_reserved` → interactive Stammplatz wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/add_reserved CLASS_ID LL FF [note]` requires class ID, two 2-letter
nicks (exact format) and an optional note — all in one line.
Format is error-prone and unforgiving.

## Solution

```
/add_reserved
  → [class KB]            (skip if 1 class)
  → "Enter Leader nick:"  (2-letter text input, validated)
  → "Enter Follower nick:" (2-letter text input, validated)
  → "Enter note (optional):" [⏭️ Skip]
  → confirm card:
      "🔒 Add Stammplatz: LL–FF  note?"
      [✅ Confirm / ❌ Cancel]
  → INSERT reserved pair + show updated Stammplätze list
```

## Wizard state

```js
{ ns: "waddres", step: "class"|"leader_nick"|"follower_nick"|"note"|"confirm",
  classId, leaderNick, followerNick, note, expires }
```

## Callback namespace: `waddres`

| Callback data | Step | Action |
|---|---|---|
| `waddres:cls:<id>` | class | save classId, ask leader nick |
| `waddres:note:skip` | note | set note=null, show confirm |
| `waddres:confirm:yes` | confirm | INSERT reserved pair + list |
| `waddres:confirm:no` | confirm | cancel |

## Text input steps (bot.on("message"))

The wizard state Map is shared with `addWizardState` in TODO-0110.
`bot.on("message")` checks active wizard state and routes:
- `step === "leader_nick"`: validate /^[A-Za-z]{2}$/, save, ask follower
- `step === "follower_nick"`: validate same, save, ask note
- `step === "note"`: save note (any text ≤100 chars), show confirm

## i18n keys needed (DEFAULTS)

```
waddres_enter_leader:   "🕺 Enter Leader nick (2 letters, e.g. TO):"
waddres_enter_follower: "💃 Enter Follower nick (2 letters, e.g. MA):"
waddres_enter_note:     "📝 Enter note (optional):"
waddres_invalid_nick:   "❌ Must be exactly 2 letters (A-Z)."
waddres_confirm:        "🔒 Add Stammplatz *{l}–{f}*{note}?"
waddres_success:        "🔒 Stammplatz {l}–{f} added."
```

## TDD plan

- State machine: full path with note → INSERT
- State machine: full path note skipped → INSERT with note=null
- State machine: invalid nick → re-prompt (no state advance)
- State machine: cancel → no change
- State machine: expired guards

## Acceptance criteria

- [ ] `/add_reserved` (no args) launches wizard
- [ ] Old `/add_reserved ID LL FF` retired
- [ ] 2-letter nick validated — invalid input re-prompts
- [ ] Note is optional (Skip button)
- [ ] Confirm shows LL–FF + note before inserting
- [ ] On success: Stammplätze list sent
