# TODO-0115 — `/unpair` → interactive pair-delete wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/unpair PAIR_ID` requires knowing a numeric pair ID.

## Solution

```
/unpair
  → [class KB]       (skip if 1 class)
  → [all pairs KB]   (proposed + confirmed)
  → confirm card:
      "🗑 Delete pair: 🕺 NAME ↔ 💃 NAME?"
      [✅ Delete / ❌ Cancel]
  → DELETE pair + send updated list
```

## Wizard state

```js
{ ns: "wunpair", step: "class"|"pair"|"confirm",
  classId, pairId, leaderName, followerName, expires }
```

## Callback namespace: `wunpair`

| Callback data | Step | Action |
|---|---|---|
| `wunpair:cls:<id>` | class | save classId, show pairs KB |
| `wunpair:pair:<id>` | pair | save pairId + names, show confirm |
| `wunpair:confirm:yes` | confirm | DELETE pair + print list |
| `wunpair:confirm:no` | confirm | cancel |

## Pair KB format

Button label includes status badge:
```
🕺 LeaderName ↔ 💃 FollowerName  [proposed]
🕺 LeaderName ↔ 💃 FollowerName  [confirmed]
```

If no pairs: show `wunpair_no_pairs`.

## i18n keys needed (DEFAULTS)

```
wunpair_select_pair: "💞 Select pair to remove:"
wunpair_confirm:     "🗑 Remove pair *{leader}* ↔ *{follower}*?"
wunpair_success:     "🗑 Pair removed: {leader} ↔ {follower}"
wunpair_no_pairs:    "❌ No pairs to remove."
```

## TDD plan

- State machine: full path → pair deleted
- State machine: both proposed and confirmed pairs shown in picker
- State machine: cancel → no change
- State machine: expired guards

## Acceptance criteria

- [ ] `/unpair` (no args) launches wizard
- [ ] Old `/unpair ID` retired
- [ ] Both proposed and confirmed pairs shown
- [ ] Confirm shows pair names before delete
