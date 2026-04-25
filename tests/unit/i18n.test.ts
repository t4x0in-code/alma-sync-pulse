// i18n Unit Tests - Tests 21-26
// Tests the t() function with stored language preference

import { describe, it, expect, beforeEach, vi } from "vitest";
import { t, initI18n, lang } from "../../bot/src/i18n.js";

describe("i18n t() function (tests 21-26)", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  // Test 21: t(msg) uses stored language when set
  it("uses stored language when set in adminLangs", () => {
    const chatId = "123456";
    adminLangs.set(chatId, "ru");

    const msg = { chat: { id: chatId }, from: { language_code: "en" } };
    const result = t(msg, "choose_lang");

    expect(result).toBe("🌍 Выберите язык:"); // Russian
  });

  // Test 22: t(msg) falls back to auto-detect when no stored
  it("falls back to Telegram auto-detect when no stored lang", () => {
    adminLangs.clear();
    const msg = { from: { language_code: "de" } };

    const result = t(msg, "choose_lang");

    expect(result).toBe("🌍 Wähle deine Sprache:"); // German
  });

  // Test 23: t(callback_query) uses message.chat.id
  it("handles callback_query with message.chat.id", () => {
    adminLangs.set("789", "uk");

    const q = {
      message: { chat: { id: 789 } },
      from: { language_code: "en" },
    };

    const result = t(q, "choose_lang");

    expect(result).toBe("🌍 Оберіть мову:"); // Ukrainian
  });

  // Test 24: getEffectiveLang returns stored over auto-detect
  it("prefers stored language over Telegram auto-detect", () => {
    const chatId = "555";
    adminLangs.set(chatId, "fr");
    const msg = { chat: { id: chatId }, from: { language_code: "en" } };

    const result = t(msg, "lang_changed");

    expect(result).toBe("✓ Langue mise à jour !"); // French
  });

  // Test 25: initI18n properly connects Map
  it("initI18n connects the adminLangs Map correctly", () => {
    const testMap = new Map();
    testMap.set("test123", "es");

    initI18n(testMap);

    const msg = { chat: { id: "test123" }, from: { language_code: "de" } };
    const result = t(msg, "lang_selected", { lang: "Español" });

    expect(result).toBe("✓ Idioma establecido a Español"); // Spanish
  });

  // Test 26: All 8 languages have required keys
  it("all 8 languages have required keys defined", () => {
    const requiredKeys = [
      "start",
      "no_access",
      "no_courses",
      "status_line",
      "no_enrollments",
      "select_class",
      "course_not_found",
      "added",
      "deleted",
      "pair_proposed",
      "pair_confirmed",
      "no_reserved",
      "course_closed",
      "course_opened",
      "choose_lang",
      "lang_changed",
      "lang_selected",
      "auth_request",
      "db_error",
    ];

    // Languages we support
    const langs = ["en", "de", "ru", "uk", "fr", "tr", "it", "es"];

    // All these should NOT throw - each language has all keys
    for (const langCode of langs) {
      for (const key of requiredKeys) {
        const msg = { from: { language_code: langCode }, chat: { id: "test" } };
        const result = t(msg, key);
        // Should not return the key itself (means missing)
        expect(result).not.toBe(key);
      }
    }
  });
});

// Test helper exports are working
describe("i18n exports", () => {
  it("lang() extracts 2-letter code", () => {
    expect(lang({ language_code: "de" })).toBe("de");
  });

  it("lang() defaults to en", () => {
    expect(lang(null)).toBe("en");
  });

  it("lang() handles undefined", () => {
    expect(lang({})).toBe("en");
  });
});
