# TODO-0104 — Поддержка нескольких курсов и расписания

**Приоритет:** P1
**Статус:** open

## Контекст

MVP — один курс (Чт 20:00). Школа предлагает Salsa / Bachata / Cha-Cha разных уровней — нужна расширяемость без переписывания.

## Задача

1. Расширить схему `classes`: `style` (salsa/bachata/…), `level` (beginner/intermediate/advanced), `weekday`, `time`, `duration_min`, `recurrence` (weekly/biweekly), `valid_from`, `valid_to`.
2. Лендинг отображает grid карточек, фильтр по стилю/уровню/дню.
3. Студент может записаться на несколько курсов; pair-matching изолирован per-class.
4. В Telegram-боте `/courses`, `/add_course`, `/edit_course <id>`, `/delete_course <id>`.
5. URL: `/course/$courseId` — отдельная страница с описанием, фото инструктора, картой.

## Acceptance criteria

- [ ] Минимум 5 параллельных курсов работают независимо.
- [ ] Stammplätze и pairs привязаны к конкретному курсу.
- [ ] Тони добавляет/редактирует курс через бота без рестарта.

## Файлы

- `bot/src/server.js` (миграция SQLite)
- `src/routes/index.tsx`, новый `src/routes/course.$courseId.tsx`
- `src/components/ClassCard.tsx`, `src/components/CourseFilters.tsx`
