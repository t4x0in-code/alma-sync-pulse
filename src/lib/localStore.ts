// In-browser fallback "backend" — тот же контракт, что и REST API бота,
// но всё хранится в localStorage. Используется автоматически, когда
// Telegram-бот недоступен (например, в Lovable preview без VITE_BOT_API_URL).

import type {
  SalsaClass,
  Enrollment,
  Pair,
  ReservedPair,
  EnrollPayload,
  PairStatus,
  Gender,
} from "./api";

const KEY = "almalatina_local_v1";

interface DB {
  classes: Omit<
    SalsaClass,
    "current_enrollment" | "counts_by_gender" | "enrollments" | "pairs" | "reserved"
  >[];
  enrollments: Enrollment[];
  pairs: Pair[];
  reserved: ReservedPair[];
  nextEnrollId: number;
  nextPairId: number;
  nextReservedId: number;
}

const seedDB = (): DB => ({
  classes: [
    {
      id: "thu-2000-cubana",
      title: "Salsa Cubana — Open Level",
      instructor: "Tony",
      schedule: "Donnerstag · 20:00 – 21:30",
      max_capacity: 20,
      status: "open",
      external_url: "https://almalatina.de/",
      description: "Wöchentlicher Kurs für alle Levels. Authentische kubanische Salsa mit Tony.",
    },
  ],
  enrollments: [
    mkEnroll(1, "thu-2000-cubana", "Marco", "L", 32, "Anfänger, suche Partnerin"),
    mkEnroll(2, "thu-2000-cubana", "Elena", "F", 28, "Salsera seit 2 Jahren"),
    mkEnroll(3, "thu-2000-cubana", "Pablo", "L", 41, null),
    mkEnroll(4, "thu-2000-cubana", "Sofía", "F", 35, "Ich suche Marco 😊"),
  ],
  pairs: [
    {
      id: 1,
      class_id: "thu-2000-cubana",
      leader_id: 1,
      follower_id: 4,
      status: "proposed",
      created_at: Date.now(),
    },
  ],
  reserved: [
    {
      id: 1,
      class_id: "thu-2000-cubana",
      leader_nick: "TO",
      follower_nick: "MA",
      note: "Tony & Maria",
    },
    {
      id: 2,
      class_id: "thu-2000-cubana",
      leader_nick: "RA",
      follower_nick: "EL",
      note: "Rafael & Elena",
    },
    {
      id: 3,
      class_id: "thu-2000-cubana",
      leader_nick: "JO",
      follower_nick: "AN",
      note: "José & Ana",
    },
    {
      id: 4,
      class_id: "thu-2000-cubana",
      leader_nick: "CA",
      follower_nick: "SO",
      note: "Carlos & Sofía",
    },
    {
      id: 5,
      class_id: "thu-2000-cubana",
      leader_nick: "DI",
      follower_nick: "LU",
      note: "Diego & Lucía",
    },
  ],
  nextEnrollId: 5,
  nextPairId: 2,
  nextReservedId: 6,
});

function mkEnroll(
  id: number,
  class_id: string,
  name: string,
  gender: Gender,
  age: number | null,
  comment: string | null,
): Enrollment {
  return {
    id,
    class_id,
    name,
    gender,
    age,
    email: null,
    phone: null,
    photo: null,
    comment,
    looking_for: null,
    source: "local-seed",
    created_at: Date.now() - id * 60_000,
  };
}

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const readDB = (): DB => {
  if (!isBrowser()) return seedDB();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const seed = seedDB();
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return seedDB();
  }
};

const writeDB = (db: DB) => {
  if (!isBrowser()) return;
  // Notify other tabs / hooks
  window.localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("almalatina:local-update"));
};

const computeStatus = (
  klass: { status: SalsaClass["status"]; max_capacity: number },
  total: number,
): SalsaClass["status"] => {
  if (klass.status === "closed") return "closed";
  if (total >= klass.max_capacity) return "closed";
  if (total >= klass.max_capacity * 0.8) return "limited";
  return "open";
};

const enrich = (db: DB, raw: DB["classes"][number]): SalsaClass => {
  const enrollments = db.enrollments.filter((e) => e.class_id === raw.id);
  const pairs = db.pairs.filter((p) => p.class_id === raw.id);
  const reserved = db.reserved.filter((r) => r.class_id === raw.id);
  const counts = { L: 0, F: 0 };
  enrollments.forEach((e) => (counts[e.gender] += 1));
  return {
    ...raw,
    current_enrollment: enrollments.length,
    counts_by_gender: counts,
    enrollments,
    pairs,
    reserved,
    status: computeStatus(raw, enrollments.length),
  };
};

const getClassRaw = (db: DB, id: string) => db.classes.find((c) => c.id === id);

export const localApi = {
  reset() {
    if (isBrowser()) window.localStorage.removeItem(KEY);
    writeDB(seedDB());
  },
  listClasses(): SalsaClass[] {
    const db = readDB();
    return db.classes.map((c) => enrich(db, c));
  },
  getClass(id: string): SalsaClass {
    const db = readDB();
    const raw = getClassRaw(db, id);
    if (!raw) throw new Error("class not found");
    return enrich(db, raw);
  },
  enroll(data: EnrollPayload) {
    const db = readDB();
    const raw = getClassRaw(db, data.class_id);
    if (!raw) throw new Error("class not found");
    const total = db.enrollments.filter((e) => e.class_id === data.class_id).length;
    if (raw.status === "closed" || total >= raw.max_capacity) throw new Error("class is full");
    const id = db.nextEnrollId++;
    const e: Enrollment = {
      id,
      class_id: data.class_id,
      name: data.name.trim(),
      gender: data.gender,
      age: data.age ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      photo: data.photo ?? null,
      comment: data.comment ?? null,
      looking_for: null,
      source: "web-local",
      created_at: Date.now(),
    };
    db.enrollments.push(e);
    writeDB(db);
    return { ok: true as const, enrollment_id: id, class: enrich(readDB(), raw) };
  },
  // ----- Admin -----
  updateClass(id: string, patch: Partial<SalsaClass>) {
    const db = readDB();
    const raw = getClassRaw(db, id);
    if (!raw) throw new Error("not found");
    const allowed: (keyof typeof raw)[] = [
      "title",
      "instructor",
      "schedule",
      "max_capacity",
      "status",
      "external_url",
      "description",
    ];
    for (const k of allowed) {
      if (k in patch) (raw as Record<string, unknown>)[k] = (patch as Record<string, unknown>)[k];
    }
    writeDB(db);
    return enrich(readDB(), raw);
  },
  deleteEnrollment(id: number) {
    const db = readDB();
    const cur = db.enrollments.find((e) => e.id === id);
    if (!cur) throw new Error("not found");
    db.enrollments = db.enrollments.filter((e) => e.id !== id);
    db.pairs = db.pairs.filter((p) => p.leader_id !== id && p.follower_id !== id);
    writeDB(db);
    return { ok: true as const, class: enrich(readDB(), getClassRaw(readDB(), cur.class_id)!) };
  },
  updateEnrollment(id: number, patch: Partial<Enrollment>) {
    const db = readDB();
    const cur = db.enrollments.find((e) => e.id === id);
    if (!cur) throw new Error("not found");
    Object.assign(cur, patch);
    writeDB(db);
    return { ok: true as const, class: enrich(readDB(), getClassRaw(readDB(), cur.class_id)!) };
  },
  addEnrollment(data: EnrollPayload) {
    const r = this.enroll(data);
    return { ok: true as const, id: r.enrollment_id, class: r.class };
  },
  createPair(leader_id: number, follower_id: number, status: PairStatus = "proposed") {
    const db = readDB();
    const a = db.enrollments.find((e) => e.id === leader_id);
    const b = db.enrollments.find((e) => e.id === follower_id);
    if (!a || !b) throw new Error("enrollment not found");
    if (a.class_id !== b.class_id) throw new Error("different classes");
    if (a.gender !== "L" || b.gender !== "F")
      throw new Error("leader_id must be L, follower_id must be F");
    const id = db.nextPairId++;
    const p: Pair = {
      id,
      class_id: a.class_id,
      leader_id: a.id,
      follower_id: b.id,
      status,
      created_at: Date.now(),
    };
    db.pairs.push(p);
    writeDB(db);
    return { ok: true as const, id, class: enrich(readDB(), getClassRaw(readDB(), a.class_id)!) };
  },
  setPairStatus(id: number, status: PairStatus) {
    const db = readDB();
    const cur = db.pairs.find((p) => p.id === id);
    if (!cur) throw new Error("not found");
    cur.status = status;
    writeDB(db);
    return { ok: true as const, class: enrich(readDB(), getClassRaw(readDB(), cur.class_id)!) };
  },
  deletePair(id: number) {
    const db = readDB();
    const cur = db.pairs.find((p) => p.id === id);
    if (!cur) throw new Error("not found");
    db.pairs = db.pairs.filter((p) => p.id !== id);
    writeDB(db);
    return { ok: true as const, class: enrich(readDB(), getClassRaw(readDB(), cur.class_id)!) };
  },
  addReserved(data: {
    class_id: string;
    leader_nick: string;
    follower_nick: string;
    note?: string;
  }) {
    const db = readDB();
    if (!/^[A-Za-z]{2}$/.test(data.leader_nick) || !/^[A-Za-z]{2}$/.test(data.follower_nick))
      throw new Error("nicks must be 2 letters");
    const raw = getClassRaw(db, data.class_id);
    if (!raw) throw new Error("class not found");
    const id = db.nextReservedId++;
    db.reserved.push({
      id,
      class_id: data.class_id,
      leader_nick: data.leader_nick.toUpperCase(),
      follower_nick: data.follower_nick.toUpperCase(),
      note: data.note || null,
    });
    writeDB(db);
    return { ok: true as const, id, class: enrich(readDB(), raw) };
  },
  deleteReserved(id: number) {
    const db = readDB();
    const cur = db.reserved.find((r) => r.id === id);
    if (!cur) throw new Error("not found");
    db.reserved = db.reserved.filter((r) => r.id !== id);
    writeDB(db);
    return { ok: true as const, class: enrich(readDB(), getClassRaw(readDB(), cur.class_id)!) };
  },
};
