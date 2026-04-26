# TODO-0007 — Fix /addwizard: missing `bot.on("message")` text handler

**Priority:** P0
**Status:** done — 2026-04-25 · claude-sonnet-4-6

## Root cause (verified)

`bot/src/server.js` wizard flow stops at step `"name"`:
1. `/addwizard` → class keyboard ✅
2. `awiz:cls:X` callback → gender keyboard ✅
3. `awiz:gender:X` callback → edits message to "📝 Enter name:" ✅
4. User types name → **NOTHING** — no `bot.on("message")` handler exists ❌

Additional bug found: `callback_query` handler at line 502 references
`requestId` which is out of scope (should be `val = parts[2]`).

## Full wizard flow to implement

```
/addwizard
  → [class keyboard]
  → awiz:cls:<id>   → [gender keyboard]
  → awiz:gender:<L|F> → sends "Enter name:"
  → user types name  → sends "Enter age: [Skip]"
  → user types age OR awiz:age:skip → sends confirm message with [✅ OK] [❌ Cancel]
  → awiz:confirm:yes → INSERT to DB → success message
  → awiz:confirm:no  → cancel message
```

## Changes required

### `bot/src/i18n.js` (DEFAULTS only)
Add 3 keys:
- `add_wizard_yes: "✅ Confirm"`
- `add_wizard_no: "❌ Cancel"`
- `add_wizard_skip: "⏭️ Skip"`

### `bot/src/server.js`
1. **Fix `requestId` → `val`** at lines 502 + 504 (auth block in callback_query)
2. **Add `sendWizardConfirm()` helper** inside `if (TELEGRAM_TOKEN)` block
3. **Add `awiz:age:skip` case** to callback_query handler
4. **Add `awiz:confirm:yes/no` case** to callback_query handler
5. **Add `bot.on("message")` handler** — processes name/age text steps

### `tests/integration/bot-commands.test.ts`
Add wizard DB-layer tests: complete wizard state machine → DB insert
(REST API proxy: `POST /api/admin/enrollments` mirrors wizard's final step)

## Acceptance criteria

- [ ] Full wizard completes: class → gender → name → age → confirm → DB row inserted
- [ ] Age skip via button works (age = null in DB)
- [ ] Cancel clears wizard state, no DB row
- [ ] Typing a command (`/status`) during wizard does not corrupt state
- [ ] `requestId` bug fixed — auth confirm/deny no longer errors silently
- [ ] Tests cover wizard final-step DB insert + age-null case
