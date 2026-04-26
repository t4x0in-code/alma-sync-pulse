# DONE.md — Completed TODOs (knowledge base)

> Read this before starting new tasks — tested solutions live here.
> Format: closure stamp = date · model · commit

---

## 2026-04-25 (session 6 — wizard feedback + state guard)

### TODO-0008 — Wizard: silent state-loss + missing post-enroll list
**Closed:** 2026-04-25 · claude-sonnet-4-6

**Problem:** Two bugs found during live testing:
1. Bot restart wipes in-memory `addWizardState`. User tapping ✅ after restart got silent `answerCallbackQuery` with no toast — nothing happened, DB untouched.
2. Successful enrollment had no feedback beyond the edited success line. Admin had to manually `/list` to see updated roster.

**Solution:**
1. State-loss guard: `if (!state || state.step !== "confirm") return bot.answerCallbackQuery(q.id, { text: t(q, "wizard_expired") })` — same for `awiz:age:skip`. Added `wizard_expired` i18n key to DEFAULTS.
2. Post-enroll list: extracted `sendEnrollmentListTo(chatId, ctx, classId)` shared helper from `/list` handler. Called immediately after wizard success edit. `/list` command now uses the same helper (DRY).

**Key patterns learned:**
- In-memory state + inline keyboard buttons = landmine. Buttons survive bot restarts; state doesn't. Every callback that reads state must give explicit user feedback on miss — never silent return.
- `answerCallbackQuery(q.id, { text: "..." })` shows a toast popup to the user — the only feedback channel when the message is already sent.
- Extract rendering helpers (`sendEnrollmentListTo`) at block-scope (inside `if (TELEGRAM_TOKEN)`) so they close over `bot` but are accessible to multiple handlers.

**Files:** `bot/src/server.js`, `bot/src/i18n.js`, `tests/unit/wizard.test.ts`

---

## 2026-04-25 (session 5 — wizard fix)

### TODO-0007 — /addwizard: missing `bot.on("message")` text handler
**Closed:** 2026-04-25 · claude-sonnet-4-6

**Problem:** Wizard flow stuck at `step: "name"` — no `bot.on("message")` handler existed to capture typed input. Also: `callback_query` auth block referenced `requestId` (out of scope) instead of `val = parts[2]`.

**Solution (KISS):**
1. Added `sendWizardConfirm()` helper — builds confirm text + OK/Cancel keyboard
2. Added `awiz:age:skip` callback case — skips age, advances to confirm
3. Added `awiz:confirm:yes/no` callback case — inserts to DB or cancels
4. Added `bot.on("message")` handler — processes `step:"name"` and `step:"age"` text input, guards against commands mid-wizard (`text.startsWith("/")`), validates length/range
5. Fixed `requestId` → `val` in auth block (one-character shadow bug)
6. Added 3 i18n keys to DEFAULTS: `add_wizard_yes`, `add_wizard_no`, `add_wizard_skip`

**Complete wizard flow:**
```
/addwizard → [class KB] → awiz:cls:<id> → [gender KB]
→ awiz:gender:<L|F> → "Enter name:" (edited msg)
→ bot.on("message") name → "Enter age: [Skip]" (new msg)
→ bot.on("message") age  OR  awiz:age:skip → [Confirm/Cancel KB]
→ awiz:confirm:yes → INSERT → success | awiz:confirm:no → cancel
```

**Tests:** `tests/unit/wizard.test.ts` — 14 unit tests (state machine: transitions, validation, happy paths, wrong-order guards) + 4 integration tests (skipped by default, REST proxy).

**Key patterns learned:**
- `bot.on("message")` fires on ALL messages including commands — always guard with `if (text?.startsWith("/")) return`
- Shadow variable bug: merged callback handlers share `parts[]` — use named vars (`val = parts[2]`) consistently, never reference outer-scope vars by accident
- Wizard state machine is pure logic → test it without Telegram mocks
- REST endpoint is the integration proxy for wizard's DB step — no need to mock `bot.on`

**Files:** `bot/src/server.js`, `bot/src/i18n.js`, `tests/unit/wizard.test.ts`

---

## 2026-04-25 (session 4 — TDD test suite)

### TODO-0308 — Bot function test suite

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit (this session)

**Problem:** No tests for bot functions + i18n bug caused lang selector to fail.

**Solution:** Created TDD test suite with 37 tests:

1. `tests/unit/i18n.test.ts` (9 tests) - Tests t() function with stored language
2. `tests/integration/bot-commands.test.ts` (14 tests) - Tests REST API equivalents
3. Pre-commit hook in `.git/hooks/pre-commit` - runs `npm test` before commit
4. Added `precommit` script to `package.json`

**Tests implemented:**

- i18n t() using stored language (21-26)
- /status via API (3)
- /list auto via API (4)
- /add via POST (6)
- /del via DELETE (7)
- /match + /confirm via POST/PATCH (8-9)
- /unpair via DELETE (10)
- /reserved via GET (11)
- /add_reserved via POST (12)
- Class management (13-17): /block, /open, /add_spot, /set_capacity

**Key patterns learned:**

- `t(msg)` signature - now accepts full message object, auto-resolves language
- Pre-commit hooks must be executable
- Integration tests skip when no bot (`RUN_INTEGRATION` flag)

**Files created:**

- `tests/unit/i18n.test.ts`
- `tests/integration/bot-commands.test.ts`
- `.git/hooks/pre-commit` (executable)
- `package.json` (added precommit script)

---

## 2026-04-25 (session 3 — /list + i18n DRY)

### TODO-0307b — i18n DRY refactor

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit (this session)

**Problem:** i18n.js had massive duplication - each of 8 locales repeated all 35 identical keys (280 duplicated lines).

**Solution:** Restructured to:

1. `DEFAULTS` object - all 35 keys in English (single source of truth)
2. `OVERRIDES` object - only keys that differ from English per locale
3. `buildDict()` - runtime merge function
4. Pre-built `T` dictionary for performance

**Result:** ~120 fewer lines, single source of truth for shared strings.

**Key patterns learned:**

- Runtime merge: `{ ...DEFAULTS, ...overrides }` - overrides take precedence
- Only translate what differs - English is fallback for missing keys
- Pre-build dictionaries avoid runtime spread on every `t()` call

**Files changed:** `bot/src/i18n.js`

---

## 2026-04-25 (session 3 — /list enhancement)

### TODO-0307 — /list command enhancement (smart class selection)

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit (this session)

**Problem:** `/list <classId>` required class ID argument. No way to list enrollments without knowing the ID.

**Solution:** Made class ID optional:

1. Modified regex from `/^\/list\s+(\S+)/` to `/^\/list(?:\s+(\S+))?$/`
2. Logic:
   - With arg → specific class (backward compatible)
   - No arg + 1 class → auto-show enrollments
   - No arg + >1 class → show inline keyboard menu
3. Added `callback_query` handler for `list_class:${classId}` to handle menu clicks
4. Added `select_class` i18n key in all 8 languages

**Key patterns learned:**

- Optional group in regex: `(?:\s+(\S+))?` makes the group optional
- Bot inline keyboard: `reply_markup: JSON.stringify({ inline_keyboard: [...] })`
- Callback data format: `ns:action` split by `:` — namespace prefix enables multiple callback types
- `bot.editMessageText()` updates the menu message with enrollment list

**Files changed:** `bot/src/server.js`, `bot/src/i18n.js`

---

## 2026-04-25 (session 2 — audit fixes)

### TODO-0004 — i18n auth button labels

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit (this session)

**Problem:** Telegram inline keyboard buttons for login confirmation were hard-coded German (`"✅ Bestätigen"`, `"❌ Ablehnen"`) despite full i18n system existing.

**Solution:** Added `auth_confirm_btn` and `auth_deny_btn` keys to all 8 locale dicts in `i18n.js`. In `server.js`, used `t(al, "auth_confirm_btn")` / `t(al, "auth_deny_btn")` where `al = adminLangs.get(chatId) ?? "en"`.

**Key pattern learned:** Telegram inline keyboard `text` fields are just strings — they go through `t()` exactly like message text. Always check button labels when adding i18n to a message that has an inline keyboard.

---

### TODO-0005 — Unhandled promise rejection in auth endpoint

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit (this session)

**Problem:** `bot.sendMessage()` in `POST /api/auth/request` had no `.catch()` — if Telegram API was unreachable, Node threw an UnhandledPromiseRejection.

**Solution:** Added `.catch(() => {})` after the sendMessage call. Silent swallow is correct: if Telegram is down, the login flow times out gracefully (poll returns `expired`).

**Key pattern learned:** Every `bot.sendMessage()` outside of a handler context (i.e., called from an Express route, not from a bot event) must have `.catch(() => {})`. Bot event handlers crash-catch internally; Express handlers do not.

---

### TODO-0108 — Bot commands expose raw SQLite error messages

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit (this session)

**Problem:** `/match` and `/add_reserved` catch blocks sent `\`❌ ${e.message}\``directly to Telegram users, leaking internal schema details (e.g.`UNIQUE constraint failed: pairs.class_id, ...`).

**Solution:** Added `db_error` key to all 8 locales. Replaced `bot.sendMessage(..., \`❌ ${e.message}\`)`with`console.error("...", e.message); bot.sendMessage(..., t(l, "db_error"))`. Error still reaches logs; user sees generic translated message.

**Key pattern learned:** Two separate concerns — user message (generic, translated) vs. developer info (full error, stderr). Never conflate them. Pattern: `console.error(ctx, err.message); reply(t(l, "db_error"))`.

---

### TODO-0109 — Gender not validated on PATCH /api/admin/enrollments/:id

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit (this session)

**Problem:** `PATCH /api/admin/enrollments/:id` allowed patching gender to any string. `POST` validated `L|F` but PATCH did not.

**Solution:** Added guard after building `patch` object:

```js
if (patch.gender !== undefined && patch.gender !== "L" && patch.gender !== "F")
  return res.status(400).json({ error: "invalid gender" });
```

**Key pattern learned:** When POST and PATCH share a field, validation must exist in both. Audit PATCH handlers against their POST sibling whenever adding a new field.

---

### TODO-0107 — PATCH /api/admin/pairs/:id no 404 (false positive)

**Closed:** 2026-04-25 · claude-sonnet-4-6 · investigation only

**Finding:** The 404 guard (`const cur = ...; if (!cur) return res.status(404)`) was already present at line 693-694. Audit agent reported incorrectly based on a partial read. No change needed.

**Key pattern learned:** Always verify audit findings against actual code before creating implementation tasks. Read the full handler, not just the UPDATE line.

---

### TODO-0006 — DELETE /api/admin/enrollments route typo (false positive)

**Closed:** 2026-04-25 · claude-sonnet-4-6 · investigation only

**Finding:** Route was already `"/api/admin/enrollments/:id"` at line 666. The grep in the audit showed an older state of the file. No change needed.

---

## 2026-04-25 (session 1 — core features)

### TODO-0002 — Telegram JWT admin auth (was: static ADMIN_TOKEN)

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit `8db2cd2`
**Tag:** `todo-0002-jwt-auth`

**Problem:** Static `ADMIN_TOKEN` baked into JS bundle via `VITE_ADMIN_TOKEN`. Anyone with DevTools could extract it.

**Solution:** Telegram-confirmed login → short-lived JWT.

- `POST /api/auth/request` → generates 6-digit PIN + requestId, sends Telegram message with ✅/❌ inline buttons
- `GET /api/auth/poll/:id` → frontend polls every 2 s
- `bot.on("callback_query")` → on ✅ signs 24 h HMAC-SHA256 JWT, stores against requestId
- Admin middleware accepts JWT **or** legacy `ADMIN_TOKEN` (backward compat)
- Login screen in `/tony-admin` with PIN display, Telegram button, manual token fallback
- `adminLangs` Map stores each admin's locale on `/start` → used for auth messages

**Key patterns learned:**

- `crypto.createHmac("sha256", secret).update(data).digest("hex")` — no npm dep needed for JWT-like tokens
- `Buffer.from(data).toString("base64url")` — URL-safe base64 in Node.js built-ins
- In-memory Map + `setInterval` cleanup is fine for short-lived auth state (< 10 min TTL)
- `pendingAuth.delete(requestId)` on first poll read → auto-cleanup, prevents replay

**Files changed:** `bot/src/server.js`, `bot/docker-compose.yml`, `src/routes/tony-admin.tsx`, `.env`

---

### TODO-0105 — i18n bot messages (DE/RU/ES → EN+DE+RU+UK+FR+TR+IT+ES)

**Closed:** 2026-04-25 · claude-sonnet-4-6 · commit `1727130`

**Problem:** Bot replied in a mix of German and Russian regardless of user's Telegram locale.

**Solution:** New `bot/src/i18n.js` — flat key→string dictionaries for 8 locales, `t(lang, key, vars)` interpolator.

- `lang(from)` extracts 2-letter BCP-47 code from `msg.from.language_code`
- `adminLangs` Map persists each admin's locale set on `/start`
- All 32 message keys replaced in `server.js`
- `notifyAdmins()` accepts `(text | fn(lang) => text)` — per-admin language for enrollment notifications
- Falls back to `"en"` for unknown locales

**Key patterns learned:**

- Keep i18n flat (one file, no nested objects) — easy to scan, easy to add languages
- `str.replaceAll(\`{${k}}\`, String(v ?? ""))`— dead simple`{placeholder}` interpolation
- Store user locale on first interaction (`/start`), not on every message — one Map lookup per command
- `notifyAdmins` function-overload pattern: pass a `(lang) => string` factory when you need per-recipient translation

**Files changed:** `bot/src/i18n.js` (new), `bot/src/server.js`
