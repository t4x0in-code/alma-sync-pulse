# TODO-0100 — Перевод polling на Supabase Realtime / WebSocket

**Приоритет:** P1
**Статус:** open

## Контекст
Сейчас `useClasses.ts` опрашивает `/api/classes` раз в 5 секунд — лишний трафик и задержка до 5 с.

## Задача
Два варианта на выбор (решение принимает Тони):

### Вариант A — WebSocket в боте
1. Подключить `ws` в `bot/src/server.js`, поднять `/ws` endpoint.
2. При любом изменении (`enroll`, `match`, `confirm`, `set_capacity`, …) — broadcast события всем подписчикам.
3. На фронте — `src/lib/realtime.ts`, реконнект с экспоненциальным backoff, fallback на polling если WS недоступен.

### Вариант B — Supabase Realtime
1. Включить Lovable Cloud, перенести таблицы `classes / enrollments / pairs / reserved_pairs` в Postgres.
2. Использовать `supabase.channel().on('postgres_changes', …)`.
3. Бот пишет в Supabase, не в локальный SQLite.

## Acceptance criteria
- [ ] Изменение в боте отражается в UI ≤ 1 с.
- [ ] При обрыве соединения — автоматическое восстановление.
- [ ] Polling сохранён как fallback.

## Файлы
- `bot/src/server.js` или Lovable Cloud schema
- `src/hooks/useClasses.ts`, новый `src/lib/realtime.ts`
