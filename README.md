# AlmaLatina Live Sync & Telegram Admin Portal

Живой виджет наличия мест на курсах сальсы школы **[AlmaLatina](https://almalatina.de/)**, синхронизированный с Telegram-ботом администратора (Тони). Frontend — React/TanStack Start (Lovable), backend — standalone Node.js + SQLite в Docker, разворачивается на собственном железе.

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   Frontend (Lovable)    │ ──HTTP─▶│  Bot Docker (Node+SQLite)│
│   PWA + Live widget     │         │  REST API + Telegram     │
│   /tony-admin           │ ◀─poll──│  Single source of truth  │
└─────────────────────────┘         └──────────┬───────────────┘
        │ fallback                             │ Telegram
        ▼                                      ▼
   localStorage                          Tony's phone
   (Demo-Modus)
```

---

## 1. Контекст и брендинг

- **Источник:** https://almalatina.de/
- **Айдентика:** Современная интерпретация бренда AlmaLatina — чёрно-красная гамма, дисплейный шрифт **Bebas Neue** + текстовый **Inter**, кастомный `Logo`-компонент.
- **Цель:** «Живой виджет» + админ-панель Тони, синхронизирующая реальное наличие мест на курсах сальсы между сайтом и Telegram-ботом.
- **Footer:** Официальные контакты и адрес школы из almalatina.de.

---

## 2. Координаты «Тони» (внешняя интеграция)

- **Backend:** Self-hosted Node.js + Express + SQLite, упакован в Docker (`bot/`).
- **Telegram bot:** Полностью конфигурируемый через `.env` (`TELEGRAM_TOKEN`, `ADMIN_CHAT_IDS`, `ADMIN_TOKEN`).
- **Frontend → Bot:** Подключение через переменную `VITE_BOT_API_URL`. При недоступности бота — автоматический переход в **Local/Demo-Modus** (localStorage).

---

## 3. Курсы

- **MVP:** Один действующий курс — **Четверг, 20:00**.
- Все параметры курса (день, время, вместимость, статус «открыт/блокирован», свободные места) **редактируются администратором через Telegram-бота** и через веб-панель `/tony-admin`.

---

## 4. Запись на курс (Anmeldung)

Каждая заявка содержит:

| Поле            | Значения                               |
| --------------- | -------------------------------------- |
| Имя             | строка                                 |
| Контакт         | telegram / phone / email               |
| **Пол / роль**  | **Leader (кавалер) / Follower (дама)** |
| **Возраст**     | число                                  |
| **Фото**        | опционально, JPEG ≤ ~600px, base64     |
| **Комментарий** | опционально, свободный текст пожеланий |

Требования:

1. Запись возможна как от кавалера, так и от дамы (партнёр / партнёрша ищет пару).
2. Видно, **кто кого ищет** и сколько заявок поступило отдельно от **М** и от **Ж**.
3. Заявки идентично **создаются / редактируются / удаляются** как через web, так и через бота.
4. При каждой онлайн-записи — POST-нотификация Тони в Telegram (через `ADMIN_CHAT_IDS`).

---

## 5. Pair Matching (подбор пар)

- **Solo pool:** Список «Sucht Partner» — отдельно леди-соло и мены-соло.
- **Proposed pair:** Дама выбирает кавалера (или наоборот) → отображается как «предложенная пара».
- **Confirmed pair:** Вторая сторона подтверждает → пара становится подтверждённой и визуализируется и в боте, и в веб-аппе.
- **Reserved pairs (Stammplätze):** 3–5 «постоянно действующих» пар с **двухбуквенными никами** (Он-Она), места всегда зарезервированы. Управляются через Telegram (`/add_reserved`, `/del_reserved`) и `/tony-admin`.

Визуализация плана: «свободно / занято / поддержано (proposed) / подтверждено (confirmed) / зарезервировано».

---

## 6. Telegram Admin commands

```
/status                         — текущее состояние курса
/list_enrollments               — все заявки (M/F, возраст, коммент)
/open                           — открыть запись
/block                          — закрыть запись
/set_capacity <N>               — задать вместимость
/add_spot <N>                   — добавить мест
/match <leaderId> <followerId>  — предложить пару
/confirm <pairId>               — подтвердить пару
/unpair <pairId>                — расцепить
/add_reserved <NickHe> <NickShe>— зарезервировать постоянную пару
/del_reserved <id>              — удалить резерв
```

При новой web-записи бот пушит карточку студента в `ADMIN_CHAT_IDS`.

---

## 7. Технические требования

- **Real-time UI:** Polling `/api/classes` каждые 5 секунд + listener на `storage` / custom `almalatina:local-update` события (для Local-Modus). Готов к замене на Supabase Realtime / WebSocket при необходимости.
- **Mobile First:** Адаптивная вёрстка, основной use-case — телефон (студенты в пути, Тони управляет с мобильного).
- **PWA:** `public/manifest.webmanifest` + `public/sw.js` (network-first для HTML), `PWARegister` компонент. Service worker не регистрируется внутри dev-iframe.
- **Offline-first fallback:** При недоступности бота API-клиент (`src/lib/api.ts`) переключается на `src/lib/localStore.ts` (localStorage, ключ `almalatina_local_v1`). UI показывает индикатор 🟢 Live / 🟡 Local в шапке + баннер «Demo-Modus».
- **Seed data в Local-Modus:** курс Чт 20:00, 4 студента (Marco, Elena, Pablo, Sofía), 1 proposed pair, 5 reserved Stammplätze.
- **Brand-themed:** все цвета — semantic tokens из `src/styles.css` (`oklch`), без hard-coded colors в компонентах.

---

## 8. Структура проекта

```
.
├── bot/                          # Standalone Docker backend
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example              # TELEGRAM_TOKEN, ADMIN_TOKEN, ADMIN_CHAT_IDS, PORT
│   ├── package.json
│   ├── src/server.js             # Express REST + node-telegram-bot-api + SQLite
│   └── README.md                 # Полная инструкция по self-host
│
├── public/
│   ├── manifest.webmanifest      # PWA manifest
│   ├── sw.js                     # Service worker (network-first)
│   └── icon-512.png
│
├── src/
│   ├── routes/
│   │   ├── __root.tsx            # PWARegister + providers
│   │   ├── index.tsx             # Public landing + Live widget
│   │   └── tony-admin.tsx        # Admin cockpit (X-Admin-Token)
│   ├── components/
│   │   ├── ClassCard.tsx         # Occupancy bars, M/F counters, pairs
│   │   ├── EnrollDialog.tsx      # Form: role, age, photo, comment
│   │   ├── Logo.tsx
│   │   ├── SiteHeader.tsx        # 🟢 Live / 🟡 Local indicator
│   │   ├── SiteFooter.tsx        # Контакты almalatina.de
│   │   └── PWARegister.tsx
│   ├── hooks/useClasses.ts       # Polling + storage event listener
│   ├── lib/
│   │   ├── api.ts                # Bot client + transparent local fallback
│   │   └── localStore.ts         # Полная in-browser реализация API
│   └── styles.css                # Design tokens (oklch)
│
└── README.md                     # ← этот файл
```

---

## 9. Quick start

### Frontend (Lovable preview)

Работает «из коробки» в Demo-Modus — данные в localStorage, бот не требуется.

### Backend (self-hosted Docker)

```bash
cd bot
cp .env.example .env
# заполнить TELEGRAM_TOKEN, ADMIN_CHAT_IDS, ADMIN_TOKEN
docker compose up -d
```

### Подключение frontend к запущенному боту

В настройках Lovable проекта добавить переменную:

```
VITE_BOT_API_URL=https://your-server.example.com
```

После пересборки индикатор в шапке станет 🟢 **Live**, данные начнут синхронизироваться с ботом и Telegram.

Полная инструкция — в **[`bot/README.md`](./bot/README.md)**.

---

## 10. Roadmap / возможные расширения

- Supabase Realtime вместо polling (если потребуется массовый трафик).
- Multi-course поддержка (Pn, Bachata, Cha-Cha) — схема уже расширяема.
- Push-нотификации студенту при подтверждении пары (через PWA Push API).
- OAuth-логин студента для редактирования собственной заявки без admin-token.
