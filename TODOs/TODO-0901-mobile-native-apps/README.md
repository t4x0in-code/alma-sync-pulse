# TODO-0901 — Нативные мобильные приложения

**Приоритет:** P4 (roadmap)
**Статус:** open

## Контекст
PWA закрывает 90% потребностей. Native может понадобиться для iOS Push (до полного покрытия Safari) и App Store presence.

## Задача
1. Обернуть веб-приложение через **Capacitor** — минимум изменений, переиспользование кода.
2. Native plugins: Push Notifications, Camera (для check-in QR), Calendar.
3. Deep links: `almalatina://enroll/:token`.
4. Деплой в App Store / Google Play (требует Apple Dev Account 99$/год).

## Acceptance criteria
- [ ] Приложение собирается под iOS и Android.
- [ ] Push работает на iOS < 16.4.

## Файлы
- новый каталог `mobile/`
- `capacitor.config.ts`
