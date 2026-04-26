# TODO-0110 — Shared wizard infrastructure (implement FIRST)

**Priority:** P1
**Status:** open
**Depends on:** none
**Blocks:** TODO-0111 through TODO-0121

## Problem

Every new wizard (del, match, confirm, unpair, block, open, capacity…) needs the same building blocks:
- Class picker (inline keyboard, auto-skip when only 1 class)
- Enrollment picker (inline keyboard from a filtered list)
- Pair picker (inline keyboard from existing pairs)
- Reserved-pair picker
- Generic confirm/cancel keyboard
- Wizard state Map + expiry cleanup
- Session-expired guard helper

Currently these are copy-pasted or invented per wizard. This TODO
extracts them into a shared `wizardKit` object so all 0111–0121 can
use them in one line.

## Solution

Create `bot/src/wizardKit.js` — a factory that receives `bot`, `t`,
`getClass`, `listClassesRaw`, `listEnrollments`, `listPairs`,
`listReserved` and returns:

```js
export function createWizardKit({ bot, t, ... }) {
  const states = new Map();   // chatId -> { ns, step, ...data }
  setInterval(cleanup, 60_000);

  return {
    // State management
    set(chatId, state),        // upsert
    get(chatId),               // returns state or undefined
    del(chatId),               // clear on complete/cancel

    // Guards
    guard(q, ns, step),        // answerCallbackQuery expired if wrong

    // Pickers (each returns a Promise from bot.sendMessage / editMessageText)
    classKb(chatId, ctx, callbackNs),          // inline KB of classes
    enrollmentKb(chatId, ctx, classId, ns),    // inline KB of enrollments
    pairKb(chatId, ctx, classId, ns, filter),  // inline KB of pairs
    reservedKb(chatId, ctx, classId, ns),      // inline KB of reserved pairs
    confirmKb(chatId, ctx, text, cbYes, cbNo), // confirm/cancel message

    // Shared i18n prompts
    expired(q),  // answerCallbackQuery with wizard_expired
  };
}
```

## Shared i18n keys to add to DEFAULTS

```
w_select_class:      "📋 Select a class:"
w_select_enrollment: "👤 Select an enrollment:"
w_select_pair:       "💞 Select a pair:"
w_select_reserved:   "🔒 Select a Stammplatz:"
w_confirm:           "✅ Confirm?"
w_cancelled:         "❌ Cancelled."
w_done:              "✅ Done."
w_no_items:          "❌ No items to select."
```

## Callback data convention

All wizard callbacks follow the pattern:
```
<ns>:<step>:<value>
```
- `ns` — wizard namespace (e.g. `wdel`, `wmatch`, `wblock`)
- `step` — current step name
- `value` — selected item ID or action (`cancel`, `confirm`)

State key stored per `chatId` with `{ ns, step, ...data, expires }`.

## TDD plan

- Unit: `set/get/del` round-trip
- Unit: `guard` returns false and triggers expired toast when state missing
- Unit: `guard` returns false when step mismatch
- Unit: `guard` returns true when state and step match

## Acceptance criteria

- [ ] `wizardKit.js` exported and imported in `server.js`
- [ ] `addWizardState` Map (current) migrated into `wizardKit`
- [ ] All existing wizard callbacks (`awiz:*`) still pass their tests
- [ ] Shared i18n keys added to DEFAULTS
