# TODO-0006 — DELETE /api/admin/enrollments route typo (missing slash)

**Priority:** P0
**Status:** false-positive — already correct (see investigation)

## Problem

`bot/src/server.js` line 662:

```js
app.delete("/api/admin/enrollments:id", ...)  // BUG — missing /
```

Should be:

```js
app.delete("/api/admin/enrollments/:id", ...)
```

Express treats `:id` as a named param **within a path segment**. Without the slash, the route matches `/api/admin/enrollments123` instead of `/api/admin/enrollments/123`. All frontend calls to `DELETE /api/admin/enrollments/{id}` silently 404 — admins cannot delete enrollments.

## Root cause

Copy-paste typo. All sibling routes (`PATCH /api/admin/enrollments/:id`) are correct.

## Solution

One character: add `/` before `:id`.

## Investigation result

Verified `bot/src/server.js` line 666: route is `"/api/admin/enrollments/:id"` — slash is present. The grep output in the audit was reading from an older state of the file. No code change needed.

## Acceptance criteria

- [ ] `DELETE /api/admin/enrollments/1` returns HTTP 200 `{ ok: true }`
- [ ] `req.params.id` correctly receives the enrollment ID
