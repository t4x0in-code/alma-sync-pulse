# DONE.md — Completed TODOs (knowledge base)

> Read this before starting new tasks — tested solutions live here.
> Format: closure stamp = date · model · commit

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

**Problem:** `/match` and `/add_reserved` catch blocks sent `\`❌ ${e.message}\`` directly to Telegram users, leaking internal schema details (e.g. `UNIQUE constraint failed: pairs.class_id, ...`).

**Solution:** Added `db_error` key to all 8 locales. Replaced `bot.sendMessage(..., \`❌ ${e.message}\`)` with `console.error("...", e.message); bot.sendMessage(..., t(l, "db_error"))`. Error still reaches logs; user sees generic translated message.

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
- `str.replaceAll(\`{${k}}\`, String(v ?? ""))` — dead simple `{placeholder}` interpolation
- Store user locale on first interaction (`/start`), not on every message — one Map lookup per command
- `notifyAdmins` function-overload pattern: pass a `(lang) => string` factory when you need per-recipient translation

**Files changed:** `bot/src/i18n.js` (new), `bot/src/server.js`
