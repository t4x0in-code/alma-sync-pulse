# TODO-0302 — Доступность WCAG 2.1 AA

**Приоритет:** P2
**Статус:** open

## Контекст

Сейчас focus-states не выверены, контраст красного на чёрном на грани, формы без явных ARIA-атрибутов.

## Задача

1. Контраст всех текстов ≥ 4.5:1 (проверить через axe / Lighthouse). Скорректировать токены в `src/styles.css`.
2. Все интерактивные элементы — keyboard-accessible, видимый focus ring.
3. ARIA: `aria-live` для индикатора 🟢/🟡, `aria-label` для иконок, `role="dialog"` + focus trap в `EnrollDialog`.
4. Alt-тексты для всех `<img>` (включая фото студентов).
5. `prefers-reduced-motion` — отключить анимации.
6. Корректные `<label htmlFor>` для всех полей формы.

## Acceptance criteria

- [ ] Lighthouse Accessibility ≥ 95.
- [ ] axe-core: 0 violations серьёзности serious/critical.
- [ ] Полная навигация формой по Tab без мыши.

## Файлы

- `src/styles.css`
- `src/components/**`
