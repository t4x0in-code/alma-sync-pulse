# TODO-0003 — Жёсткая валидация размера и MIME загружаемых фото

**Приоритет:** P0
**Статус:** open

## Контекст

В `EnrollDialog.tsx` фото ресайзится клиентом до ~600px JPEG и шлётся в base64. Нет серверной валидации — злоумышленник может отправить произвольный payload и раздуть SQLite.

## Задача

1. На клиенте: проверка `file.type ∈ {image/jpeg, image/png, image/webp}`, `file.size ≤ 10 MB` до ресайза. Прогресс-индикатор обработки.
2. На сервере (`bot/src/server.js`): лимит `express.json({ limit: '1mb' })`, валидация что строка начинается с `data:image/jpeg;base64,` и длина ≤ ~700KB.
3. Хранить фото **не в SQLite**, а как файл в `/data/photos/<uuid>.jpg`, в БД — только путь. Раздавать через `GET /api/photos/:id` с правильным `Content-Type` и `Cache-Control`.
4. EXIF-стрип при ресайзе (privacy: убрать GPS).

## Acceptance criteria

- [ ] Невозможно загрузить файл > 10 MB или не-изображение.
- [ ] SQLite не раздувается из-за фото.
- [ ] EXIF GPS отсутствует в сохранённой картинке.

## Файлы

- `src/components/EnrollDialog.tsx`
- `bot/src/server.js`
- `bot/Dockerfile` (volume `/data/photos`)
