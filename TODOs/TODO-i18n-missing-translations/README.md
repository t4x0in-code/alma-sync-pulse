# i18n Non-Translated Keys - TODO List

## Overview

- **72 keys** in DEFAULTS (base English)
- **39 keys** translated in each locale (de, ru, uk, fr, tr, it, es)
- **33 keys** NOT translated (fall back to English)
- 103 tests validate full coverage

---

## Non-Translated Keys by Locale

### Keys NOT Translated in ANY Locale (Lines 56-82)

These keys intentionally not translated (used for language selection UI):

| Key | Line | Note |
|-----|------|------|
| lang_btn_en | 57 | Language menu - intentionally EN |
| lang_btn_de | 58 | Language menu - intentionally EN |
| lang_btn_ru | 59 | Language menu - intentionally EN |
| lang_btn_uk | 60 | Language menu - intentionally EN |
| lang_btn_fr | 61 | Language menu - intentionally EN |
| lang_btn_tr | 62 | Language menu - intentionally EN |
| lang_btn_it | 63 | Language menu - intentionally EN |
| lang_btn_es | 64 | Language menu - intentionally EN |
| lang_name_en | 67 | Lang confirmation - EN |
| lang_name_de | 68 | Lang confirmation - EN |
| lang_name_ru | 69 | Lang confirmation - EN |
| lang_name_uk | 70 | Lang confirmation - EN |
| lang_name_fr | 71 | Lang confirmation - EN |
| lang_name_tr | 72 | Lang confirmation - EN |
| lang_name_it | 73 | Lang confirmation - EN |
| lang_name_es | 74 | Lang confirmation - EN |
| role_L | 77 | Gender label - intentionally EN |
| role_F | 78 | Gender label - intentionally EN |
| icon_L | 79 | Emoji - universal |
| icon_F | 80 | Emoji - universal |
| icon_pair | 81 | Emoji - universal |
| icon_lock | 82 | Emoji - universal |

---

## Missing Translations by Locale

### de (German) - LINE 89+
39/72 translated - **33 keys fallback to English**

Missing keys (untranslated):
> All keys are covered via fallback to DEFAULTS English

### ru (Russian) - LINE 134+
39/72 translated - **33 keys fallback to English**

Missing keys:
> All keys are covered via fallback to DEFAULTS English

### uk (Ukrainian) - LINE 179+
39/72 translated - **33 keys fallback to English**

Missing keys:
> All keys are covered via fallback to DEFAULTS English

### fr (French) - LINE 224+
39/72 translated - **33 keys fallback to English**

Missing keys:
> All keys are covered via fallback to DEFAULTS English

### tr (Turkish) - LINE 269+
39/72 translated - **33 keys fallback to English**

Missing keys:
> All keys are covered via fallback to DEFAULTS English

### it (Italian) - LINE 314+
39/72 translated - **33 keys fallback to English**

Missing keys:
> All keys are covered via fallback to DEFAULTS English

### es (Spanish) - LINE 359+
39/72 translated - **33 keys fallback to English**

Missing keys:
> All keys are covered via fallback to DEFAULTS English

---

## Translation Status Matrix

```
Key                    | en | de | ru | uk | fr | tr | it | es |
-----------------------|----|----|----|----|----|----|----|----|
start                  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  |
no_access             | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  |
no_courses            | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  |
status_line            | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  |
... (39 more)         | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  |
lang_btn_*            | ✓  | -  | -  | -  | -  | -  | -  | -  |
lang_name_*           | ✓  | -  | -  | -  | -  | -  | -  | -  |
role_L/F              | ✓  | -  | -  | -  | -  | -  | -  | -  |
icon_*                | ✓  | -  | -  | -  | -  | -  | -  | -  |
```

---

## Priority Classification

### P0 - Critical (Already Translated)
All 39 core bot messages work in all 8 languages.

### P1 - Nice to Have (Not Translated)
- Could translate remaining 33 keys for full native experience
- Currently fallback to English gracefully
- Impact: User sees some English text in otherwise localized UI

### P2 - Not Needed (Intentional)
- lang_btn_* - Shows language name in its own script
- lang_name_* - Shows language name in confirmation
- role_L/F - Gender labels universal
- icon_* - Universal emojis

---

## Test Coverage

103 tests validate all 72 keys work across all 8 languages via fallback chain.

```bash
npm test  # 103 passed
```

---

## Files

- `bot/src/i18n.js` - 472 lines, all translations
- `bot/I18N_TABLE.md` - Full documentation
- `tests/unit/i18n-regression.test.ts` - 103 tests