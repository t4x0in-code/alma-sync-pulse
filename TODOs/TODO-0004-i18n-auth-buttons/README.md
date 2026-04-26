# TODO-0004 — Auth Telegram button labels hard-coded German

**Priority:** P0
**Status:** done — 2026-04-25 · claude-sonnet-4-6 · commit 8f49556

## Problem

`POST /api/auth/request` sends an inline keyboard to admins. The button labels are hard-coded German strings:

```js
// bot/src/server.js ~line 559
{ text: "✅ Bestätigen", callback_data: `auth:ok:${requestId}` },
{ text: "❌ Ablehnen",   callback_data: `auth:deny:${requestId}` },
```

This contradicts the i18n system added in TODO-0105. An admin whose Telegram language is Russian or English sees German buttons.

## Root cause

These labels were written before i18n existed and were not updated during TODO-0105 implementation.

## Solution (KISS)

1. Add two keys to every locale in `bot/src/i18n.js`:
   - `auth_confirm_btn` — button label for ✅
   - `auth_deny_btn` — button label for ❌

2. In `server.js`, resolve admin language before building the keyboard:
   ```js
   const al = adminLangs.get(chatId) ?? "en";
   // ...
   { text: t(al, "auth_confirm_btn"), callback_data: `auth:ok:${requestId}` },
   { text: t(al, "auth_deny_btn"),   callback_data: `auth:deny:${requestId}` },
   ```

## TDD plan

- Manual test: send `/start` as a Russian-locale user, trigger login → buttons must appear in Russian
- Regression: German-locale admin still sees German buttons

## Dependencies

- `bot/src/i18n.js` — add 2 keys × 8 languages
- `bot/src/server.js` — use `t(al, ...)` for button labels

## Acceptance criteria

- [ ] Button labels respect `adminLangs` stored locale
- [ ] Falls back to English when locale unknown
- [ ] All 8 language dicts have both new keys
