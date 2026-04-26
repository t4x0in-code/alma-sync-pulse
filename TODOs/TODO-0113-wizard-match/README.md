# TODO-0113 — `/match` → interactive pair-creation wizard

**Priority:** P1
**Status:** open
**Depends on:** TODO-0110

## Problem

`/match LEADER_ID FOLLOWER_ID` requires knowing two numeric IDs.
Core workflow — pairing is the app's main function — yet completely
inaccessible without running `/list` first and copying IDs.

## Solution

```
/match
  → [class KB]          (skip if 1 class)
  → [leader KB]         (unpaired Leaders only)
  → [follower KB]       (unpaired Followers only)
  → confirm card:
      "💞 Pair: 🕺 NAME ↔ 💃 NAME?"
      [✅ Create pair / ❌ Cancel]
  → INSERT pair (proposed) + send updated list
```

## Wizard state

```js
{ ns: "wmatch", step: "class"|"leader"|"follower"|"confirm",
  classId, leaderId, leaderName, followerId, followerName, expires }
```

## Callback namespace: `wmatch`

| Callback data | Step | Action |
|---|---|---|
| `wmatch:cls:<id>` | class | save classId, show leader KB |
| `wmatch:leader:<id>` | leader | save leaderId, show follower KB |
| `wmatch:follower:<id>` | follower | save followerId, show confirm |
| `wmatch:confirm:yes` | confirm | INSERT pair + print list |
| `wmatch:confirm:no` | confirm | cancel |

## Leader/Follower KB

Only shows unpaired enrollments of the correct gender.
If no unpaired leaders/followers: show `wmatch_no_leaders` / `wmatch_no_followers`.

## i18n keys needed (DEFAULTS)

```
wmatch_select_leader:   "🕺 Select Leader:"
wmatch_select_follower: "💃 Select Follower:"
wmatch_confirm:         "💞 Pair *{leader}* ↔ *{follower}*?"
wmatch_success:         "💞 Pair created: {leader} ↔ {follower}"
wmatch_no_leaders:      "❌ No unpaired Leaders available."
wmatch_no_followers:    "❌ No unpaired Followers available."
```

## TDD plan

- State machine: full path class → leader → follower → confirm → success
- State machine: no leaders → stops with message
- State machine: no followers → stops with message
- State machine: cancel at confirm → no DB change
- State machine: expired guards at each step
- Integration: pair appears in class after confirm

## Acceptance criteria

- [ ] `/match` (no args) launches wizard
- [ ] Old `/match ID ID` retired
- [ ] Only unpaired Leaders shown in leader picker
- [ ] Only unpaired Followers shown in follower picker
- [ ] Confirm card shows both names before creating
- [ ] On success: updated list with new pair shown
