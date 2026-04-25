// Client for the standalone AlmaLatina Telegram-bot REST API.
// Configure via VITE_BOT_API_URL (default: http://localhost:8080).

export const API_BASE =
  (import.meta.env.VITE_BOT_API_URL as string | undefined) ??
  "http://localhost:8080";

export type ClassStatus = "open" | "limited" | "closed";

export interface SalsaClass {
  id: string;
  title: string;
  instructor: string;
  schedule: string; // human-readable, e.g. "Donnerstag 20:00"
  max_capacity: number;
  current_enrollment: number;
  status: ClassStatus;
  external_url: string;
  description?: string;
}

export interface EnrollPayload {
  class_id: string;
  name: string;
  email: string;
  phone?: string;
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

export const api = {
  listClasses: () => request<SalsaClass[]>("/api/classes"),
  getClass: (id: string) => request<SalsaClass>(`/api/classes/${id}`),
  enroll: (data: EnrollPayload) =>
    request<{ ok: true; class: SalsaClass }>("/api/enroll", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // Admin (token via header)
  admin: {
    update: (id: string, patch: Partial<SalsaClass>, token: string) =>
      request<SalsaClass>(`/api/admin/classes/${id}`, {
        method: "PATCH",
        headers: { "X-Admin-Token": token },
        body: JSON.stringify(patch),
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
    current_enrollment: 12,
    status: "open",
    external_url: "https://almalatina.de/",
    description:
      "Wöchentlicher Kurs für alle Levels. Authentische kubanische Salsa mit Tony.",
  },
];
