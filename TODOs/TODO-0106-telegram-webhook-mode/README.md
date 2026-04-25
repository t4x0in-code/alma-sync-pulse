# TODO-0106 — Перевод бота с polling на webhook режим

**Приоритет:** P1
**Статус:** open

## Контекст

`node-telegram-bot-api` сейчас работает в long-polling. Это расход трафика, задержка и лишняя нагрузка на сервер. На production нужен webhook.

## Задача

1. В `bot/src/server.js` добавить режим webhook, выбираемый по `BOT_MODE=polling|webhook` в `.env`.
2. Endpoint `POST /telegram/webhook/<secret>` — secret из `.env` (`WEBHOOK_SECRET`).
3. На старте бот регистрирует webhook через `setWebHook` с `WEBHOOK_PUBLIC_URL`.
4. В `docker-compose.yml` пример с Caddy/Traefik + Let's Encrypt для HTTPS.
5. В `bot/README.md` — раздел «Webhook setup» с примерами nginx и Cloudflare Tunnel.

## Acceptance criteria

- [ ] `BOT_MODE=webhook` работает с реальным Telegram.
- [ ] Polling остаётся для локальной разработки.
- [ ] Webhook secret защищает endpoint от спуфинга.

## Файлы

- `bot/src/server.js`, `bot/.env.example`
- `bot/docker-compose.yml`, `bot/README.md`
