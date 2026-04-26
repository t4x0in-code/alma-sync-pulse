# TODO-0009 — Wizard emoji avatar picker

**Priority:** P1
**Status:** done — 2026-04-25 · claude-sonnet-4-6

## Goal

Replace the absent photo step in `/addwizard` with a one-tap emoji face
picker. Web enrollment keeps real photo upload unchanged.

## Wizard flow change

```
Before: class → gender → name → age → confirm
After:  class → gender → name → age → avatar → confirm
```

## Emoji set (12 faces, 2 rows of 6 + Skip)

```
Row 1: 🧑 👩 👨 👱 👱‍♀️ 🧔
Row 2: 👩‍🦱 👩‍🦰 👩‍🦳 👨‍🦱 👨‍🦰 👨‍🦳
Row 3: [⏭️ Skip]
```

## Storage

Stored in existing `enrollments.photo` column as `"emoji:🧑"`.

- Prefix `emoji:` distinguishes from real photos (data URLs / https://)
- No schema change, fully backward-compatible

## Files to change

### `bot/src/i18n.js`
Add to DEFAULTS: `add_wizard_avatar: "🎭 Pick your avatar:"`

### `bot/src/server.js`
1. Add `photo: null` to wizard state init
2. Add `sendAvatarPicker(chatId, ctx)` helper — sends emoji inline keyboard
3. Age step (text + skip) → `step: "avatar"` instead of `"confirm"`
4. Add `awiz:avatar` callback handler → saves `"emoji:<e>"` or `null`, → confirm
5. `awiz:avatar` state-loss guard → `wizard_expired` toast
6. `sendWizardConfirm` — show emoji (strip prefix) or "—" in preview

### `src/routes/tony-admin.tsx` — EnrollmentRow
```tsx
// Before: only img or gender-icon fallback
// After: detect emoji: prefix → render large emoji in circle
e.photo?.startsWith("emoji:") → <div>…{e.photo.slice(6)}</div>
```

## TDD plan

- State machine unit test: age → avatar transition
- State machine unit test: avatar → confirm with emoji stored correctly
- State machine unit test: avatar skip → confirm with photo null
- State machine unit test: expired guard at avatar step
- No new integration tests needed (DB insert path unchanged)

## Acceptance criteria

- [ ] `/addwizard` shows avatar picker after age
- [ ] Tapping emoji stores `"emoji:<e>"` in DB photo column
- [ ] Tapping skip stores `null`
- [ ] Confirm preview shows chosen emoji (or "—")
- [ ] Admin UI (tony-admin) renders emoji in round avatar circle
- [ ] Web-enrolled students with data URL photos unaffected
- [ ] All 131 existing tests still pass
