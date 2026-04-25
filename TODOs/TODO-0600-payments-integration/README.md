# TODO-0600 — Онлайн-оплата абонементов (Stripe/Paddle)

**Приоритет:** P3
**Статус:** open

## Контекст

Сейчас оплата офлайн. Онлайн-абонементы (10/20 занятий, месяц unlimited) снимут нагрузку с Тони и поднимут conversion.

## Задача

1. Выбор провайдера: **Stripe** (лучшая поддержка карт EU) или **Paddle** (merchant of record, упрощает VAT).
2. Продукты: Single Drop-in, 5er-Karte, 10er-Karte, Monatsabo.
3. После оплаты — webhook → создание/продление баланса в `student_credits`.
4. На карточке курса — два CTA: **Anmelden mit Karte** или **Drop-in bezahlen**.
5. Учёт VAT 19% Germany, инвойс по email.
6. Возвраты по политике школы.

## Acceptance criteria

- [ ] Тестовый платёж проходит end-to-end.
- [ ] Баланс списывается при подтверждённом посещении.
- [ ] Чек/инвойс приходит студенту.

## Файлы

- новый `bot/src/payments.js`
- `src/routes/checkout.success.tsx`, `src/routes/checkout.cancel.tsx`
- `src/components/PricingCard.tsx`
