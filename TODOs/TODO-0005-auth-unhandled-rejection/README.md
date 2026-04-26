# TODO-0005 — Unhandled promise rejection in `POST /api/auth/request`

**Priority:** P0
**Status:** done — 2026-04-25 · claude-sonnet-4-6 · commit 8f49556

## Problem

`bot.sendMessage()` returns a Promise. In the auth endpoint, it is called without `.catch()`:

```js
// bot/src/server.js — inside POST /api/auth/request
bot.sendMessage(chatId, t(al, "auth_request", { pin }), { ... });
// ^ no .catch() — if Telegram API is unreachable, Node throws UnhandledPromiseRejection
```

An unhandled rejection in Node.js 15+ crashes the process (or at minimum logs an ugly uncaught error). In a Docker container this restarts the bot unexpectedly.

## Root cause

`bot.sendMessage()` is async. During auth request we call it inside a `for` loop but don't await or catch.

## Solution (KISS)

Add `.catch(() => {})` — same pattern already used correctly in `notifyAdmins()`:

```js
bot.sendMessage(chatId, t(al, "auth_request", { pin }), { ... }).catch(() => {});
```

Silent swallow is acceptable here: if Telegram is down the login flow will simply time out (poll returns `expired`), which is the correct degraded-mode UX.

## TDD plan

- Code review verification: confirm `.catch(() => {})` is present after the fix
- Integration: if Telegram token is invalid, `POST /api/auth/request` must return `{ requestId, pin }` without crashing the process

## Dependencies

- `bot/src/server.js` — single line change in `POST /api/auth/request`

## Acceptance criteria

- [ ] `bot.sendMessage()` inside auth request has `.catch(() => {})`
- [ ] No unhandled promise rejection when Telegram is unreachable
