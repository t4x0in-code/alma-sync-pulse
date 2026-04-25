# TODO-0105 — Локализация DE / RU / ES

**Приоритет:** P1
**Статус:** open

## Контекст
Целевая аудитория AlmaLatina говорит на немецком (основной), русском, испанском. Сейчас текст вшит на смеси DE/RU.

## Задача
1. Подключить `i18next` + `react-i18next`, namespace `common / enroll / admin / footer`.
2. Хранить переводы в `src/locales/{de,ru,es}/*.json`. **Дефолт — DE**.
3. Переключатель языка в `SiteHeader`, persist в localStorage + `<html lang>`.
4. Перевести Telegram-бота: locale per chat (детектить по `language_code`, override через `/lang`).
5. Plural-формы и форматирование дат (`Intl.DateTimeFormat`) для каждого языка.

## Acceptance criteria
- [ ] Все видимые строки фронта проходят через `t()`.
- [ ] Переключение языка моментальное, без перезагрузки.
- [ ] Бот отвечает на языке студента.

## Файлы
- `src/i18n.ts` (новый), `src/locales/**`
- все компоненты с текстом
- `bot/src/server.js` (`bot/locales/{de,ru,es}.json`)
