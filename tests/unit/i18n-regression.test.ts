// Regression tests for known bugs
// Tests to prevent reintroduction of past issues

import { describe, it, expect, beforeEach } from "vitest";
import { t, initI18n } from "../../bot/src/i18n.js";

describe("REGRESSION: i18n lang selector bug (fixed 2026-04-25)", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  // Bug: stored language was ignored, always used Telegram auto-detect
  // Regression test: stored preference MUST override auto-detect
  it("stored language overrides Telegram auto-detect", () => {
    adminLangs.set("123", "ru"); // stored: Russian
    const msg = { chat: { id: "123" }, from: { language_code: "en" } }; // auto: English

    const result = t(msg, "choose_lang");

    // MUST return Russian, not English
    expect(result).toBe("🌍 Выберите язык:");
  });

  // Bug: callback_query lang selector didn't work
  // Regression test: callback_query must use message.chat.id for stored lang
  it("callback_query uses message.chat.id for stored language", () => {
    adminLangs.set("456", "de"); // stored: German
    const q = {
      message: { chat: { id: "456" } },
      from: { language_code: "en" } // Telegram thinks: English
    };

    const result = t(q, "lang_changed");

    // MUST return German, not English
    expect(result).toBe("✓ Sprache aktualisiert!");
  });

  // Bug: t() called with wrong signature in callback handlers
  // Regression test: t() accepts full message/callback object
  it("t() works with both message and callback_query objects", () => {
    adminLangs.set("789", "es");
    
    const msg = { chat: { id: "789" }, from: {} };
    const q = { message: { chat: { id: "789" } } };

    // Both should work and return Spanish
    expect(t(msg, "lang_selected", { lang: "Español" })).toBe("✓ Idioma establecido a Español");
    expect(t(q, "lang_selected", { lang: "Español" })).toBe("✓ Idioma establecido a Español");
  });

  // Bug: t() was called with string lang code instead of msg object
  // Regression test: calling t("ru", key) must not crash
  it("t() does not crash when called with string instead of object", () => {
    // This used to happen: t(newLang, "lang_selected", ...)
    // Now it should fall back to English
    const result = t("ru", "choose_lang");
    // Should NOT crash, should return English fallback
    expect(result).toBeDefined();
  });
});

describe("REGRESSION: adminLangs not initialized", () => {
  it("t() works when adminLangs is not initialized", () => {
    // Create fresh i18n module state
    const freshAdminLangs = new Map();
    initI18n(freshAdminLangs);

    const msg = { from: { language_code: "de" } };
    const result = t(msg, "choose_lang");

    // Should work with fallback
    expect(result).toContain("Wähle");
  });
});

describe("REGRESSION: /lang command keyboard buttons", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  // Verify all 8 languages are available
  it("all 8 language options are translated correctly", () => {
    const langs = ["en", "de", "ru", "uk", "fr", "tr", "it", "es"];
    const expectedPhrases = [
      "🌍 Choose your language:",      // en
      "🌍 Wähle deine Sprache:",    // de
      "🌍 Выберите язык:",           // ru
      "🌍 Оберіть мову:",           // uk
      "🌍 Choisissez votre langue:",  // fr
      "🌍 Dilinizi seçin:",         // tr
      "🌍 Scegli la tua lingua:",    // it
      "🌍 Elige tu idioma:",        // es
    ];

    for (let i = 0; i < langs.length; i++) {
      adminLangs.set("test" + i, langs[i]);
      const msg = { chat: { id: "test" + i }, from: { language_code: "en" } };
      const result = t(msg, "choose_lang");
      expect(result).toBe(expectedPhrases[i]);
    }
  });
});