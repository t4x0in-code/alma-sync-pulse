# TODO-0114 — `/confirm` → interactive pair-confirm wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/confirm PAIR_ID` requires knowing a numeric pair ID.
The admin must run `/status` or `/list`, find the pair ID, then type it.
Two-command workflow with ID copy-paste.

## Solution

```
/confirm
  → [class KB]          (skip if 1 class)
  → [proposed pairs KB] (only status="proposed" pairs)
  → confirm card:
      "✓ Confirm pair: 🕺 NAME ↔ 💃 NAME?"
      [✅ Confirm / ❌ Cancel]
  → UPDATE pair status="confirmed" + send updated list
```

## Wizard state

```js
{ ns: "wconf", step: "class"|"pair"|"confirm",
  classId, pairId, leaderName, followerName, expires }
```

## Callback namespace: `wconf`

| Callback data | Step | Action |
|---|---|---|
| `wconf:cls:<id>` | class | save classId, show proposed pairs KB |
| `wconf:pair:<id>` | pair | save pairId + names, show confirm |
| `wconf:confirm:yes` | confirm | PATCH pair status → confirmed + list |
| `wconf:confirm:no` | confirm | cancel |

## Pair KB format

One button per proposed pair:
```
🕺 LeaderName ↔ 💃 FollowerName
```

If no proposed pairs: show `wconf_no_pairs`.

## i18n keys needed (DEFAULTS)

```
wconf_select_pair: "💞 Select pair to confirm:"
wconf_confirm:     "✓ Confirm *{leader}* ↔ *{follower}*?"
wconf_success:     "✓ Pair confirmed: {leader} ↔ {follower}"
wconf_no_pairs:    "❌ No proposed pairs to confirm."
```

## TDD plan

- State machine: class → pair → confirm yes → status="confirmed"
- State machine: no proposed pairs → stops with message
- State machine: cancel → no DB change
- State machine: expired guards

## Acceptance criteria

- [ ] `/confirm` (no args) launches wizard
- [ ] Old `/confirm ID` retired
- [ ] Only `status="proposed"` pairs shown
- [ ] Confirm card shows both names
- [ ] On confirm: updated pair list sent
