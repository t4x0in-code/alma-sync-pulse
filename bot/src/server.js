// AlmaLatina Bot — Single Source of Truth
// Express REST API + SQLite + Telegram polling
//
// Domain model:
//   classes         — kурсы
//   enrollments     — заявки (ученик: имя, gender L/F, возраст, фото, коммент)
//   pairs           — подтверждённые/предложенные пары (leader_id, follower_id, status)
//   reserved_pairs  — постоянно зарезервированные пары (двухбуквенные ники)
//
// Env: TELEGRAM_TOKEN, ADMIN_TOKEN, ADMIN_CHAT_IDS (comma separated),
//      PORT (default 8080), DB_PATH (default /data/almalatina.db),
//      CORS_ORIGIN (default *), MAX_PHOTO_BYTES (default 800000 ~ 800KB base64).

import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import TelegramBot from "node-telegram-bot-api";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { createHmac, randomBytes } from "crypto";
import { t, lang, initI18n } from "./i18n.js";

const {
  TELEGRAM_TOKEN,
  ADMIN_TOKEN = "change-me",
  ADMIN_CHAT_IDS = "",
  PORT = "8080",
  DB_PATH = "/data/almalatina.db",
  CORS_ORIGIN = "*",
  MAX_PHOTO_BYTES = "800000",
  JWT_SECRET = "insecure-dev-secret",
} = process.env;

const MAX_PHOTO = Number(MAX_PHOTO_BYTES);

const adminChatIds = new Set(
  ADMIN_CHAT_IDS.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

// ---------- JWT helpers ----------
function signAdminJwt() {
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const data = JSON.stringify({ role: "admin", exp });
  const sig = createHmac("sha256", JWT_SECRET).update(data).digest("hex");
  return Buffer.from(data).toString("base64url") + "." + sig;
}
function verifyAdminJwt(token) {
  const [dataB64, sig] = token.split(".");
  if (!dataB64 || !sig) throw new Error("malformed");
  const data = Buffer.from(dataB64, "base64url").toString();
  const expected = createHmac("sha256", JWT_SECRET).update(data).digest("hex");
  if (sig !== expected) throw new Error("invalid");
  const payload = JSON.parse(data);
  if (payload.exp < Date.now()) throw new Error("expired");
  return payload;
}

// ---------- Pending auth requests ----------
const pendingAuth = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [id, v] of pendingAuth) if (v.expires < now) pendingAuth.delete(id);
}, 60_000);

// Stores language code per admin chat ID (populated on /lang)
const adminLangs = new Map();

// Re-export for i18n module
export { adminLangs };

// Initialize i18n with adminLangs Map
initI18n(adminLangs);

// ---------- Sequential /add wizard ----------
const addWizardState = new Map(); // chatId -> { step, classId, gender, name, age, photo }

// ---------- DB ----------
mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL,
    schedule TEXT NOT NULL,
    max_capacity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    external_url TEXT NOT NULL DEFAULT 'https://almalatina.de/',
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,           -- 'L' (Leader/M) | 'F' (Follower/Ж)
    age INTEGER,
    email TEXT,
    phone TEXT,
    photo TEXT,                     -- data URL (base64) or external URL
    comment TEXT,
    looking_for TEXT,               -- enrollment.id partner preference (optional)
    source TEXT NOT NULL DEFAULT 'web', -- 'web' | 'tg:<chatid>' | 'admin'
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS pairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    leader_id INTEGER NOT NULL,
    follower_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'proposed', -- 'proposed' | 'confirmed'
    created_at INTEGER NOT NULL,
    UNIQUE(class_id, leader_id, follower_id)
  );
  CREATE TABLE IF NOT EXISTS reserved_pairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    leader_nick TEXT NOT NULL,      -- 2 letters
    follower_nick TEXT NOT NULL,    -- 2 letters
    note TEXT,
    UNIQUE(class_id, leader_nick, follower_nick)
  );
  CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    payload TEXT,
    created_at INTEGER NOT NULL
  );
`);

// Migration: drop legacy current_enrollment column if present (now derived).
try {
  const cols = db.prepare("PRAGMA table_info(classes)").all();
  if (cols.some((c) => c.name === "current_enrollment")) {
    // SQLite supports DROP COLUMN since 3.35
    db.exec("ALTER TABLE classes DROP COLUMN current_enrollment");
  }
  const ecols = db.prepare("PRAGMA table_info(enrollments)").all();
  const has = (n) => ecols.some((c) => c.name === n);
  if (!has("gender"))
    db.exec("ALTER TABLE enrollments ADD COLUMN gender TEXT NOT NULL DEFAULT 'L'");
  if (!has("age")) db.exec("ALTER TABLE enrollments ADD COLUMN age INTEGER");
  if (!has("photo")) db.exec("ALTER TABLE enrollments ADD COLUMN photo TEXT");
  if (!has("comment")) db.exec("ALTER TABLE enrollments ADD COLUMN comment TEXT");
  if (!has("looking_for")) db.exec("ALTER TABLE enrollments ADD COLUMN looking_for TEXT");
  if (!has("source"))
    db.exec("ALTER TABLE enrollments ADD COLUMN source TEXT NOT NULL DEFAULT 'web'");
} catch (e) {
  console.warn("Migration warning:", e.message);
}

// Seed default Thursday class
const seed = db.prepare("SELECT COUNT(*) AS n FROM classes").get();
if (seed.n === 0) {
  db.prepare(
    `INSERT INTO classes (id,title,instructor,schedule,max_capacity,status,external_url,description)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).run(
    "thu-2000-cubana",
    "Salsa Cubana — Open Level",
    "Tony",
    "Donnerstag · 20:00 – 21:30",
    20,
    "open",
    "https://almalatina.de/",
    "Wöchentlicher Kurs für alle Levels. Authentische kubanische Salsa.",
  );
}

// Seed reserved pairs (постоянные)
const seedR = db.prepare("SELECT COUNT(*) AS n FROM reserved_pairs").get();
if (seedR.n === 0) {
  const ins = db.prepare(
    "INSERT INTO reserved_pairs (class_id,leader_nick,follower_nick,note) VALUES (?,?,?,?)",
  );
  const cls = "thu-2000-cubana";
  [
    ["TO", "MA", "Tony & Maria"],
    ["RA", "EL", "Rafael & Elena"],
    ["JO", "AN", "José & Ana"],
    ["CA", "SO", "Carlos & Sofía"],
    ["DI", "LU", "Diego & Lucía"],
  ].forEach(([l, f, n]) => ins.run(cls, l, f, n));
}

const log = (actor, action, payload) =>
  db
    .prepare("INSERT INTO admin_logs (actor,action,payload,created_at) VALUES (?,?,?,?)")
    .run(actor, action, payload ? JSON.stringify(payload) : null, Date.now());

// ---------- Helpers ----------
const getClass = (id) => db.prepare("SELECT * FROM classes WHERE id = ?").get(id);
const listClassesRaw = () => db.prepare("SELECT * FROM classes ORDER BY id").all();

const countByGender = (classId) => {
  const rows = db
    .prepare("SELECT gender, COUNT(*) AS n FROM enrollments WHERE class_id=? GROUP BY gender")
    .all(classId);
  const out = { L: 0, F: 0 };
  rows.forEach((r) => (out[r.gender] = r.n));
  return out;
};

const listEnrollments = (classId) =>
  db
    .prepare(
      `SELECT id, class_id, name, gender, age, email, phone, photo, comment,
              looking_for, source, created_at
         FROM enrollments WHERE class_id=? ORDER BY created_at ASC`,
    )
    .all(classId);

const listPairs = (classId) =>
  db
    .prepare(
      `SELECT id, class_id, leader_id, follower_id, status, created_at
         FROM pairs WHERE class_id=? ORDER BY created_at ASC`,
    )
    .all(classId);

const listReserved = (classId) =>
  db
    .prepare(
      `SELECT id, class_id, leader_nick, follower_nick, note
         FROM reserved_pairs WHERE class_id=? ORDER BY id ASC`,
    )
    .all(classId);

const computeStatus = (klass, totalEnroll) => {
  if (klass.status === "closed") return "closed";
  if (totalEnroll >= klass.max_capacity) return "closed";
  if (totalEnroll >= klass.max_capacity * 0.8) return "limited";
  return "open";
};

const enrichClass = (klass) => {
  const enrollments = listEnrollments(klass.id);
  const counts = countByGender(klass.id);
  const pairs = listPairs(klass.id);
  const reserved = listReserved(klass.id);
  const total = enrollments.length;
  return {
    ...klass,
    current_enrollment: total,
    counts_by_gender: counts,
    enrollments,
    pairs,
    reserved,
    status: computeStatus(klass, total),
  };
};

const listClasses = () => listClassesRaw().map(enrichClass);

const validatePhoto = (photo) => {
  if (!photo) return null;
  if (typeof photo !== "string") throw new Error("invalid photo");
  if (photo.length > MAX_PHOTO) throw new Error("photo too large");
  if (!/^data:image\/(png|jpe?g|webp);base64,/.test(photo) && !/^https?:\/\//.test(photo))
    throw new Error("photo must be data URL or http(s) URL");
  return photo;
};

// ---------- Telegram ----------
let bot = null;
if (TELEGRAM_TOKEN) {
  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
  console.log("✓ Telegram bot started (polling)");

  // Register commands in bot menu
  bot.setMyCommands([
    { command: "start", description: "Start bot" },
    { command: "status", description: "Class overview" },
    { command: "list", description: "List enrollments" },
    { command: "lang", description: "Change language" },
    { command: "add", description: "Add enrollment" },
    { command: "addwizard", description: "Wizard add (step by step)" },
    { command: "del", description: "Delete enrollment" },
    { command: "match", description: "Propose pair" },
    { command: "confirm", description: "Confirm pair" },
    { command: "unpair", description: "Remove pair" },
    { command: "reserved", description: "List reserved" },
    { command: "add_reserved", description: "Add reserved" },
    { command: "del_reserved", description: "Delete reserved" },
    { command: "block", description: "Close class" },
    { command: "open", description: "Open class" },
    { command: "add_spot", description: "Add spot" },
    { command: "set_capacity", description: "Set capacity" },
  ]);

  const isAdmin = (msg) => adminChatIds.size === 0 || adminChatIds.has(String(msg.chat.id));

  bot.onText(/^\/start/, (msg) => {
    // Only set on FIRST interaction - don't overwrite explicit language choice
    if (!adminLangs.has(String(msg.chat.id))) {
      adminLangs.set(String(msg.chat.id), lang(msg.from));
    }
    bot.sendMessage(msg.chat.id, t(msg, "start", { chatId: msg.chat.id }), {
      parse_mode: "Markdown",
    });
  });

  // Language chooser
  bot.onText(/^\/lang/, (msg) => {
    const langs = ["en", "de", "ru", "uk", "fr", "tr", "it", "es"];
    const rows = [];
    for (let i = 0; i < langs.length; i += 2) {
      rows.push([
        { text: t(msg, "lang_btn_" + langs[i]), callback_data: "lang:" + langs[i] },
        { text: t(msg, "lang_btn_" + langs[i + 1]), callback_data: "lang:" + langs[i + 1] },
      ]);
    }
    bot.sendMessage(msg.chat.id, t(msg, "choose_lang"), {
      reply_markup: JSON.stringify({ inline_keyboard: rows }),
    });
  });

  bot.onText(/^\/status/, (msg) => {
    const l = msg;
    if (!isAdmin(msg)) return bot.sendMessage(msg.chat.id, t(msg, "no_access"));
    const rows = listClasses();
    if (!rows.length) return bot.sendMessage(msg.chat.id, t(msg, "no_courses"));
    const txt = rows
      .map((c) => {
        const confirmed = c.pairs.filter((p) => p.status === "confirmed").length;
        const proposed = c.pairs.filter((p) => p.status === "proposed").length;
        return t(msg, "status_line", {
          title: c.title,
          id: c.id,
          schedule: c.schedule,
          enrolled: c.current_enrollment,
          cap: c.max_capacity,
          status: c.status,
          f: c.counts_by_gender.F,
          l: c.counts_by_gender.L,
          confirmed,
          proposed,
          reserved: c.reserved.length,
        });
      })
      .join("\n\n");
    bot.sendMessage(msg.chat.id, txt, { parse_mode: "Markdown" });
  });

  const guard = (msg) => {
    if (!isAdmin(msg)) {
      bot.sendMessage(msg.chat.id, t(msg, "no_access"));
      return false;
    }
    return true;
  };

  bot.onText(/^\/list(?:\s+(\S+))?$/, (msg, m) => {
    if (!guard(msg)) return;
    const l = msg;
    const classIdArg = m[1];
    const classes = listClassesRaw();

    const sendEnrollmentList = (c) => {
      const en = listEnrollments(c.id);
      if (!en.length) return bot.sendMessage(msg.chat.id, t(msg, "no_enrollments"));
      const txt = en
        .map(
          (r) =>
            `#${r.id} ${r.gender === "L" ? "🕺" : "💃"} *${r.name}*${r.age ? `, ${r.age}` : ""}${r.comment ? `\n   _${r.comment}_` : ""}`,
        )
        .join("\n");
      bot.sendMessage(msg.chat.id, `*${c.title}*\n${txt}`, { parse_mode: "Markdown" });
    };

    if (classIdArg) {
      const c = getClass(classIdArg);
      if (!c) return bot.sendMessage(msg.chat.id, t(msg, "course_not_found"));
      return sendEnrollmentList(c);
    }

    if (classes.length === 1) {
      return sendEnrollmentList(classes[0]);
    }

    const kb = {
      inline_keyboard: classes.map((c) => [{ text: c.title, callback_data: `list_class:${c.id}` }]),
    };
    bot.sendMessage(msg.chat.id, t(msg, "select_class"), {
      reply_markup: JSON.stringify(kb),
    });
  });

  bot.onText(/^\/add\s+(\S+)\s+(L|F)\s+(.+?)(?:\s+(\d{1,3}))?$/i, (msg, m) => {
    if (!guard(msg)) return;
    const l = lang(msg.from);
    const [, classId, g, name, age] = m;
    const c = getClass(classId);
    if (!c) return bot.sendMessage(msg.chat.id, t(msg, "course_not_found"));
    const r = db
      .prepare(
        "INSERT INTO enrollments (class_id,name,gender,age,source,created_at) VALUES (?,?,?,?,?,?)",
      )
      .run(
        classId,
        name.trim(),
        g.toUpperCase(),
        age ? Number(age) : null,
        `tg:${msg.chat.id}`,
        Date.now(),
      );
    log(`tg:${msg.chat.id}`, "add_enrollment", { classId, id: r.lastInsertRowid });
    bot.sendMessage(msg.chat.id, t(msg, "added", { id: r.lastInsertRowid }));
  });

  // Helper: send wizard confirm message with OK/Cancel keyboard
  const sendWizardConfirm = (chatId, ctx, state) => {
    const c = getClass(state.classId);
    const text = t(ctx, "add_wizard_confirm", {
      name: state.name,
      gender: t(ctx, state.gender === "L" ? "role_L" : "role_F"),
      age: state.age ?? "—",
      photo: "—",
      class: c?.title ?? state.classId,
    });
    return bot.sendMessage(chatId, text, {
      reply_markup: JSON.stringify({ inline_keyboard: [[
        { text: t(ctx, "add_wizard_yes"), callback_data: "awiz:confirm:yes" },
        { text: t(ctx, "add_wizard_no"),  callback_data: "awiz:confirm:no" },
      ]] }),
    });
  };

  // Sequential /add wizard - start
  bot.onText(/^\/addwizard$/, (msg) => {
    if (!isAdmin(msg)) return bot.sendMessage(msg.chat.id, t(msg, "no_access"));
    const chatId = String(msg.chat.id);
    addWizardState.set(chatId, { step: "class", classId: "", gender: "", name: "", age: "" });
    const classes = listClassesRaw();
    const kb = {
      inline_keyboard: classes.map((c) => [{ text: c.title, callback_data: `awiz:cls:${c.id}` }]),
    };
    bot.sendMessage(msg.chat.id, t(msg, "add_wizard_select_class"), {
      reply_markup: JSON.stringify(kb),
    });
  });

  // Sequential /add wizard - ALL callback handling in ONE place
  bot.on("callback_query", (q) => {
    const parts = (q.data ?? "").split(":");
    const ns = parts[0];
    const action = parts[1];
    const val = parts[2];
    const chatId = String(q.message?.chat?.id);

    // Wizard: class selected
    if (ns === "awiz" && action === "cls") {
      const state = addWizardState.get(chatId);
      if (!state || state.step !== "class") return bot.answerCallbackQuery(q.id);
      state.classId = val;
      state.step = "gender";
      addWizardState.set(chatId, state);
      bot.answerCallbackQuery(q.id);
      const kb = {
        inline_keyboard: [
          [{ text: "🕺 Leader", callback_data: `awiz:gender:L` }],
          [{ text: "💃 Follower", callback_data: `awiz:gender:F` }],
        ],
      };
      return bot.editMessageText(t(q, "add_wizard_gender"), {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
        reply_markup: JSON.stringify(kb),
      });
    }

    // Wizard: gender selected -> save to DB immediately!
    if (ns === "awiz" && action === "gender") {
      const state = addWizardState.get(chatId);
      if (!state || state.step !== "gender") return bot.answerCallbackQuery(q.id);
      state.gender = val;
      state.step = "name";
      addWizardState.set(chatId, state);
      bot.answerCallbackQuery(q.id);
      return bot.editMessageText(t(q, "add_wizard_name"), {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
      });
    }

    // Wizard: skip age
    if (ns === "awiz" && action === "age") {
      const state = addWizardState.get(chatId);
      if (!state || state.step !== "age") return bot.answerCallbackQuery(q.id);
      state.age = null;
      state.step = "confirm";
      addWizardState.set(chatId, state);
      bot.answerCallbackQuery(q.id);
      return sendWizardConfirm(q.message.chat.id, q, state);
    }

    // Wizard: confirm or cancel enrollment
    if (ns === "awiz" && action === "confirm") {
      const state = addWizardState.get(chatId);
      if (!state || state.step !== "confirm") return bot.answerCallbackQuery(q.id);
      if (val === "no") {
        addWizardState.delete(chatId);
        bot.answerCallbackQuery(q.id);
        return bot.editMessageText(t(q, "add_wizard_cancel"), {
          chat_id: q.message.chat.id,
          message_id: q.message.message_id,
        });
      }
      try {
        const r = db
          .prepare("INSERT INTO enrollments (class_id,name,gender,age,source,created_at) VALUES (?,?,?,?,?,?)")
          .run(state.classId, state.name.trim(), state.gender, state.age ?? null, `tg:${chatId}`, Date.now());
        log(`tg:${chatId}`, "add_enrollment_wizard", { id: r.lastInsertRowid });
        addWizardState.delete(chatId);
        bot.answerCallbackQuery(q.id);
        bot.editMessageText(t(q, "add_wizard_success", { id: r.lastInsertRowid }), {
          chat_id: q.message.chat.id,
          message_id: q.message.message_id,
        });
        const c = getClass(state.classId);
        notifyAdmins((al) => t({ from: { language_code: al } }, "notify_enroll", {
          role: state.gender === "L" ? "🕺 Leader" : "💃 Follower",
          name: state.name,
          age: state.age ? `, ${state.age}` : "",
          comment: "",
          title: c?.title ?? state.classId,
          id: r.lastInsertRowid,
        }));
      } catch (e) {
        console.error("wizard confirm error:", e.message);
        bot.answerCallbackQuery(q.id, { text: t(q, "db_error") });
      }
      return;
    }

    // Existing handlers below
    if (ns === "list_class") {
      const c = getClass(action);
      if (!c) return bot.answerCallbackQuery(q.id, { text: t(q, "course_not_found") });
      const en = listEnrollments(c.id);
      const txt = en
        .map(
          (r) =>
            `#${r.id} ${r.gender === "L" ? "🕺" : "💃"} *${r.name}*${r.age ? `, ${r.age}` : ""}${r.comment ? `\n   _${r.comment}_` : ""}`,
        )
        .join("\n");
      bot.answerCallbackQuery(q.id);
      return bot.editMessageText(`*${c.title}*\n${txt}`, {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
        parse_mode: "Markdown",
      });
    }

    if (ns === "lang") {
      const newLang = action;
      adminLangs.set(String(q.message.chat.id), newLang);
      bot.answerCallbackQuery(q.id, { text: t(q, "lang_changed") });
      return bot.editMessageText(t(q, "lang_selected", { lang: t(q, "lang_name_" + newLang) }), {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
      });
    }

    if (ns !== "auth") return bot.answerCallbackQuery(q.id);
    const entry = pendingAuth.get(val);
    if (!entry || entry.expires < Date.now()) {
      pendingAuth.delete(val);
      bot.answerCallbackQuery(q.id, { text: t(q, "auth_expired_cb") });
      return bot.editMessageText(t(q, "auth_expired_msg"), {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
      });
    }
    if (action === "ok") {
      entry.jwt = signAdminJwt();
      entry.status = "ok";
      bot.answerCallbackQuery(q.id, { text: t(q, "auth_confirmed_cb") });
      bot.editMessageText(t(q, "auth_confirmed_msg"), {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
      });
    } else {
      entry.status = "denied";
      bot.answerCallbackQuery(q.id, { text: t(q, "auth_denied_cb") });
      bot.editMessageText(t(q, "auth_denied_msg"), {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
      });
    }
  });
  // Wizard text input handler (name and age steps)
  bot.on("message", (msg) => {
    if (!isAdmin(msg)) return;
    const chatId = String(msg.chat.id);
    const state = addWizardState.get(chatId);
    if (!state) return;
    const text = msg.text?.trim();
    if (!text || text.startsWith("/")) return; // ignore commands mid-wizard

    if (state.step === "name") {
      if (text.length < 2 || text.length > 80) {
        return bot.sendMessage(msg.chat.id, t(msg, "add_wizard_name") + " (2–80 chars)");
      }
      state.name = text;
      state.step = "age";
      addWizardState.set(chatId, state);
      return bot.sendMessage(msg.chat.id, t(msg, "add_wizard_age"), {
        reply_markup: JSON.stringify({ inline_keyboard: [[
          { text: t(msg, "add_wizard_skip"), callback_data: "awiz:age:skip" },
        ]] }),
      });
    }

    if (state.step === "age") {
      const age = parseInt(text, 10);
      if (isNaN(age) || age < 10 || age > 99) {
        return bot.sendMessage(msg.chat.id, "❌ Age must be 10–99, or tap Skip.");
      }
      state.age = age;
      state.step = "confirm";
      addWizardState.set(chatId, state);
      return sendWizardConfirm(msg.chat.id, msg, state);
    }
  });

} else {
  console.warn("⚠ TELEGRAM_TOKEN not set — bot disabled, REST API only");
}

const notifyAdmins = (text) => {
  if (!bot) return;
  for (const chatId of adminChatIds) {
    const al = adminLangs.get(chatId) ?? "en";
    const msg = typeof text === "function" ? text(al) : text;
    bot.sendMessage(chatId, msg, { parse_mode: "Markdown" }).catch(() => {});
  }
};

// ---------- REST API ----------
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.get("/api/classes", (_req, res) => res.json(listClasses()));

app.get("/api/classes/:id", (req, res) => {
  const c = getClass(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  res.json(enrichClass(c));
});

// Public enrollment (gender + age + photo + comment)
app.post("/api/enroll", (req, res) => {
  try {
    const { class_id, name, gender, age, email, phone, photo, comment } = req.body || {};
    if (!class_id || !name) return res.status(400).json({ error: "class_id, name required" });
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 80)
      return res.status(400).json({ error: "invalid name" });
    if (gender !== "L" && gender !== "F")
      return res.status(400).json({ error: "gender must be 'L' or 'F'" });
    if (age != null && (!Number.isInteger(age) || age < 10 || age > 99))
      return res.status(400).json({ error: "invalid age (10-99)" });
    if (email && (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120))
      return res.status(400).json({ error: "invalid email" });
    if (comment && (typeof comment !== "string" || comment.length > 400))
      return res.status(400).json({ error: "comment too long (max 400)" });
    const cleanPhoto = validatePhoto(photo);

    const c = getClass(class_id);
    if (!c) return res.status(404).json({ error: "class not found" });
    const enrolled = listEnrollments(class_id).length;
    if (c.status === "closed" || enrolled >= c.max_capacity)
      return res.status(409).json({ error: "class is full" });

    const r = db
      .prepare(
        `INSERT INTO enrollments (class_id,name,gender,age,email,phone,photo,comment,source,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        class_id,
        name.trim(),
        gender,
        age ?? null,
        email?.trim() || null,
        phone?.trim() || null,
        cleanPhoto,
        comment?.trim() || null,
        "web",
        Date.now(),
      );

    log("web", "enroll", { class_id, id: r.lastInsertRowid });
    notifyAdmins((al) =>
      t(al, "notify_enroll", {
        role: t(al, "role_" + gender),
        name,
        age: age ? `, ${age}` : "",
        comment: comment ? `\n_${comment}_` : "",
        title: c.title,
        id: r.lastInsertRowid,
      }),
    );
    res.json({ ok: true, enrollment_id: r.lastInsertRowid, class: enrichClass(c) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Auth endpoints
app.post("/api/auth/request", (req, res) => {
  if (!adminChatIds.size) return res.status(503).json({ error: "ADMIN_CHAT_IDS not configured" });
  const requestId = randomBytes(8).toString("hex");
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  pendingAuth.set(requestId, {
    pin,
    status: "pending",
    jwt: null,
    expires: Date.now() + 10 * 60 * 1000,
  });
  for (const chatId of adminChatIds) {
    const al = adminLangs.get(chatId) ?? "en";
    bot
      .sendMessage(chatId, t(al, "auth_request", { pin }), {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: t(al, "auth_confirm_btn"), callback_data: `auth:ok:${requestId}` },
              { text: t(al, "auth_deny_btn"), callback_data: `auth:deny:${requestId}` },
            ],
          ],
        },
      })
      .catch(() => {});
  }
  res.json({ requestId, pin });
});

app.get("/api/auth/poll/:id", (req, res) => {
  const entry = pendingAuth.get(req.params.id);
  if (!entry || entry.expires < Date.now()) {
    pendingAuth.delete(req.params.id);
    return res.json({ status: "expired" });
  }
  if (entry.status === "pending") return res.json({ status: "pending" });
  const { status, jwt } = entry;
  pendingAuth.delete(req.params.id);
  res.json({ status, ...(jwt ? { token: jwt } : {}) });
});

// Admin guard
app.use("/api/admin", (req, res, next) => {
  const t = req.headers["x-admin-token"];
  if (t) {
    try {
      verifyAdminJwt(t);
      return next();
    } catch (_) {}
    if (t === ADMIN_TOKEN) return next(); // legacy fallback
  }
  return res.status(401).json({ error: "unauthorized" });
});

// --- Class CRUD ---
app.patch("/api/admin/classes/:id", (req, res) => {
  const c = getClass(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  const allowed = [
    "title",
    "instructor",
    "schedule",
    "max_capacity",
    "status",
    "external_url",
    "description",
  ];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
  if (!Object.keys(patch).length) return res.status(400).json({ error: "no fields" });
  const sets = Object.keys(patch)
    .map((k) => `${k}=?`)
    .join(",");
  db.prepare(`UPDATE classes SET ${sets} WHERE id=?`).run(...Object.values(patch), c.id);
  log("admin", "patch_class", { id: c.id, patch });
  res.json(enrichClass(getClass(c.id)));
});

app.post("/api/admin/classes", (req, res) => {
  const { id, title, instructor, schedule, max_capacity, external_url, description } =
    req.body || {};
  if (!id || !title) return res.status(400).json({ error: "id, title required" });
  try {
    db.prepare(
      `INSERT INTO classes (id,title,instructor,schedule,max_capacity,status,external_url,description)
       VALUES (?,?,?,?,?,'open',?,?)`,
    ).run(
      id,
      title,
      instructor || "Tony",
      schedule || "TBD",
      max_capacity || 20,
      external_url || "https://almalatina.de/",
      description || null,
    );
    log("admin", "create_class", { id });
    res.json(enrichClass(getClass(id)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/admin/classes/:id", (req, res) => {
  db.prepare("DELETE FROM classes WHERE id=?").run(req.params.id);
  db.prepare("DELETE FROM enrollments WHERE class_id=?").run(req.params.id);
  db.prepare("DELETE FROM pairs WHERE class_id=?").run(req.params.id);
  db.prepare("DELETE FROM reserved_pairs WHERE class_id=?").run(req.params.id);
  log("admin", "delete_class", { id: req.params.id });
  res.json({ ok: true });
});

// --- Enrollment CRUD (admin) ---
app.post("/api/admin/enrollments", (req, res) => {
  try {
    const { class_id, name, gender, age, email, phone, photo, comment } = req.body || {};
    if (!class_id || !name || !gender)
      return res.status(400).json({ error: "class_id, name, gender required" });
    if (gender !== "L" && gender !== "F") return res.status(400).json({ error: "invalid gender" });
    const cleanPhoto = validatePhoto(photo);
    const r = db
      .prepare(
        `INSERT INTO enrollments (class_id,name,gender,age,email,phone,photo,comment,source,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        class_id,
        name.trim(),
        gender,
        age ?? null,
        email || null,
        phone || null,
        cleanPhoto,
        comment || null,
        "admin",
        Date.now(),
      );
    log("admin", "add_enrollment", { id: r.lastInsertRowid });
    res.json({ ok: true, id: r.lastInsertRowid, class: enrichClass(getClass(class_id)) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch("/api/admin/enrollments/:id", (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare("SELECT * FROM enrollments WHERE id=?").get(id);
  if (!cur) return res.status(404).json({ error: "not found" });
  const allowed = ["name", "gender", "age", "email", "phone", "photo", "comment", "looking_for"];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
  if (patch.gender !== undefined && patch.gender !== "L" && patch.gender !== "F")
    return res.status(400).json({ error: "invalid gender" });
  if (patch.photo !== undefined) patch.photo = validatePhoto(patch.photo);
  if (!Object.keys(patch).length) return res.status(400).json({ error: "no fields" });
  const sets = Object.keys(patch)
    .map((k) => `${k}=?`)
    .join(",");
  db.prepare(`UPDATE enrollments SET ${sets} WHERE id=?`).run(...Object.values(patch), id);
  log("admin", "patch_enrollment", { id, patch });
  res.json({ ok: true, class: enrichClass(getClass(cur.class_id)) });
});

app.delete("/api/admin/enrollments/:id", (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare("SELECT * FROM enrollments WHERE id=?").get(id);
  if (!cur) return res.status(404).json({ error: "not found" });
  db.prepare("DELETE FROM pairs WHERE leader_id=? OR follower_id=?").run(id, id);
  db.prepare("DELETE FROM enrollments WHERE id=?").run(id);
  log("admin", "del_enrollment", { id });
  res.json({ ok: true, class: enrichClass(getClass(cur.class_id)) });
});

// --- Pairs ---
app.post("/api/admin/pairs", (req, res) => {
  try {
    const { leader_id, follower_id, status = "proposed" } = req.body || {};
    const a = db.prepare("SELECT * FROM enrollments WHERE id=?").get(Number(leader_id));
    const b = db.prepare("SELECT * FROM enrollments WHERE id=?").get(Number(follower_id));
    if (!a || !b) return res.status(404).json({ error: "enrollment not found" });
    if (a.class_id !== b.class_id) return res.status(400).json({ error: "different classes" });
    if (a.gender !== "L" || b.gender !== "F")
      return res.status(400).json({ error: "leader_id must be L, follower_id must be F" });
    const r = db
      .prepare(
        "INSERT INTO pairs (class_id,leader_id,follower_id,status,created_at) VALUES (?,?,?,?,?)",
      )
      .run(a.class_id, a.id, b.id, status === "confirmed" ? "confirmed" : "proposed", Date.now());
    log("admin", "create_pair", { id: r.lastInsertRowid });
    res.json({ ok: true, id: r.lastInsertRowid, class: enrichClass(getClass(a.class_id)) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch("/api/admin/pairs/:id", (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare("SELECT * FROM pairs WHERE id=?").get(id);
  if (!cur) return res.status(404).json({ error: "not found" });
  const { status } = req.body || {};
  if (status !== "proposed" && status !== "confirmed")
    return res.status(400).json({ error: "invalid status" });
  db.prepare("UPDATE pairs SET status=? WHERE id=?").run(status, id);
  log("admin", "patch_pair", { id, status });
  res.json({ ok: true, class: enrichClass(getClass(cur.class_id)) });
});

app.delete("/api/admin/pairs/:id", (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare("SELECT * FROM pairs WHERE id=?").get(id);
  if (!cur) return res.status(404).json({ error: "not found" });
  db.prepare("DELETE FROM pairs WHERE id=?").run(id);
  log("admin", "del_pair", { id });
  res.json({ ok: true, class: enrichClass(getClass(cur.class_id)) });
});

// --- Reserved pairs ---
app.post("/api/admin/reserved", (req, res) => {
  try {
    const { class_id, leader_nick, follower_nick, note } = req.body || {};
    if (!class_id || !leader_nick || !follower_nick)
      return res.status(400).json({ error: "missing fields" });
    if (!/^[A-Za-z]{2}$/.test(leader_nick) || !/^[A-Za-z]{2}$/.test(follower_nick))
      return res.status(400).json({ error: "nicks must be 2 letters" });
    const r = db
      .prepare(
        "INSERT INTO reserved_pairs (class_id,leader_nick,follower_nick,note) VALUES (?,?,?,?)",
      )
      .run(class_id, leader_nick.toUpperCase(), follower_nick.toUpperCase(), note || null);
    log("admin", "add_reserved", { id: r.lastInsertRowid });
    res.json({ ok: true, id: r.lastInsertRowid, class: enrichClass(getClass(class_id)) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/admin/reserved/:id", (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare("SELECT * FROM reserved_pairs WHERE id=?").get(id);
  if (!cur) return res.status(404).json({ error: "not found" });
  db.prepare("DELETE FROM reserved_pairs WHERE id=?").run(id);
  log("admin", "del_reserved", { id });
  res.json({ ok: true, class: enrichClass(getClass(cur.class_id)) });
});

app.listen(Number(PORT), () => {
  console.log(`✓ AlmaLatina API listening on :${PORT}`);
  console.log(`  CORS: ${CORS_ORIGIN}`);
  console.log(`  DB: ${DB_PATH}`);
  console.log(`  Admin chats: ${[...adminChatIds].join(", ") || "(open)"}`);
});
