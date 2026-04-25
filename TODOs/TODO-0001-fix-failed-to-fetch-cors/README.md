# TODO-0001 — Корректный CORS и обработка сетевых ошибок бота

**Приоритет:** P0 (блокер)
**Статус:** open

## Контекст
В текущей реализации (`src/lib/api.ts`) при недоступности бота возникает `Failed to fetch`. Введён fallback на `localStore`, но первопричина — отсутствие явной CORS-конфигурации на стороне Docker-бота и непрозрачная диагностика для пользователя.

## Задача
1. В `bot/src/server.js` добавить middleware `cors` с whitelist origin'ов из `.env` (`ALLOWED_ORIGINS`), preflight `OPTIONS`, корректные заголовки `Access-Control-Allow-Headers: Content-Type, X-Admin-Token`.
2. На фронте различать **сетевую ошибку** (offline / CORS / DNS) и **HTTP-ошибку** (4xx/5xx с телом). При HTTP-ошибке — показывать toast с реальным сообщением, а не падать в Local-Modus.
3. Добавить health-check endpoint `/api/health` и пинг каждые 30 с — обновлять индикатор 🟢/🟡 без необходимости пользовательского действия.
4. Документировать в `bot/README.md` пример `ALLOWED_ORIGINS=https://your.lovable.app,https://almalatina.de`.

## Acceptance criteria
- [ ] Бот отвечает на preflight OPTIONS со статусом 204.
- [ ] При временном падении бота фронт автоматически восстанавливает Live-режим без перезагрузки.
- [ ] HTTP 4xx/5xx показываются как toast, не уводят в Local-Modus.

## Файлы
- `bot/src/server.js`
- `bot/.env.example`, `bot/README.md`
- `src/lib/api.ts`, `src/components/SiteHeader.tsx`
