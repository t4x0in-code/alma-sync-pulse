# TODO-0108 — Bot commands expose raw SQLite error messages

**Priority:** P1
**Status:** open

## Problem

Two bot commands catch exceptions and forward the raw `e.message` directly to the user:

```js
// /match handler
} catch (e) {
  bot.sendMessage(msg.chat.id, `❌ ${e.message}`);
}

// /add_reserved handler
} catch (e) {
  bot.sendMessage(msg.chat.id, `❌ ${e.message}`);
}
```

Example raw SQLite error a user could see:
`UNIQUE constraint failed: pairs.class_id, pairs.leader_id, pairs.follower_id`

This leaks internal schema details and is untranslated.

## Root cause

Error handling was written before i18n. No generic error key exists.

## Solution (KISS)

1. Add a `db_error` key to all 8 locales in `i18n.js` — a generic message, e.g. `"❌ Operation failed."` (with optional detail for logging only).

2. Replace `bot.sendMessage(msg.chat.id, \`❌ ${e.message}\`)` with:
   ```js
   console.error("bot cmd error:", e.message);
   bot.sendMessage(msg.chat.id, t(l, "db_error"));
   ```

Specific known errors (UNIQUE constraint) can map to a friendlier `already_paired` key — handled as a stretch goal.

## TDD plan

- Test: try to `/match` the same two people twice → must get generic translated error, not raw SQL
- Verify: error still printed to container logs for debugging

## Dependencies

- `bot/src/i18n.js` — add `db_error` key × 8 languages
- `bot/src/server.js` — 2 catch blocks in `/match` and `/add_reserved`

## Acceptance criteria

- [ ] Raw `e.message` never reaches Telegram user
- [ ] Error logged to `console.error` for debugging
- [ ] Response uses i18n `db_error` key (translated)
