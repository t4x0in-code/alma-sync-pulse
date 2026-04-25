# AlmaLatina Bot · Self-hosted Docker

Standalone Node.js service that owns the **single source of truth** for
AlmaLatina salsa classes. It exposes:

- A small **REST API** consumed by the Lovable frontend
- A **Telegram bot** for Tony to manage classes from his phone

No external database, no cloud lock-in. SQLite + Express + node-telegram-bot-api.

---

## 1. Prerequisites

- Docker + docker-compose
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

## 2. First-run setup

```bash
cd bot
cp .env.example .env
# edit .env: paste TELEGRAM_TOKEN and pick an ADMIN_TOKEN
docker compose up -d --build
docker compose logs -f
```

Open Telegram, find your bot, send `/start`. It will reply with **your chat ID**.
Add it to `.env`:

```env
ADMIN_CHAT_IDS=123456789
```

Restart: `docker compose restart`. You can now use admin commands.

## 3. Telegram commands

| Command | Description |
|---|---|
| `/start` | Show your chat ID and command list |
| `/status` | Overview: пары, M/Ж, capacity |
| `/list <classId>` | Все заявки курса (с ID) |
| `/add <classId> <L\|F> <name> [age]` | Добавить заявку (L=Leader/М, F=Follower/Ж) |
| `/del <enrollmentId>` | Удалить заявку (и все её пары) |
| `/match <leaderId> <followerId>` | Предложить пару (status=proposed) |
| `/confirm <pairId>` | Подтвердить пару |
| `/unpair <pairId>` | Удалить пару |
| `/reserved <classId>` | Список постоянных пар |
| `/add_reserved <classId> <LL> <FF> [note]` | Добавить пост. пару (2 буквы каждый) |
| `/del_reserved <id>` | Удалить пост. пару |
| `/block <id>` / `/open <id>` | Закрыть / открыть курс |
| `/add_spot <id>` / `/set_capacity <id> <n>` | Изменить вместимость |

Default class id: `thu-2000-cubana` (Donnerstag 20:00).
Бот **пушит уведомление** всем admin-чатам при каждой записи через сайт (с полом, возрастом и комментом).

## 4. REST API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Liveness |
| GET | `/api/classes` | — | Все курсы (enriched: enrollments, pairs, reserved, counts) |
| GET | `/api/classes/:id` | — | Один курс |
| POST | `/api/enroll` | — | `{class_id,name,gender:'L'\|'F',age?,email?,phone?,photo?,comment?}` |
| PATCH | `/api/admin/classes/:id` | `X-Admin-Token` | Изменить курс |
| POST | `/api/admin/classes` | token | Создать курс |
| DELETE | `/api/admin/classes/:id` | token | Удалить курс |
| POST | `/api/admin/enrollments` | token | Добавить заявку (как в /enroll) |
| PATCH | `/api/admin/enrollments/:id` | token | Изменить заявку |
| DELETE | `/api/admin/enrollments/:id` | token | Удалить заявку |
| POST | `/api/admin/pairs` | token | `{leader_id,follower_id,status?}` |
| PATCH | `/api/admin/pairs/:id` | token | `{status:'proposed'\|'confirmed'}` |
| DELETE | `/api/admin/pairs/:id` | token | Удалить пару |
| POST | `/api/admin/reserved` | token | `{class_id,leader_nick,follower_nick,note?}` |
| DELETE | `/api/admin/reserved/:id` | token | Удалить пост. пару |

`photo` — `data:image/jpeg;base64,...` (макс. ~800 KB) или `https://...` URL.

## 5. Connecting the Lovable frontend

In the Lovable project, set an environment variable:

```
VITE_BOT_API_URL=https://bot.your-domain.tld
```

(Or `http://localhost:8080` for local dev.)

The frontend polls `/api/classes` every 5 seconds for live updates and uses
`X-Admin-Token` from the `/tony-admin` page.

### CORS

Edit `.env`:

```env
CORS_ORIGIN=https://app.almalatina.de
```

For multiple origins, replace with `*` or extend `server.js`.

### Recommended production setup

1. Run the bot on your VPS behind **nginx** or **Caddy** with HTTPS.
2. Point `bot.almalatina.de` → container port `8080`.
3. Embed the Lovable app at `app.almalatina.de` (subdomain or iframe inside
   the WordPress site).
4. The original WordPress at `almalatina.de` is untouched — the widget links
   to it via the `external_url` field on every class.

### Example Caddyfile

```Caddyfile
bot.almalatina.de {
  reverse_proxy localhost:8080
}
```

## 6. Data & backup

SQLite file lives in the named volume `almalatina-data` (mounted at `/data`).

```bash
docker run --rm -v almalatina-data:/data -v $PWD:/backup alpine \
  tar czf /backup/almalatina-$(date +%F).tgz -C /data .
```

## 7. Updating

```bash
git pull
docker compose up -d --build
```

The DB schema is created with `CREATE TABLE IF NOT EXISTS`, so updates are
non-destructive.

## 8. Troubleshooting

- **`Telegram bot disabled`** in logs → `TELEGRAM_TOKEN` missing.
- **`🚫 Kein Zugriff`** in chat → your chat ID isn't in `ADMIN_CHAT_IDS`.
- **CORS errors in browser** → set `CORS_ORIGIN` to your frontend origin.
- **Frontend shows "Bot-API offline"** → `VITE_BOT_API_URL` wrong, or the
  container/network is unreachable from the browser.
