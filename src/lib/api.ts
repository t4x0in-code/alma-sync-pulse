// Client for the standalone AlmaLatina Telegram-bot REST API.
// Configure via VITE_BOT_API_URL. If unset OR the bot is unreachable,
// the client transparently falls back to a local in-browser store
// (src/lib/localStore.ts) so the prototype works fully without the bot.

import { localApi } from "./localStore";

const RAW_BASE = (import.meta.env.VITE_BOT_API_URL as string | undefined)?.trim();
export const API_BASE = RAW_BASE && RAW_BASE.length > 0 ? RAW_BASE : null;

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

// ---------- Mode tracking ----------

export type ApiMode = "live" | "local";

let mode: ApiMode = API_BASE ? "live" : "local";
const listeners = new Set<(m: ApiMode) => void>();

export function getMode(): ApiMode {
  return mode;
}

export function onModeChange(fn: (m: ApiMode) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setMode(next: ApiMode) {
  if (mode === next) return;
  mode = next;
  listeners.forEach((fn) => fn(next));
}

// ---------- HTTP wrapper with auto-fallback ----------

async function httpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error("no api base");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
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
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Try the live HTTP endpoint first. If the network call itself fails
 * (TypeError "Failed to fetch", AbortError, DNS, CORS, etc.) we permanently
 * switch to the local store for this session and re-run the operation
 * against the local fallback. Real HTTP errors (4xx/5xx) bubble up.
 */
async function withFallback<T>(
  http: () => Promise<T>,
  local: () => T | Promise<T>,
): Promise<T> {
  if (mode === "local" || !API_BASE) return Promise.resolve(local());
  try {
    return await http();
  } catch (e) {
    const isNetworkError =
      e instanceof TypeError ||
      (e instanceof DOMException && e.name === "AbortError") ||
      (e instanceof Error && /no api base|Failed to fetch|NetworkError/i.test(e.message));
    if (isNetworkError) {
      console.warn("[AlmaLatina] Bot unreachable, switching to local mode.");
      setMode("local");
      return Promise.resolve(local());
    }
    throw e;
  }
}

// ---------- Public API ----------

export const api = {
  listClasses: () =>
    withFallback<SalsaClass[]>(
      () => httpRequest("/api/classes"),
      () => localApi.listClasses(),
    ),
  getClass: (id: string) =>
    withFallback<SalsaClass>(
      () => httpRequest(`/api/classes/${id}`),
      () => localApi.getClass(id),
    ),
  enroll: (data: EnrollPayload) =>
    withFallback<{ ok: true; enrollment_id: number; class: SalsaClass }>(
      () =>
        httpRequest("/api/enroll", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      () => localApi.enroll(data),
    ),
  admin: {
    updateClass: (id: string, patch: Partial<SalsaClass>, token: string) =>
      withFallback<SalsaClass>(
        () =>
          httpRequest(`/api/admin/classes/${id}`, {
            method: "PATCH",
            headers: { "X-Admin-Token": token },
            body: JSON.stringify(patch),
          }),
        () => localApi.updateClass(id, patch),
      ),
    deleteEnrollment: (id: number, token: string) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; class: SalsaClass }>(
            `/api/admin/enrollments/${id}`,
            { method: "DELETE", headers: { "X-Admin-Token": token } },
          ),
        () => localApi.deleteEnrollment(id),
      ),
    updateEnrollment: (id: number, patch: Partial<Enrollment>, token: string) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; class: SalsaClass }>(
            `/api/admin/enrollments/${id}`,
            {
              method: "PATCH",
              headers: { "X-Admin-Token": token },
              body: JSON.stringify(patch),
            },
          ),
        () => localApi.updateEnrollment(id, patch),
      ),
    addEnrollment: (data: EnrollPayload, token: string) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; id: number; class: SalsaClass }>(
            `/api/admin/enrollments`,
            {
              method: "POST",
              headers: { "X-Admin-Token": token },
              body: JSON.stringify(data),
            },
          ),
        () => localApi.addEnrollment(data),
      ),
    createPair: (
      leader_id: number,
      follower_id: number,
      token: string,
      status: PairStatus = "proposed",
    ) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; id: number; class: SalsaClass }>(
            `/api/admin/pairs`,
            {
              method: "POST",
              headers: { "X-Admin-Token": token },
              body: JSON.stringify({ leader_id, follower_id, status }),
            },
          ),
        () => localApi.createPair(leader_id, follower_id, status),
      ),
    setPairStatus: (id: number, status: PairStatus, token: string) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; class: SalsaClass }>(`/api/admin/pairs/${id}`, {
            method: "PATCH",
            headers: { "X-Admin-Token": token },
            body: JSON.stringify({ status }),
          }),
        () => localApi.setPairStatus(id, status),
      ),
    deletePair: (id: number, token: string) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; class: SalsaClass }>(`/api/admin/pairs/${id}`, {
            method: "DELETE",
            headers: { "X-Admin-Token": token },
          }),
        () => localApi.deletePair(id),
      ),
    addReserved: (
      data: { class_id: string; leader_nick: string; follower_nick: string; note?: string },
      token: string,
    ) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; id: number; class: SalsaClass }>(
            `/api/admin/reserved`,
            {
              method: "POST",
              headers: { "X-Admin-Token": token },
              body: JSON.stringify(data),
            },
          ),
        () => localApi.addReserved(data),
      ),
    deleteReserved: (id: number, token: string) =>
      withFallback(
        () =>
          httpRequest<{ ok: true; class: SalsaClass }>(
            `/api/admin/reserved/${id}`,
            { method: "DELETE", headers: { "X-Admin-Token": token } },
          ),
        () => localApi.deleteReserved(id),
      ),
  },
};

// Mock fallback (used by useClasses initial state).
export const MOCK_CLASSES: SalsaClass[] = [];
