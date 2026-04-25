# TODOs — каталог доработок AlmaLatina Live Sync

Каждая доработка — отдельный подкаталог `TODO-NNNN-slug/` с файлом `README.md`, описывающим контекст, задачу, acceptance criteria и затронутые файлы.

## Нумерация и приоритеты

- **TODO-0001 … TODO-0099** — критические баги и блокеры (P0)
- **TODO-0100 … TODO-0299** — обязательные функциональные доработки (P1)
- **TODO-0300 … TODO-0599** — важные UX/качество (P2)
- **TODO-0600 … TODO-0899** — желательные улучшения и оптимизации (P3)
- **TODO-0900 … TODO-9999** — будущие фичи / roadmap (P4)

## Индекс

### P0 — Критические
- [TODO-0001](./TODO-0001-fix-failed-to-fetch-cors/) — Корректный CORS и обработка сетевых ошибок бота
- [TODO-0002](./TODO-0002-admin-token-secure-storage/) — Безопасное хранение ADMIN_TOKEN на клиенте
- [TODO-0003](./TODO-0003-photo-size-validation/) — Жёсткая валидация размера и MIME загружаемых фото

### P1 — Обязательные
- [TODO-0100](./TODO-0100-supabase-realtime/) — Перевод polling на Supabase Realtime / WebSocket
- [TODO-0101](./TODO-0101-student-self-edit/) — Самостоятельное редактирование заявки студентом (magic-link)
- [TODO-0102](./TODO-0102-pair-confirmation-flow/) — Полноценный двухсторонний flow подтверждения пары
- [TODO-0103](./TODO-0103-waitlist/) — Лист ожидания при заполненном курсе
- [TODO-0104](./TODO-0104-multi-course-support/) — Поддержка нескольких курсов и расписания
- [TODO-0105](./TODO-0105-i18n-de-ru-es/) — Локализация DE / RU / ES
- [TODO-0106](./TODO-0106-telegram-webhook-mode/) — Перевод бота с polling на webhook режим

### P2 — UX / качество
- [TODO-0300](./TODO-0300-pwa-push-notifications/) — Push-уведомления студентам через PWA
- [TODO-0301](./TODO-0301-calendar-ics-export/) — Экспорт занятия в .ics календарь
- [TODO-0302](./TODO-0302-accessibility-a11y/) — Доступность WCAG 2.1 AA
- [TODO-0303](./TODO-0303-dark-light-theme-toggle/) — Переключатель светлой/тёмной темы
- [TODO-0304](./TODO-0304-admin-audit-log/) — Журнал действий администратора
- [TODO-0305](./TODO-0305-test-suite/) — Тестовое покрытие (Vitest + Playwright)

### P3 — Желательные
- [TODO-0600](./TODO-0600-payments-integration/) — Онлайн-оплата абонементов (Stripe/Paddle)
- [TODO-0601](./TODO-0601-attendance-tracking/) — Учёт фактической посещаемости
- [TODO-0602](./TODO-0602-student-profile-history/) — История посещений и профиль ученика
- [TODO-0603](./TODO-0603-analytics-dashboard/) — Аналитика для Тони (когорты, M/F баланс)
- [TODO-0604](./TODO-0604-backup-restore/) — Backup/restore SQLite + автоэкспорт

### P4 — Roadmap
- [TODO-0900](./TODO-0900-multi-school-tenancy/) — Мульти-школы / multi-tenant
- [TODO-0901](./TODO-0901-mobile-native-apps/) — Нативные мобильные приложения
- [TODO-0902](./TODO-0902-ai-pair-suggestion/) — AI-подсказки совместимых пар
