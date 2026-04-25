# TODO-0107 — `PATCH /api/admin/pairs/:id` returns no 404 for missing pair

**Priority:** P1
**Status:** false-positive — already implemented (see investigation below)

## Problem

```js
// bot/src/server.js — PATCH /api/admin/pairs/:id
app.patch("/api/admin/pairs/:id", (req, res) => {
  const id = Number(req.params.id);
  // ... validates status ...
  db.prepare("UPDATE pairs SET status=? WHERE id=?").run(status, id);
  res.json({ ok: true });
});
```

If `id` does not exist in the DB, `UPDATE` runs with 0 changes and the endpoint still returns `{ ok: true }` with HTTP 200. The admin UI then shows "Updated" toast on a no-op.

## Root cause

`better-sqlite3` `.run()` returns a `RunResult` with `.changes`. The endpoint ignores it.

## Solution (KISS)

```js
const r = db.prepare("UPDATE pairs SET status=? WHERE id=?").run(status, id);
if (!r.changes) return res.status(404).json({ error: "pair not found" });
res.json({ ok: true });
```

Same pattern already used correctly in bot Telegram commands (`/confirm`, `/unpair`).

## TDD plan

- Test: `PATCH /api/admin/pairs/99999` with valid token → must return HTTP 404 `{ error: "pair not found" }`
- Test: `PATCH /api/admin/pairs/<valid_id>` → HTTP 200 `{ ok: true }`

## Dependencies

- `bot/src/server.js` — 2-line change in `PATCH /api/admin/pairs/:id`

## Investigation result

Verified `bot/src/server.js` line 691-700: the handler already does a SELECT before UPDATE:
```js
const cur = db.prepare("SELECT * FROM pairs WHERE id=?").get(id);
if (!cur) return res.status(404).json({ error: "not found" });
```
The audit agent reported this incorrectly. No code change needed. Moving to DONE as false-positive.

## Acceptance criteria

- [ ] Returns HTTP 404 `{ error: "pair not found" }` when pair does not exist
- [ ] Returns HTTP 200 `{ ok: true }` when pair exists and is updated
