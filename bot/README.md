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
| `/status` | Overview of all classes and current capacity |
| `/block <id>` | Close enrollment for a class |
| `/open <id>` | Re-open a class |
| `/add_spot <id>` | Increase `max_capacity` by 1 |
| `/set_capacity <id> <n>` | Set `max_capacity` directly |
| `/list_enrollments <id>` | Last 30 sign-ups for a class |

Default class id after first start: `thu-2000-cubana` (Donnerstag 20:00).

The bot also **pushes a notification** to every admin chat whenever a student
signs up via the website.

## 4. REST API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| GET | `/api/classes` | — | List classes |
| GET | `/api/classes/:id` | — | Get one class |
| POST | `/api/enroll` | — | Public sign-up `{class_id,name,email,phone?}` |
| PATCH | `/api/admin/classes/:id` | `X-Admin-Token` | Update fields |
| POST | `/api/admin/classes` | `X-Admin-Token` | Create new class |
| DELETE | `/api/admin/classes/:id` | `X-Admin-Token` | Remove class |

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
