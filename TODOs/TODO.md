# TODO.md — Open tasks (single source of truth)

> Rules: one TODO at a time · TDD/KISS/DRY · describe fully before implementing · errors go in TODO-dir first
> On completion: move entry to DONE.md with closure stamp.

---

## P0 — Critical bugs / blockers

- [ ] [TODO-0001](./TODO-0001-fix-failed-to-fetch-cors/) — CORS whitelist + network error handling
- [ ] [TODO-0003](./TODO-0003-photo-size-validation/) — Strict photo size & MIME validation

## P1 — Required features / correctness

- [ ] [TODO-0100](./TODO-0900-supabase-realtime/) — Replace polling with Supabase Realtime / WebSocket
- [ ] [TODO-0101](./TODO-0101-student-self-edit/) — Student self-edit via magic-link
- [ ] [TODO-0102](./TODO-0102-pair-confirmation-flow/) — Full two-sided pair confirmation flow
- [ ] [TODO-0103](./TODO-0103-waitlist/) — Waitlist when course is full
- [ ] [TODO-0104](./TODO-0104-multi-course-support/) — Multi-course & schedule support
- [ ] [TODO-0106](./TODO-0106-telegram-webhook-mode/) — Switch bot from polling to webhook
- [ ] [TODO-0107](./TODO-0107-class-crud/) — Class CRUD (add_class, set_class, class, list_classes)

## P2 — UX / quality

- [ ] [TODO-0300](./TODO-0300-pwa-push-notifications/) — PWA push notifications for students
- [ ] [TODO-0301](./TODO-0301-calendar-ics-export/) — Export class to .ics calendar
- [ ] [TODO-0302](./TODO-0302-accessibility-a11y/) — WCAG 2.1 AA accessibility
- [ ] [TODO-0303](./TODO-0303-dark-light-theme-toggle/) — Dark/light theme toggle
- [ ] [TODO-0304](./TODO-0304-admin-audit-log/) — Admin action audit log
- [x] [TODO-0305](./TODO-0305-test-suite/) — Test suite (Vitest + Playwright)
- [x] [TODO-0308](./TODO-0308-bot-function-test-suite/) — Bot function test suite (TDD, 37 tests)

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
