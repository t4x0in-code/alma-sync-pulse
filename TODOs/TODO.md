# TODO.md — Open tasks (single source of truth)

> Rules: one TODO at a time · TDD/KISS/DRY · describe fully before implementing · errors go in TODO-dir first
> On completion: move entry to DONE.md with closure stamp.

---

## P0 — Critical bugs / blockers

- [ ] [TODO-0001](./TODO-0001-fix-failed-to-fetch-cors/) — CORS whitelist + network error handling
- [ ] [TODO-0003](./TODO-0003-photo-size-validation/) — Strict photo size & MIME validation

## P1 — Required features / correctness

- [ ] [TODO-0100](./TODO-0100-supabase-realtime/) — Replace polling with Supabase Realtime / WebSocket
- [ ] [TODO-0101](./TODO-0101-student-self-edit/) — Student self-edit via magic-link
- [ ] [TODO-0102](./TODO-0102-pair-confirmation-flow/) — Full two-sided pair confirmation flow
- [ ] [TODO-0103](./TODO-0103-waitlist/) — Waitlist when course is full
- [ ] [TODO-0104](./TODO-0104-multi-course-support/) — Multi-course & schedule support
- [ ] [TODO-0106](./TODO-0106-telegram-webhook-mode/) — Switch bot from polling to webhook
- [ ] [TODO-0107](./TODO-0107-class-crud/) — Class CRUD bot commands (add_class, del_class, list_classes)
- [ ] [TODO-0110](./TODO-0110-shared-wizard-infra/) — Shared wizard infrastructure (wizardKit.js) — **implement first**
- [ ] [TODO-0111](./TODO-0111-wizard-add/) — `/add` → alias to `/addwizard`, retire one-liner syntax
- [ ] [TODO-0112](./TODO-0112-wizard-del/) — `/del` → interactive enrollment picker wizard
- [ ] [TODO-0113](./TODO-0113-wizard-match/) — `/match` → interactive class → leader → follower wizard
- [ ] [TODO-0114](./TODO-0114-wizard-confirm/) — `/confirm` → interactive proposed-pair picker wizard
- [ ] [TODO-0115](./TODO-0115-wizard-unpair/) — `/unpair` → interactive pair-delete wizard
- [ ] [TODO-0116](./TODO-0116-wizard-reserved/) — `/reserved` → auto class picker (read-only)
- [ ] [TODO-0117](./TODO-0117-wizard-add-reserved/) — `/add_reserved` → interactive Stammplatz wizard
- [ ] [TODO-0118](./TODO-0118-wizard-del-reserved/) — `/del_reserved` → interactive reserved-pair picker wizard
- [ ] [TODO-0119](./TODO-0119-wizard-block-open/) — `/block` + `/open` → interactive class status wizard
- [ ] [TODO-0120](./TODO-0120-wizard-add-spot/) — `/add_spot` → interactive +1 capacity wizard
- [ ] [TODO-0121](./TODO-0121-wizard-set-capacity/) — `/set_capacity` → class picker + number input wizard

## P2 — UX / quality

- [ ] [TODO-0300](./TODO-0300-pwa-push-notifications/) — PWA push notifications for students
- [ ] [TODO-0301](./TODO-0301-calendar-ics-export/) — Export class to .ics calendar
- [ ] [TODO-0302](./TODO-0302-accessibility-a11y/) — WCAG 2.1 AA accessibility
- [ ] [TODO-0303](./TODO-0303-dark-light-theme-toggle/) — Dark/light theme toggle
- [ ] [TODO-0304](./TODO-0304-admin-audit-log/) — Admin action audit log
- [ ] [TODO-0306](./TODO-0306-bot-commands-test/) — Telegram mock tests (bot.onText, callback_query unit coverage)

## P3 — Nice-to-have

- [ ] [TODO-0600](./TODO-0600-payments-integration/) — Online payments (Stripe/Paddle)
- [ ] [TODO-0601](./TODO-0601-attendance-tracking/) — Attendance tracking
- [ ] [TODO-0602](./TODO-0602-student-profile-history/) — Student profile & visit history
- [ ] [TODO-0603](./TODO-0603-analytics-dashboard/) — Analytics dashboard
- [ ] [TODO-0604](./TODO-0604-backup-restore/) — SQLite backup/restore + auto-export

## P4 — Roadmap

- [ ] [TODO-0900](./TODO-0900-multi-school-tenancy/) — Multi-school / multi-tenant
- [ ] [TODO-0901](./TODO-0901-mobile-native-apps/) — Native mobile apps
- [ ] [TODO-0902](./TODO-0902-ai-pair-suggestion/) — AI pair suggestions
