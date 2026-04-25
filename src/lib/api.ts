// Client for the standalone AlmaLatina Telegram-bot REST API.
// Configure via VITE_BOT_API_URL (default: http://localhost:8080).

export const API_BASE =
  (import.meta.env.VITE_BOT_API_URL as string | undefined) ??
  "http://localhost:8080";

export type ClassStatus = "open" | "limited" | "closed";
export type Gender = "L" | "F"; // L = Leader (М), F = Follower (Ж)
export type PairStatus = "proposed" | "confirmed";

export interface Enrollment {
  id: number;
  class_id: string;
  name: string;
  gender: Gender;
  age: number | null;
  email: string | null;
  phone: string | null;
  photo: string | null;
  comment: string | null;
  looking_for: string | null;
  source: string;
  created_at: number;
}

export interface Pair {
  id: number;
  class_id: string;
  leader_id: number;
  follower_id: number;
  status: PairStatus;
  created_at: number;
}

export interface ReservedPair {
  id: number;
  class_id: string;
  leader_nick: string;
  follower_nick: string;
  note: string | null;
}

export interface SalsaClass {
  id: string;
  title: string;
  instructor: string;
  schedule: string;
  max_capacity: number;
  current_enrollment: number;
  status: ClassStatus;
  external_url: string;
  description?: string | null;
  counts_by_gender: { L: number; F: number };
  enrollments: Enrollment[];
  pairs: Pair[];
  reserved: ReservedPair[];
}

export interface EnrollPayload {
  class_id: string;
  name: string;
  gender: Gender;
  age?: number;
  email?: string;
  phone?: string;
  photo?: string;
  comment?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

const adminHeaders = (token: string) => ({ "X-Admin-Token": token });

export const api = {
  listClasses: () => request<SalsaClass[]>("/api/classes"),
  getClass: (id: string) => request<SalsaClass>(`/api/classes/${id}`),
  enroll: (data: EnrollPayload) =>
    request<{ ok: true; enrollment_id: number; class: SalsaClass }>("/api/enroll", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  admin: {
    updateClass: (id: string, patch: Partial<SalsaClass>, token: string) =>
      request<SalsaClass>(`/api/admin/classes/${id}`, {
        method: "PATCH",
        headers: adminHeaders(token),
        body: JSON.stringify(patch),
      }),
    deleteEnrollment: (id: number, token: string) =>
      request<{ ok: true; class: SalsaClass }>(`/api/admin/enrollments/${id}`, {
        method: "DELETE",
        headers: adminHeaders(token),
      }),
    updateEnrollment: (id: number, patch: Partial<Enrollment>, token: string) =>
      request<{ ok: true; class: SalsaClass }>(`/api/admin/enrollments/${id}`, {
        method: "PATCH",
        headers: adminHeaders(token),
        body: JSON.stringify(patch),
      }),
    addEnrollment: (data: EnrollPayload, token: string) =>
      request<{ ok: true; id: number; class: SalsaClass }>(`/api/admin/enrollments`, {
        method: "POST",
        headers: adminHeaders(token),
        body: JSON.stringify(data),
      }),
    createPair: (leader_id: number, follower_id: number, token: string, status: PairStatus = "proposed") =>
      request<{ ok: true; id: number; class: SalsaClass }>(`/api/admin/pairs`, {
        method: "POST",
        headers: adminHeaders(token),
        body: JSON.stringify({ leader_id, follower_id, status }),
      }),
    setPairStatus: (id: number, status: PairStatus, token: string) =>
      request<{ ok: true; class: SalsaClass }>(`/api/admin/pairs/${id}`, {
        method: "PATCH",
        headers: adminHeaders(token),
        body: JSON.stringify({ status }),
      }),
    deletePair: (id: number, token: string) =>
      request<{ ok: true; class: SalsaClass }>(`/api/admin/pairs/${id}`, {
        method: "DELETE",
        headers: adminHeaders(token),
      }),
    addReserved: (
      data: { class_id: string; leader_nick: string; follower_nick: string; note?: string },
      token: string,
    ) =>
      request<{ ok: true; id: number; class: SalsaClass }>(`/api/admin/reserved`, {
        method: "POST",
        headers: adminHeaders(token),
        body: JSON.stringify(data),
      }),
    deleteReserved: (id: number, token: string) =>
      request<{ ok: true; class: SalsaClass }>(`/api/admin/reserved/${id}`, {
        method: "DELETE",
        headers: adminHeaders(token),
      }),
  },
};

// Mock fallback so the UI works before the bot is running.
export const MOCK_CLASSES: SalsaClass[] = [
  {
    id: "thu-2000-cubana",
    title: "Salsa Cubana — Open Level",
    instructor: "Tony",
    schedule: "Donnerstag · 20:00 – 21:30",
    max_capacity: 20,
    current_enrollment: 4,
    status: "open",
    external_url: "https://almalatina.de/",
    description: "Wöchentlicher Kurs für alle Levels. Authentische kubanische Salsa mit Tony.",
    counts_by_gender: { L: 2, F: 2 },
    enrollments: [
      { id: 1, class_id: "thu-2000-cubana", name: "Marco", gender: "L", age: 32, email: null, phone: null, photo: null, comment: "Anfänger, suche Partnerin", looking_for: null, source: "web", created_at: Date.now() },
      { id: 2, class_id: "thu-2000-cubana", name: "Elena", gender: "F", age: 28, email: null, phone: null, photo: null, comment: "Salsera seit 2 Jahren", looking_for: null, source: "web", created_at: Date.now() },
      { id: 3, class_id: "thu-2000-cubana", name: "Pablo", gender: "L", age: 41, email: null, phone: null, photo: null, comment: null, looking_for: null, source: "web", created_at: Date.now() },
      { id: 4, class_id: "thu-2000-cubana", name: "Sofía", gender: "F", age: 35, email: null, phone: null, photo: null, comment: "Ich suche Marco 😊", looking_for: null, source: "web", created_at: Date.now() },
    ],
    pairs: [
      { id: 1, class_id: "thu-2000-cubana", leader_id: 1, follower_id: 4, status: "proposed", created_at: Date.now() },
    ],
    reserved: [
      { id: 1, class_id: "thu-2000-cubana", leader_nick: "TO", follower_nick: "MA", note: "Tony & Maria" },
      { id: 2, class_id: "thu-2000-cubana", leader_nick: "RA", follower_nick: "EL", note: "Rafael & Elena" },
      { id: 3, class_id: "thu-2000-cubana", leader_nick: "JO", follower_nick: "AN", note: "José & Ana" },
    ],
  },
];
