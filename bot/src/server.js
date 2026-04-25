// AlmaLatina Bot — Single Source of Truth
// Express REST API + SQLite + Telegram polling
// All env vars: TELEGRAM_TOKEN, ADMIN_TOKEN, ADMIN_CHAT_IDS (comma separated),
//   PORT (default 8080), DB_PATH (default /data/almalatina.db), CORS_ORIGIN (default *)

import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import TelegramBot from "node-telegram-bot-api";
import { mkdirSync } from "fs";
import { dirname } from "path";

const {
  TELEGRAM_TOKEN,
  ADMIN_TOKEN = "change-me",
  ADMIN_CHAT_IDS = "",
  PORT = "8080",
  DB_PATH = "/data/almalatina.db",
  CORS_ORIGIN = "*",
} = process.env;

const adminChatIds = new Set(
  ADMIN_CHAT_IDS.split(",").map((s) => s.trim()).filter(Boolean),
);

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
    current_enrollment INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open',
    external_url TEXT NOT NULL DEFAULT 'https://almalatina.de/',
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    payload TEXT,
    created_at INTEGER NOT NULL
  );
`);

// Seed default Thursday class
const seed = db.prepare("SELECT COUNT(*) AS n FROM classes").get();
if (seed.n === 0) {
  db.prepare(
    `INSERT INTO classes (id,title,instructor,schedule,max_capacity,current_enrollment,status,external_url,description)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(
    "thu-2000-cubana",
    "Salsa Cubana — Open Level",
    "Tony",
    "Donnerstag · 20:00 – 21:30",
    20,
    0,
    "open",
    "https://almalatina.de/",
    "Wöchentlicher Kurs für alle Levels. Authentische kubanische Salsa.",
  );
}

const log = (actor, action, payload) =>
  db
    .prepare(
      "INSERT INTO admin_logs (actor,action,payload,created_at) VALUES (?,?,?,?)",
    )
    .run(actor, action, payload ? JSON.stringify(payload) : null, Date.now());

const recomputeStatus = (c) => {
  if (c.current_enrollment >= c.max_capacity) return "closed";
  if (c.current_enrollment >= c.max_capacity * 0.8) return "limited";
  return c.status === "closed" ? "closed" : "open";
};

const getClass = (id) =>
  db.prepare("SELECT * FROM classes WHERE id = ?").get(id);
const listClasses = () => db.prepare("SELECT * FROM classes ORDER BY id").all();

// ---------- Telegram ----------
let bot = null;
if (TELEGRAM_TOKEN) {
  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
  console.log("✓ Telegram bot started (polling)");

  const isAdmin = (msg) =>
    adminChatIds.size === 0 || adminChatIds.has(String(msg.chat.id));

  bot.onText(/^\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `🌹 *AlmaLatina Bot*\nDeine Chat-ID: \`${msg.chat.id}\`\n\nFüge sie zu ADMIN_CHAT_IDS hinzu, um Befehle zu nutzen.\n\nBefehle:\n/status — Übersicht\n/block <id> — Schliessen\n/open <id> — Öffnen\n/add\\_spot <id> — +1 Platz\n/set\\_capacity <id> <n>\n/list\\_enrollments <id>`,
      { parse_mode: "Markdown" },
    );
  });

  bot.onText(/^\/status/, (msg) => {
    if (!isAdmin(msg)) return bot.sendMessage(msg.chat.id, "🚫 Kein Zugriff.");
    const rows = listClasses();
    if (!rows.length) return bot.sendMessage(msg.chat.id, "Keine Kurse.");
    const txt = rows
      .map(
        (c) =>
          `*${c.title}* \`${c.id}\`\n${c.schedule}\n👥 ${c.current_enrollment}/${c.max_capacity} · ${c.status}`,
      )
      .join("\n\n");
    bot.sendMessage(msg.chat.id, txt, { parse_mode: "Markdown" });
  });

  const cmdWithId = (re, fn) =>
    bot.onText(re, (msg, m) => {
      if (!isAdmin(msg)) return bot.sendMessage(msg.chat.id, "🚫 Kein Zugriff.");
      const id = m[1];
      const c = getClass(id);
      if (!c) return bot.sendMessage(msg.chat.id, `❌ Kurs ${id} nicht gefunden.`);
      fn(msg, c, m);
    });

  cmdWithId(/^\/block\s+(\S+)/, (msg, c) => {
    db.prepare("UPDATE classes SET status='closed' WHERE id=?").run(c.id);
    log(`tg:${msg.chat.id}`, "block", { id: c.id });
    bot.sendMessage(msg.chat.id, `🔒 ${c.title} geschlossen.`);
  });

  cmdWithId(/^\/open\s+(\S+)/, (msg, c) => {
    db.prepare("UPDATE classes SET status='open' WHERE id=?").run(c.id);
    log(`tg:${msg.chat.id}`, "open", { id: c.id });
    bot.sendMessage(msg.chat.id, `🔓 ${c.title} geöffnet.`);
  });

  cmdWithId(/^\/add_spot\s+(\S+)/, (msg, c) => {
    db.prepare("UPDATE classes SET max_capacity=max_capacity+1 WHERE id=?").run(c.id);
    log(`tg:${msg.chat.id}`, "add_spot", { id: c.id });
    const next = getClass(c.id);
    bot.sendMessage(msg.chat.id, `➕ ${c.title}: ${next.max_capacity} Plätze.`);
  });

  cmdWithId(/^\/set_capacity\s+(\S+)\s+(\d+)/, (msg, c, m) => {
    const n = parseInt(m[2], 10);
    db.prepare("UPDATE classes SET max_capacity=? WHERE id=?").run(n, c.id);
    log(`tg:${msg.chat.id}`, "set_capacity", { id: c.id, n });
    bot.sendMessage(msg.chat.id, `📏 ${c.title}: max ${n}`);
  });

  cmdWithId(/^\/list_enrollments\s+(\S+)/, (msg, c) => {
    const rows = db
      .prepare("SELECT name,email,phone,created_at FROM enrollments WHERE class_id=? ORDER BY id DESC LIMIT 30")
      .all(c.id);
    if (!rows.length) return bot.sendMessage(msg.chat.id, "Noch keine Anmeldungen.");
    const txt = rows
      .map((r) => `• ${r.name} — ${r.email}${r.phone ? " · " + r.phone : ""}`)
      .join("\n");
    bot.sendMessage(msg.chat.id, `*${c.title}*\n${txt}`, { parse_mode: "Markdown" });
  });
} else {
  console.warn("⚠ TELEGRAM_TOKEN not set — bot disabled, REST API only");
}

const notifyAdmins = (text) => {
  if (!bot) return;
  for (const chatId of adminChatIds) {
    bot.sendMessage(chatId, text, { parse_mode: "Markdown" }).catch(() => {});
  }
};

// ---------- REST API ----------
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.get("/api/classes", (_req, res) => res.json(listClasses()));

app.get("/api/classes/:id", (req, res) => {
  const c = getClass(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  res.json(c);
});

app.post("/api/enroll", (req, res) => {
  const { class_id, name, email, phone } = req.body || {};
  if (!class_id || !name || !email)
    return res.status(400).json({ error: "class_id, name, email required" });
  if (typeof name !== "string" || name.length < 2 || name.length > 80)
    return res.status(400).json({ error: "invalid name" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120)
    return res.status(400).json({ error: "invalid email" });

  const c = getClass(class_id);
  if (!c) return res.status(404).json({ error: "class not found" });
  if (c.status === "closed" || c.current_enrollment >= c.max_capacity)
    return res.status(409).json({ error: "class is full" });

  db.prepare(
    "INSERT INTO enrollments (class_id,name,email,phone,created_at) VALUES (?,?,?,?,?)",
  ).run(class_id, name.trim(), email.trim(), phone?.trim() || null, Date.now());

  const newEnroll = c.current_enrollment + 1;
  const newStatus = recomputeStatus({ ...c, current_enrollment: newEnroll });
  db.prepare(
    "UPDATE classes SET current_enrollment=?, status=? WHERE id=?",
  ).run(newEnroll, newStatus, class_id);

  const updated = getClass(class_id);
  log("web", "enroll", { class_id, name, email });
  notifyAdmins(
    `🌹 *Neue Anmeldung*\n${name} (${email})\n→ *${c.title}*\n👥 ${newEnroll}/${c.max_capacity}`,
  );
  res.json({ ok: true, class: updated });
});

// Admin
app.use("/api/admin", (req, res, next) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN)
    return res.status(401).json({ error: "unauthorized" });
  next();
});

app.patch("/api/admin/classes/:id", (req, res) => {
  const c = getClass(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  const allowed = [
    "title",
    "instructor",
    "schedule",
    "max_capacity",
    "current_enrollment",
    "status",
    "external_url",
    "description",
  ];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
  if (!Object.keys(patch).length)
    return res.status(400).json({ error: "no fields" });

  const sets = Object.keys(patch).map((k) => `${k}=?`).join(",");
  db.prepare(`UPDATE classes SET ${sets} WHERE id=?`).run(
    ...Object.values(patch),
    c.id,
  );
  log("admin", "patch", { id: c.id, patch });
  res.json(getClass(c.id));
});

app.post("/api/admin/classes", (req, res) => {
  const { id, title, instructor, schedule, max_capacity, external_url, description } = req.body || {};
  if (!id || !title) return res.status(400).json({ error: "id, title required" });
  try {
    db.prepare(
      `INSERT INTO classes (id,title,instructor,schedule,max_capacity,current_enrollment,status,external_url,description)
       VALUES (?,?,?,?,?,0,'open',?,?)`,
    ).run(
      id,
      title,
      instructor || "Tony",
      schedule || "TBD",
      max_capacity || 20,
      external_url || "https://almalatina.de/",
      description || null,
    );
    log("admin", "create", { id });
    res.json(getClass(id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/admin/classes/:id", (req, res) => {
  db.prepare("DELETE FROM classes WHERE id=?").run(req.params.id);
  log("admin", "delete", { id: req.params.id });
  res.json({ ok: true });
});

app.listen(Number(PORT), () => {
  console.log(`✓ AlmaLatina API listening on :${PORT}`);
  console.log(`  CORS: ${CORS_ORIGIN}`);
  console.log(`  DB: ${DB_PATH}`);
  console.log(`  Admin chats: ${[...adminChatIds].join(", ") || "(open)"}`);
});
