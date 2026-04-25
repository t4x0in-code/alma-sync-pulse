# TODO-0303 — Переключатель светлой/тёмной темы

**Приоритет:** P2
**Статус:** open

## Контекст

Сейчас тема одна (тёмная, brand-чёрный). Дневной режим был бы удобен для чтения на улице.

## Задача

1. Определить полный набор светлых токенов в `src/styles.css` (`@media (prefers-color-scheme: light)` + `[data-theme="light"]`).
2. Toggle в `SiteHeader` (system/light/dark), persist в localStorage.
3. Учесть meta `theme-color` для PWA, иконки и статус-бара.
4. Проверить контраст и фото-карточки в обеих темах.

## Acceptance criteria

- [ ] Переключение моментальное, без вспышки.
- [ ] Все экраны валидны в обеих темах.
- [ ] Дефолт — system.

## Файлы

- `src/styles.css`
- `src/components/SiteHeader.tsx`, `src/lib/theme.ts` (новый)
