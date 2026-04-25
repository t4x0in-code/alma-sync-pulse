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

describe("REGRESSION: /status command uses stored language", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  it("/status returns Russian when stored lang is ru", () => {
    adminLangs.set("789", "ru");
    const msg = { chat: { id: "789" }, from: { language_code: "en" } };

    const result = t(msg, "no_access");

    expect(result).toBe("🚫 Нет доступа.");
  });

  it("/status returns German when stored lang is de", () => {
    adminLangs.set("999", "de");
    const msg = { chat: { id: "999" }, from: { language_code: "tr" } };

    const result = t(msg, "no_access");

    expect(result).toBe("🚫 Kein Zugriff.");
  });

  it("/status returns Ukrainian when stored lang is uk", () => {
    adminLangs.set("111", "uk");
    const msg = { chat: { id: "111" }, from: { language_code: "en" } };

    const result = t(msg, "no_access");

    expect(result).toBe("🚫 Немає доступу.");
  });

  it("/status returns Turkish when stored lang is tr", () => {
    adminLangs.set("112", "tr");
    const msg = { chat: { id: "112" }, from: { language_code: "en" } };

    const result = t(msg, "no_access");

    expect(result).toBe("🚫 Erişim reddedildi.");
  });

  it("/status returns French when stored lang is fr", () => {
    adminLangs.set("113", "fr");
    const msg = { chat: { id: "113" }, from: { language_code: "en" } };

    const result = t(msg, "no_access");

    expect(result).toBe("🚫 Accès refusé.");
  });

  it("/status returns Italian when stored lang is it", () => {
    adminLangs.set("114", "it");
    const msg = { chat: { id: "114" }, from: { language_code: "en" } };

    const result = t(msg, "no_access");

    expect(result).toBe("🚫 Accesso negato.");
  });

  it("/status returns Spanish when stored lang is es", () => {
    adminLangs.set("115", "es");
    const msg = { chat: { id: "115" }, from: { language_code: "en" } };

    const result = t(msg, "no_access");

    expect(result).toBe("🚫 Acceso denegado.");
  });
});

describe("REGRESSION: /list command uses stored language", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  // Bug: /list also used lang(msg.from) instead of msg
  it("/list returns German when stored lang is de", () => {
    adminLangs.set("222", "de");
    const msg = { chat: { id: "222" }, from: { language_code: "en" } };

    const result = t(msg, "no_enrollments");

    expect(result).toBe("Noch keine Anmeldungen.");
  });

  it("/list returns Turkish when stored lang is tr", () => {
    adminLangs.set("333", "tr");
    const msg = { chat: { id: "333" }, from: { language_code: "en" } };

    const result = t(msg, "no_enrollments");

    expect(result).toBe("Henüz kayıt yok.");
  });

  it("/list returns Italian when stored lang is it", () => {
    adminLangs.set("444", "it");
    const msg = { chat: { id: "444" }, from: { language_code: "es" } };

    const result = t(msg, "no_enrollments");

    // Italian text
    expect(result).toContain("Nessun");
  });

  it("/list returns French when stored lang is fr", () => {
    adminLangs.set("555", "fr");
    const msg = { chat: { id: "555" }, from: { language_code: "de" } };

    const result = t(msg, "no_enrollments");

    // French text
    expect(result).toContain("inscription");
  });

  it("/list returns Spanish when stored lang is es", () => {
    adminLangs.set("666", "es");
    const msg = { chat: { id: "666" }, from: { language_code: "en" } };

    const result = t(msg, "no_enrollments");

    expect(result).toBe("Aún no hay inscripciones.");
  });
});

describe("REGRESSION: /block command uses stored language", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  it("/block returns Russian when stored lang is ru", () => {
    adminLangs.set("111", "ru");
    const msg = { chat: { id: "111" }, from: { language_code: "en" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa закрыт.");
  });

  it("/block returns German when stored lang is de", () => {
    adminLangs.set("222", "de");
    const msg = { chat: { id: "222" }, from: { language_code: "en" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa geschlossen.");
  });

  it("/block returns French when stored lang is fr", () => {
    adminLangs.set("333", "fr");
    const msg = { chat: { id: "333" }, from: { language_code: "en" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa fermé.");
  });

  it("/block returns Ukrainian when stored lang is uk", () => {
    adminLangs.set("444", "uk");
    const msg = { chat: { id: "444" }, from: { language_code: "en" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa закрито.");
  });

  it("/block returns Turkish when stored lang is tr", () => {
    adminLangs.set("555", "tr");
    const msg = { chat: { id: "555" }, from: { language_code: "en" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa kapatıldı.");
  });

  it("/block returns Italian when stored lang is it", () => {
    adminLangs.set("666", "it");
    const msg = { chat: { id: "666" }, from: { language_code: "en" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa chiuso.");
  });

  it("/block returns Spanish when stored lang is es", () => {
    adminLangs.set("777", "es");
    const msg = { chat: { id: "777" }, from: { language_code: "en" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa cerrado.");
  });

  it("/block returns English when stored lang is en", () => {
    adminLangs.set("888", "en");
    const msg = { chat: { id: "888" }, from: { language_code: "de" } };

    const result = t(msg, "course_closed", { title: "Salsa" });

    expect(result).toBe("🔒 Salsa closed.");
  });
});

describe("REGRESSION: /open command uses stored language", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  it("/open returns Russian when stored lang is ru", () => {
    adminLangs.set("111", "ru");
    const msg = { chat: { id: "111" }, from: { language_code: "en" } };

    const result = t(msg, "course_opened", { title: "Salsa" });

    expect(result).toBe("🔓 Salsa открыт.");
  });

  it("/open returns German when stored lang is de", () => {
    adminLangs.set("222", "de");
    const msg = { chat: { id: "222" }, from: { language_code: "en" } };

    const result = t(msg, "course_opened", { title: "Salsa" });

    expect(result).toBe("🔓 Salsa geöffnet.");
  });

  it("/open returns Ukrainian when stored lang is uk", () => {
    adminLangs.set("333", "uk");
    const msg = { chat: { id: "333" }, from: { language_code: "en" } };

    const result = t(msg, "course_opened", { title: "Salsa" });

    expect(result).toBe("🔓 Salsa відкрито.");
  });
});

describe("REGRESSION: /set_capacity command uses stored language", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  it("/set_capacity returns Russian when stored lang is ru", () => {
    adminLangs.set("111", "ru");
    const msg = { chat: { id: "111" }, from: { language_code: "en" } };

    const result = t(msg, "capacity_set", { title: "Salsa", n: 20 });

    expect(result).toBe("📏 Salsa: макс 20");
  });

  it("/set_capacity returns German when stored lang is de", () => {
    adminLangs.set("222", "de");
    const msg = { chat: { id: "222" }, from: { language_code: "en" } };

    const result = t(msg, "capacity_set", { title: "Salsa", n: 20 });

    expect(result).toBe("📏 Salsa: max 20");
  });

  it("/set_capacity returns Ukrainian when stored lang is uk", () => {
    adminLangs.set("333", "uk");
    const msg = { chat: { id: "333" }, from: { language_code: "en" } };

    const result = t(msg, "capacity_set", { title: "Salsa", n: 20 });

    expect(result).toBe("📏 Salsa: макс 20");
  });
});

describe("REGRESSION: new i18n keys work", () => {
  let adminLangs;

  beforeEach(() => {
    adminLangs = new Map();
    initI18n(adminLangs);
  });

  it("lang_btn_en returns English button label", () => {
    const msg = { from: { language_code: "en" } };
    expect(t(msg, "lang_btn_en")).toBe("🇬🇧 English");
  });

  it("lang_btn_de returns German button label", () => {
    adminLangs.set("123", "de");
    const msg = { chat: { id: "123" }, from: { language_code: "en" } };
    expect(t(msg, "lang_btn_de")).toBe("🇩🇪 Deutsch");
  });

  it("lang_btn_ru returns Russian button label", () => {
    adminLangs.set("456", "ru");
    const msg = { chat: { id: "456" }, from: { language_code: "en" } };
    expect(t(msg, "lang_btn_ru")).toBe("🇷🇺 Русский");
  });

  it("lang_name_en returns English language name", () => {
    const msg = { from: { language_code: "en" } };
    expect(t(msg, "lang_name_en")).toBe("English");
  });

  it("lang_name_de returns German language name", () => {
    adminLangs.set("789", "de");
    const msg = { chat: { id: "789" }, from: { language_code: "en" } };
    expect(t(msg, "lang_name_de")).toBe("Deutsch");
  });

  it("role_L returns Leader label", () => {
    const msg = { from: { language_code: "en" } };
    expect(t(msg, "role_L")).toBe("🕺 Leader");
  });

  it("role_F returns Follower label", () => {
    const msg = { from: { language_code: "en" } };
    expect(t(msg, "role_F")).toBe("💃 Follower");
  });
});