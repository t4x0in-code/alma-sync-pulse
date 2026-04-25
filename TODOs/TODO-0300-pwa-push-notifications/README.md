# TODO-0300 — Push-уведомления студентам через PWA

**Приоритет:** P2
**Статус:** open

## Контекст
PWA уже подключён. Логичное продолжение — Web Push для напоминаний о занятии и подтверждении пары.

## Задача
1. Сгенерировать VAPID ключи, добавить `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` в `bot/.env`.
2. На фронте: запрос `Notification.permission`, подписка через `pushManager.subscribe`, отправка endpoint в бот.
3. В `bot/src/server.js` — пакет `web-push`, рассылка по событиям:
   - за 24 ч до занятия — напоминание;
   - при новом proposal на пару;
   - при подтверждении пары;
   - при попадании из waitlist в основной список (TODO-0103).
4. Управление подписками в `/enroll/:token` (TODO-0101).

## Acceptance criteria
- [ ] iOS 16.4+ и Android Chrome получают push.
- [ ] Студент может отписаться.
- [ ] Тихие часы 22:00–08:00 настраиваются.

## Файлы
- `public/sw.js` (push event handler)
- `src/lib/push.ts` (новый), `src/components/PWARegister.tsx`
- `bot/src/server.js`
