# AlmaLatina Bot i18n Constants

## Overview
- **8 Languages**: en, de, ru, uk, fr, tr, it, es
- **72 Base Keys** in DEFAULTS (English)
- **39 Keys** translated in 7 locales (de, ru, uk, fr, tr, it, es)
- **33 Keys** NOT translated (fall back to English)

---

## Translation Count by Locale

| Locale | Translated Keys | Coverage | Notes |
|--------|----------------|----------|-------|
| en | 72 | 100% | DEFAULTS (base) |
| de | 39 | 54% | 33 keys fall back to EN |
| ru | 39 | 54% | 33 keys fall back to EN |
| uk | 39 | 54% | 33 keys fall back to EN |
| fr | 39 | 54% | 33 keys fall back to EN |
| tr | 39 | 54% | 33 keys fall back to EN |
| it | 39 | 54% | 33 keys fall back to EN |
| es | 39 | 54% | 33 keys fall back to EN |

---

## Non-Translated Keys (P1 - Could Translate)

**33 keys** in lines 15-54 that exist in DEFAULTS but NOT in any locale override:

| Key | Line | P0-Critical | P1-Nice | P2-NoNeed |
|-----|------|-------------|---------|----------|
| no_access | 15 | ✓ | | |
| no_courses | 16 | ✓ | | |
| status_line | 17-18 | ✓ | | |
| no_enrollments | 19 | ✓ | | |
| select_class | 20 | ✓ | | |
| course_not_found | 21 | ✓ | | |
| course_not_found_id | 22 | ✓ | | |
| enrollment_not_found | 23 | ✓ | | |
| different_courses | 24 | ✓ | | |
| need_l_f | 25 | ✓ | | |
| added | 26 | ✓ | | |
| deleted | 27 | ✓ | | |
| not_found | 28 | ✓ | | |
| pair_proposed | 29 | ✓ | | |
| pair_confirmed | 30 | ✓ | | |
| pair_not_found | 31 | ✓ | | |
| pair_deleted | 32 | ✓ | | |
| no_reserved | 33 | ✓ | | |
| reserved_added | 34 | ✓ | | |
| reserved_deleted | 35 | ✓ | | |
| course_closed | 36 | ✓ | | |
| course_opened | 37 | ✓ | | |
| spot_added | 38 | ✓ | | |
| capacity_set | 39 | ✓ | | |
| auth_expired_cb | 40 | ✓ | | |
| auth_expired_msg | 41 | ✓ | | |
| auth_confirmed_cb | 42 | ✓ | | |
| auth_confirmed_msg | 43 | ✓ | | |
| auth_denied_cb | 44 | ✓ | | |
| auth_denied_msg | 45 | ✓ | | |
| auth_request | 46-47 | ✓ | | |
| auth_confirm_btn | 48 | ✓ | | |
| auth_deny_btn | 49 | ✓ | | |
| db_error | 50 | ✓ | | |
| notify_enroll | 51 | ✓ | | |
| choose_lang | 52 | ✓ | | |
| lang_changed | 53 | ✓ | | |
| lang_selected | 54 | ✓ | | |
| **lang_btn_en..es** | 56-64 | | | ✓ |
| **lang_name_en..es** | 67-74 | | | ✓ |
| **role_L, role_F** | 77-78 | | | ✓ |
| **icon_L..lock** | 79-82 | | | ✓ |

---

## Translation Status Matrix

| Key | en | de | ru | uk | fr | tr | it | es |
|-----|----|----|----|----|----|----|----|-----|
| start | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| no_access..lang_selected | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| lang_btn_* | ✓ | - | - | - | - | - | - | - |
| lang_name_* | ✓ | - | - | - | - | - | - | - |
| role_L/F | ✓ | - | - | - | - | - | - | - |
| icon_* | ✓ | - | - | - | - | - | - | - |

- ✓ = Translated
- - = Falls back to English

---

## Translation Processing Flow

```
user message → t(msg, key) → getEffectiveLang(msg) → locale dict lookup
                    ↓
              1. Check adminLangs.get(chatId) for stored preference
              2. Fallback to Telegram msg.from.language_code
              3. Fallback to "en"
                    ↓
              T[locale][key] ?? T.en[key] ?? key
```

- Untranslated keys fallback to English (T.en)
- All 72 keys work via fallback

---

## Test Validation

103 tests in `tests/unit/i18n-regression.test.ts`:
- All 72 keys process correctly
- Fallback behavior verified
- All 8 languages work

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