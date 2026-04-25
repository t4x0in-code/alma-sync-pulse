# TODO-0305 — Test suite (Vitest + Playwright)

**Приоритет:** P2
**Статус:** in_progress

## Контекст

Проект без тестов — критически важно добавить покрытие для:

1. Bot REST API endpoints
2. Frontend компонентов
3. Telegram command handlers (bot side)

## Задача

### Vitest (unit/integration)

- [`tests/unit/`](tests/unit/) — утилиты,/helpers
- [`tests/integration/`](tests/integration/) — API endpoints, localStore

### Playwright (e2e)

- [`tests/e2e/`](tests/e2e/) — flows: enroll, admin, pairing

## Acceptance criteria

- [x] Vitest setup
- [x] Bot API tests (/api/classes, /api/enroll, /api/admin/\*)
- [x] localStore tests
- [ ] Frontend component tests
- [ ] E2E flows
- [ ] CI integration

## Файлы

- `tests/`
- `vitest.config.ts`
- `package.json` (test scripts)
