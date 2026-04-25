# TODO-0308 — Bot Function Test Suite (TDD)

**Приоритет:** P2
**Статус:** in_progress

## Контекст

Бот functions without tests - critical for reliability. Lang selector broke due to untested i18n changes.

## Задача: 37 tests total

### Unit tests (26) - NO bot required

1. `tests/unit/i18n.test.ts` (6 tests)
   - `t(msg)` uses stored language when set
   - `t(msg)` falls back to auto-detect
   - `t(callback_query)` uses message.chat.id
   - `getEffectiveLang()` returns stored over auto-detect
   - `initI18n()` connects Map correctly
   - All 8 languages have required keys

2. `tests/unit/bot-commands.test.ts` (17 tests)
   - /start saves lang preference
   - /lang shows 8-language keyboard
   - /status returns class overview
   - /list auto (1 class) shows enrollments
   - /list :id shows specific class
   - /add adds enrollment
   - /del deletes enrollment
   - /match creates proposed pair
   - /confirm confirms pair
   - /unpair removes pair
   - /reserved lists reserved
   - /add_reserved adds reserved pair
   - /del_reserved deletes reserved
   - /block :id closes class
   - /open :id opens class
   - /add_spot :id adds spot
   - /set_capacity :id N sets capacity

3. `tests/unit/bot-callbacks.test.ts` (3 tests)
   - callback list_class:\* shows enrollments
   - callback lang:\* saves preference + confirms
   - callback auth:\* handles login

### Integration tests (11) - Requires RUN_INTEGRATION

4. `tests/integration/bot-api.rest.test.ts` (11 tests)
   - GET /api/classes
   - GET /api/classes/:id
   - POST /api/enroll
   - PATCH/POST/DELETE /api/admin/classes
   - PATCH/POST/DELETE /api/admin/enrollments
   - POST /api/admin/pairs
   - POST /api/admin/reserved

### Pre-commit hook

- Add to `package.json` scripts
- Run: `npm test` (vitest run) before each commit

## Acceptance criteria

- [ ] All 37 tests implemented
- [ ] Pre-commit hook triggers tests
- [ ] i18n tests pass (fixes lang selector)
- [ ] No regressions in existing functionality

## Files

- `tests/unit/i18n.test.ts`
- `tests/unit/bot-commands.test.ts`
- `tests/unit/bot-callbacks.test.ts`
- `tests/integration/bot-api.rest.test.ts`
- `package.json` (add precommit hook)
