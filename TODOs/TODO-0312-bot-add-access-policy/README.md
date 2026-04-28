# TODO-0312 — Bot /add Access Policy (Public vs Admin-only)

**Status:** P1-Proposal

**Created:** 2026-04-26

---

## Current Decision (kept as-is)

`/add` and `/addwizard` are intentionally public right now.
Any Telegram user who can message the bot can start add-wizard enrollment.

---

## Proposal

Add a configurable access policy for add-wizard commands:

- `BOT_ADD_ACCESS=public` (default, current behavior)
- `BOT_ADD_ACCESS=admin_only` (requires `ADMIN_CHAT_IDS` membership)

---

## Why

- Keep current growth-friendly onboarding now
- Allow hardening later without code rewrite
- Make policy explicit in config/docs instead of implicit behavior

---

## Scope (future implementation)

- [ ] Add env var parsing in `bot/src/server.js`
- [ ] Gate `launchAddWizard` with policy check
- [ ] Add i18n message for denied access when admin-only is enabled
- [ ] Update `bot/README.md` and root docs
- [ ] Add regression tests for both modes (`public` and `admin_only`)

---

## Acceptance Criteria (future)

1. In `public` mode, non-admin chat can use `/add`.
2. In `admin_only` mode, non-admin chat gets access denied.
3. Existing admin flow keeps working in both modes.
4. Test coverage proves mode behavior.
