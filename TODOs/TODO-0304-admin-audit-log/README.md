# TODO-0304 — Журнал действий администратора

**Приоритет:** P2
**Статус:** open

## Контекст
Тони и потенциальные ассистенты могут менять capacity, удалять записи, разрывать пары — нужен audit log.

## Задача
1. Таблица `audit_log`: `ts, actor (chat_id|web), action, target_type, target_id, payload_json`.
2. Каждый mutating endpoint и каждая bot-команда пишут запись.
3. Endpoint `GET /api/admin/audit` с пагинацией и фильтрами.
4. UI на `/tony-admin` — вкладка **Verlauf** с поиском по дате/actor/action.
5. Команды бота `/audit` и `/audit @user`.
6. Retention 365 дней, cron-cleanup.

## Acceptance criteria
- [ ] Каждое изменение состояния логируется.
- [ ] По логу можно восстановить, кто и когда удалил заявку.

## Файлы
- `bot/src/server.js`
- `src/routes/tony-admin.tsx`
