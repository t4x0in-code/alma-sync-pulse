# AlmaLatina Bot i18n Constants

## Overview
- **8 Languages**: en, de, ru, uk, fr, tr, it, es
- **42 Base Keys** in DEFAULTS (English)
- **0-32 Overrides** per locale (only keys that differ)

---

## Table: All i18n Constants by Category

### Bot Messages (Commands & Help)

| Key | English (en) | Used By |
|-----|--------------|--------|
| `start` | `🌹 *AlmaLatina Bot*\nYour chat ID: ...\n*Commands:*...` | `/start` |

### Access Control

| Key | English (en) | Used By |
|-----|--------------|--------|
| `no_access` | 🚫 Access denied. | guard, all commands |
| `auth_request` | 🔐 *Admin login requested*\nPIN: `{pin}` | auth flow |
| `auth_confirm_btn` | ✅ Confirm | auth keyboard |
| `auth_deny_btn` | ❌ Deny | auth keyboard |
| `auth_expired_cb` | Request expired. | callback |
| `auth_expired_msg` | ⏱ Expired. | callback |
| `auth_confirmed_cb` | ✅ Login confirmed! | callback |
| `auth_confirmed_msg` | ✅ Login confirmed. | callback |
| `auth_denied_cb` | ❌ Denied. | callback |
| `auth_denied_msg` | ❌ Login denied. | callback |

### Class Management

| Key | English (en) | Placeholders |
|-----|--------------|-------------|
| `status_line` | `*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}...` | title, id, schedule, enrolled, cap, status, f, l, confirmed, proposed, reserved |
| `no_courses` | No courses. | - |
| `select_class` | Select a class: | - |
| `course_not_found` | ❌ Course not found. | - |
| `course_not_found_id` | ❌ Course {id} not found. | id |
| `course_closed` | 🔒 {title} closed. | title |
| `course_opened` | 🔓 {title} opened. | title |
| `spot_added` | ➕ {title}: {n} spots. | title, n |
| `capacity_set` | 📏 {title}: max {n} | title, n |

### Enrollment

| Key | English (en) | Placeholders |
|-----|--------------|-------------|
| `no_enrollments` | No enrollments yet. | - |
| `enrollment_not_found` | ❌ Enrollments not found. | - |
| `added` | ✅ #{id} added. | id |
| `deleted` | 🗑 #{id} deleted. | id |
| `not_found` | ❌ Not found. | - |
| `notify_enroll` | 🌹 *New enrollment* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id} | role, name, age, comment, title, id |

### Pairing

| Key | English (en) | Placeholders |
|-----|--------------|-------------|
| `different_courses` | ❌ Different courses. | - |
| `need_l_f` | ❌ Need 1×L and 1×F. | - |
| `pair_proposed` | 💞 pair #{id}: {leader} ↔ {follower} (proposed) | id, leader, follower |
| `pair_confirmed` | ✓ pair {id} confirmed. | id |
| `pair_not_found` | ❌ Pair not found. | - |
| `pair_deleted` | 🗑 pair {id} deleted. | id |

### Reserved Pairs

| Key | English (en) | Placeholders |
|-----|--------------|-------------|
| `no_reserved` | No reserved pairs. | - |
| `reserved_added` | 🔒 reserved #{id}: {l}–{f} | id, l, f |
| `reserved_deleted` | 🗑 reserved {id} deleted. | id |

### Language Selection

| Key | English (en) | Used By |
|-----|--------------|--------|
| `choose_lang` | 🌍 Choose your language: | `/lang` |
| `lang_changed` | ✓ Language updated! | callback |
| `lang_selected` | ✓ Language set to {lang} | callback |

### Language Buttons (Keyboard)

| Key | English (en) | Flag |
|-----|--------------|------|
| `lang_btn_en` | 🇬🇧 English | en |
| `lang_btn_de` | 🇩🇪 Deutsch | de |
| `lang_btn_ru` | 🇷🇺 Русский | ru |
| `lang_btn_uk` | 🇺🇦 Українська | uk |
| `lang_btn_fr` | 🇫🇷 Français | fr |
| `lang_btn_tr` | 🇹🇷 Türkçe | tr |
| `lang_btn_it` | 🇮🇹 Italiano | it |
| `lang_btn_es` | 🇪🇸 Español | es |

### Language Names (Confirmation Display)

| Key | English (en) |
|-----|--------------|
| `lang_name_en` | English |
| `lang_name_de` | Deutsch |
| `lang_name_ru` | Русский |
| `lang_name_uk` | Українська |
| `lang_name_fr` | Français |
| `lang_name_tr` | Türkçe |
| `lang_name_it` | Italiano |
| `lang_name_es` | Español |

### Role & Icons

| Key | English (en) |
|-----|--------------|
| `role_L` | 🕺 Leader |
| `role_F` | 💃 Follower |
| `icon_L` | 🕺 |
| `icon_F` | 💃 |
| `icon_pair` | 💞 |
| `icon_lock` | 🔒 |

### Errors

| Key | English (en) | Used By |
|-----|--------------|--------|
| `db_error` | ❌ Operation failed. | DB errors |

---

## Locale Coverage Matrix

| Key | en | de | ru | uk | fr | tr | it | es |
|-----|----|----|----|----|----|----|----|-----|
| start | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| no_access | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| no_courses | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| status_line | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| no_enrollments | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| select_class | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| course_not_found | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| course_not_found_id | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| enrollment_not_found | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| different_courses | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| need_l_f | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| added | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| deleted | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| not_found | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| pair_proposed | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| pair_confirmed | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| pair_not_found | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| pair_deleted | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| no_reserved | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| reserved_added | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| reserved_deleted | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| course_closed | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| course_opened | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| spot_added | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| capacity_set | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_expired_cb | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_expired_msg | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_confirmed_cb | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_confirmed_msg | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_denied_cb | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_denied_msg | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_request | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_confirm_btn | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth_deny_btn | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| db_error | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| notify_enroll | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| choose_lang | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| lang_changed | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| lang_selected | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| lang_btn_* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| lang_name_* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| role_L/F | ✓ | - | - | - | - | - | - | - |
| icon_* | ✓ | - | - | - | - | - | - | - |

---

## Usage in Code

```javascript
import { t, initI18n } from "./bot/src/i18n.js";

// Initialize with adminLangs Map
initI18n(adminLangs);

// Translate
bot.onText(/^\/status/, (msg) => {
  bot.sendMessage(msg.chat.id, t(msg, "status_line", { ... }));
});

// Language buttons (dynamic)
const langs = ["en", "de", "ru", "uk", "fr", "tr", "it", "es"];
for (let i = 0; i < langs.length; i += 2) {
  rows.push([
    { text: t(msg, "lang_btn_" + langs[i]), callback_data: "lang:" + langs[i] },
    { text: t(msg, "lang_btn_" + langs[i + 1]), callback_data: "lang:" + langs[i + 1] },
  ]);
}
```

---

## Files

- `bot/src/i18n.js` — All translations (472 lines)
- `bot/src/server.js` — Bot implementation using `t()` function
- `tests/unit/i18n-regression.test.ts` — 95 regression tests