# TODO-0002 — Безопасное хранение ADMIN_TOKEN на клиенте

**Приоритет:** P0
**Статус:** done — реализовано в коммите `feat: TODO-0002 Telegram JWT admin auth`

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

- [x] `VITE_ADMIN_TOKEN` удалён из фронтенда — токен не попадает в JS-бандл.
- [x] Только `chat_id` из `ADMIN_CHAT_IDS` может получить admin-доступ (через Telegram PIN + кнопки).
- [x] JWT подписан HMAC-SHA256, протухает через 24 ч.

## Что сделано

- `POST /api/auth/request` — генерирует PIN, отправляет Telegram-сообщение с кнопками ✅/❌
- `GET /api/auth/poll/:id` — фронтенд опрашивает каждые 2 с
- `bot.on("callback_query")` — по нажатию ✅ выдаёт подписанный JWT
- Middleware `/api/admin` принимает JWT **или** legacy `ADMIN_TOKEN` (обратная совместимость)
- Экран логина в `/tony-admin`: PIN-display, кнопка «Mit Telegram anmelden», ручной fallback

## Файлы

- `bot/src/server.js` (auth endpoints, JWT)
- `src/routes/tony-admin.tsx`, `src/lib/api.ts`
- новый `src/lib/auth.ts`
