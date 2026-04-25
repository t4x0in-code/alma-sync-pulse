# AlmaLatina Live Sync

Lovable frontend (Studentenwidget + Tony Admin) **+** standalone
self-hosted Telegram bot in Docker.

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   Frontend (Lovable)    │ ──HTTP─▶│  Bot Docker (Node+SQLite)│
│   - Live class widget   │         │  - REST API              │
│   - /tony-admin panel   │ ◀─poll──│  - Telegram bot          │
└─────────────────────────┘         └──────────┬───────────────┘
                                               │ Telegram
                                               ▼
                                       Tony's phone
```

## Quick start

### 1. Run the bot
See **[`bot/README.md`](./bot/README.md)** for the full Docker guide.

```bash
cd bot
cp .env.example .env  # add TELEGRAM_TOKEN
docker compose up -d --build
```

### 2. Connect the frontend

Set in the Lovable project (Project Settings → Environment, or `.env` for local):

```
VITE_BOT_API_URL=https://bot.your-domain.tld
```

That's it — the widget will go live and `/tony-admin` becomes functional with
the `ADMIN_TOKEN` you put in the bot's `.env`.

## Routes

- `/` — Public widget. Live capacity, enrollment form. Embeddable as iframe.
- `/tony-admin` — Hidden admin (no link in nav, just bookmark it). Requires admin token.

## Branding

Modern interpretation of AlmaLatina — deep black + crimson gradients,
Bebas Neue display + Inter body, latin energy with current premium feel.
