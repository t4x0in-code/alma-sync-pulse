# TODO-0305 — Тестовое покрытие (Vitest + Playwright)

**Приоритет:** P2
**Статус:** open

## Контекст
Тестов нет. Регрессии (особенно в pair-matching и waitlist-promotion) ловятся только в проде.

## Задача
1. **Vitest** для `src/lib/localStore.ts`, `src/lib/api.ts`, чистых утилит — coverage ≥ 80%.
2. **Vitest** для `bot/src/server.js`: supertest на REST endpoints, отдельный `BOT_MODE=test` без реального Telegram.
3. **Playwright**: e2e-сценарии
   - запись студента → отображение на карточке;
   - admin login → блокировка курса → форма недоступна;
   - предложение пары → подтверждение → визуализация;
   - waitlist promotion при освобождении места.
4. CI workflow в `.github/workflows/test.yml` (lint + typecheck + unit + e2e).

## Acceptance criteria
- [ ] `bun test` проходит локально и в CI.
- [ ] Critical paths покрыты e2e.
- [ ] Перед merge — обязательный зелёный CI.

## Файлы
- `vitest.config.ts`, `playwright.config.ts` (новые)
- `tests/**`, `bot/tests/**`
- `.github/workflows/test.yml`
