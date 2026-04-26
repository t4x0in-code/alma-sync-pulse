# TODO-0008 — Wizard: silent state-loss + missing post-enroll list

**Priority:** P0
**Status:** done — 2026-04-25 · claude-sonnet-4-6

## Root cause (confirmed by log + DB inspection)

`addWizardState` is an **in-memory Map**. When the bot container restarts
(deploy, crash, restart), the Map is wiped. Any in-flight wizard session
becomes a ghost: the Telegram inline buttons still exist, the user taps ✅,
but `addWizardState.get(chatId)` returns `undefined`.

Current code at `awiz:confirm:yes`:
```js
const state = addWizardState.get(chatId);
if (!state || state.step !== "confirm") return bot.answerCallbackQuery(q.id);
```
Silent `return` → user sees nothing, DB is not touched.

## Bugs to fix

### Bug A — Silent failure on state-loss
When `state` is missing at confirm, tell the user to restart:
```js
if (!state || state.step !== "confirm") {
  return bot.answerCallbackQuery(q.id, { text: t(q, "wizard_expired") });
}
```
Add `wizard_expired` i18n key: `"⚠️ Session expired. Use /addwizard to start over."`

Same guard needed for `awiz:age:skip` (same risk).

### Bug B — No feedback after enrollment
After successful INSERT, the bot only edits the confirm message to
`add_wizard_success`. The admin has to manually run `/list` to see the
updated roster.

**Fix (KISS):** after the success edit, send a fresh enrollment list
(same format as `/list`).

## Solution

1. Add `wizard_expired` key to i18n DEFAULTS
2. Replace silent guards with `answerCallbackQuery(..., { text: t(q, "wizard_expired") })`
3. After successful wizard INSERT, call the same list-printing logic used by `/list`
   — extract it into a shared `sendEnrollmentList(chatId, ctx, classId)` helper

## Acceptance criteria

- [ ] Tapping ✅ after bot restart shows "Session expired" toast — no silent fail
- [ ] Tapping ⏭️ Skip after bot restart shows same expired toast
- [ ] After successful wizard enrollment, bot immediately sends updated list
- [ ] `/list` command and post-wizard list use the same helper (DRY)
- [ ] Tests updated to cover expired-state branch
