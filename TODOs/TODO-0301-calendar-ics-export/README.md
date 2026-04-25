# TODO-0301 — Экспорт занятия в .ics календарь

**Приоритет:** P2
**Статус:** open

## Контекст

После записи студент должен одной кнопкой добавить занятие в Google/Apple/Outlook календарь.

## Задача

1. Endpoint `GET /api/classes/:id/ics` возвращает `text/calendar` со всеми вхождениями (RRULE для еженедельных).
2. Кнопка **Zum Kalender hinzufügen** в success-state формы и в `/enroll/:token`.
3. Включить адрес школы (geo-координаты), описание, ссылку на отмену.
4. Поддержка timezone Europe/Berlin с переходом DST.

## Acceptance criteria

- [ ] .ics корректно открывается в Google Calendar, Apple Calendar, Outlook.
- [ ] При отмене записи — отправляется CANCEL .ics (опционально).

## Файлы

- `bot/src/server.js` (или генерация на клиенте через `ics` пакет)
- `src/components/EnrollDialog.tsx`, `src/routes/enroll.$token.tsx`
