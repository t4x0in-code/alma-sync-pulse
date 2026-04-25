# TODO-0306 — Telegram Bot Commands Test Suite

**Приоритет:** P2
**Статус:** open

## Контекст

Бот-команды протестированы только вручную. Нужны авто-тесты для всех Telegram command handlers.

## Задача

1. Unit-тесты для Telegram command handlers (mock TelegramBot)
2. Integration-тесты с реальным ботом (если запущен)

## Acceptance criteria

- [ ] Тесты для всех bot.onText() handlers
- [ ] Тесты для bot.on('callback_query')
- [ ] RUN_INTEGRATION flag для integration тестов

## Файлы

- `tests/unit/bot-commands.test.ts`
- `tests/integration/bot-commands.test.ts`
