# TODO-0603 — Аналитика для Тони

**Приоритет:** P3
**Статус:** open

## Контекст
Тони нужны метрики: загруженность курсов, M/F баланс, retention, no-show rate.

## Задача
1. Вкладка **Analytics** в `/tony-admin`:
   - заполняемость курсов по неделям (line chart);
   - M/F баланс per course (stacked bar);
   - retention cohort (сколько студентов из недели N пришли через 4/8/12 недель);
   - no-show rate;
   - топ-партнёры (кто с кем чаще всего танцует).
2. Команды бота `/stats`, `/stats week|month|year`.
3. Экспорт CSV.
4. Чарты — `recharts`, использовать дизайн-токены.

## Acceptance criteria
- [ ] Дашборд грузится ≤ 1 с при 1000 студентах.
- [ ] Все метрики обновляются в реальном времени.

## Файлы
- `bot/src/server.js` (aggregate endpoints)
- `src/routes/tony-admin.tsx`, `src/components/AnalyticsDashboard.tsx`
