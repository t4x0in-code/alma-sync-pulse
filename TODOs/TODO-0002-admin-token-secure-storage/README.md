# TODO-0002 — Безопасное хранение ADMIN_TOKEN на клиенте

**Приоритет:** P0
**Статус:** open

## Контекст
`/tony-admin` авторизуется заголовком `X-Admin-Token`. Сейчас токен хранится в localStorage / вводится в форму — уязвимо к XSS и phishing.

## Задача
1. Заменить статический `ADMIN_TOKEN` на полноценную авторизацию: либо
   - **(a)** Telegram Login Widget → бот выдаёт короткоживущий JWT (15 мин) + refresh-token, проверка `chat_id ∈ ADMIN_CHAT_IDS`, либо
   - **(b)** magic-link через Telegram (бот отправляет одноразовую ссылку Тони в личку).
2. Хранить access-token только in-memory, refresh — в httpOnly cookie (требует домена с поддержкой cookies → CORS `credentials: 'include'`).
3. Автоматический logout по бездействию (15 мин).
4. Защита `/tony-admin` маршрута: при отсутствии валидного токена — redirect на login.

## Acceptance criteria
- [ ] localStorage не содержит ADMIN_TOKEN.
- [ ] Только chat_id из `ADMIN_CHAT_IDS` может получить admin-доступ.
- [ ] Токен ротируется и протухает.

## Файлы
- `bot/src/server.js` (auth endpoints, JWT)
- `src/routes/tony-admin.tsx`, `src/lib/api.ts`
- новый `src/lib/auth.ts`
