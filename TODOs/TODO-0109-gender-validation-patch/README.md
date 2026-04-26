# TODO-0109 — Gender not validated on `PATCH /api/admin/enrollments/:id`

**Priority:** P1
**Status:** done — 2026-04-25 · claude-sonnet-4-6 · commit 8f49556

## Problem

`PATCH /api/admin/enrollments/:id` allows patching `gender` to any arbitrary value:

```js
const allowed = ["name", "gender", "age", "email", "phone", "photo", "comment", "looking_for"];
const patch = {};
for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
// No validation — gender: "X" goes straight into the DB
```

`POST /api/admin/enrollments` correctly validates `gender !== "L" && gender !== "F"` (line 532), but PATCH does not. This creates inconsistent data that breaks gender-count queries and pairing logic.

## Root cause

PATCH was written with a generic allowlist but without per-field validation. The POST endpoint's validation was not reused.

## Solution (KISS)

Add a guard after building `patch`:

```js
if (patch.gender !== undefined && patch.gender !== "L" && patch.gender !== "F")
  return res.status(400).json({ error: "invalid gender" });
```

Same check already exists in POST — DRY principle: extract to a tiny helper or just inline the 1-liner.

## TDD plan

- Test: `PATCH /api/admin/enrollments/1` with `{ gender: "X" }` → HTTP 400 `{ error: "invalid gender" }`
- Test: `PATCH /api/admin/enrollments/1` with `{ gender: "F" }` → HTTP 200 `{ ok: true }`
- Test: `PATCH /api/admin/enrollments/1` without `gender` field → HTTP 200 (no regression)

## Dependencies

- `bot/src/server.js` — 3-line addition in `PATCH /api/admin/enrollments/:id`

## Acceptance criteria

- [ ] `gender: "X"` (or any non L/F) → HTTP 400
- [ ] `gender: "L"` or `"F"` → passes through
- [ ] Omitting `gender` → no change, no error
