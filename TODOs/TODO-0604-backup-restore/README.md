# TODO-0604 — Backup/restore SQLite + автоэкспорт

**Приоритет:** P3
**Статус:** open

## Контекст
Все данные в одном `data.sqlite` внутри Docker-volume. Один rm -rf — и Тони теряет всю школу.

## Задача
1. Cron в боте: каждый день в 03:00 — `sqlite3 .backup /data/backups/data-YYYY-MM-DD.sqlite`, gzip, ротация 30 дней.
2. Опциональная заливка в S3-совместимое хранилище (Backblaze B2 / R2) при `BACKUP_S3_*` в `.env`.
3. Команда бота `/backup` — отправляет zip последнего backup в DM Тони (если ≤ 50 MB).
4. Endpoint `POST /api/admin/restore` (multipart) с двойным подтверждением.
5. В `bot/README.md` — раздел Disaster recovery.

## Acceptance criteria
- [ ] Backup создаётся автоматически каждый день.
- [ ] Restore из backup восстанавливает всё состояние.
- [ ] Опциональный offsite-backup работает.

## Файлы
- `bot/src/backup.js` (новый)
- `bot/src/server.js`, `bot/.env.example`, `bot/README.md`
