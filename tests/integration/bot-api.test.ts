import { describe, it, expect } from "vitest";
import type { SalsaClass } from "../../src/lib/api";

const BASE = process.env.BOT_API_URL || "http://localhost:8080";
const RUN_INTEGRATION = process.env.RUN_INTEGRATION === "true";
const adminToken = "test-admin-token";

(RUN_INTEGRATION ? describe : describe.skip)("Bot API (integration)", () => {
  describe("GET /api/classes", () => {
    it("returns array of classes", async () => {
      const res = await fetch(`${BASE}/api/classes`);
      expect(res.ok).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json = (await res.json()) as any[];
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBeGreaterThan(0);
    });

    it("includes enrichments", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [k] = (await fetch(`${BASE}/api/classes`).then((r) => r.json())) as any[];
      expect(k.current_enrollment).toBeDefined();
      expect(k.counts_by_gender).toBeDefined();
      expect(k.enrollments).toBeDefined();
      expect(k.pairs).toBeDefined();
      expect(k.reserved).toBeDefined();
    });
  });

  describe("GET /api/classes/:id", () => {
    it("returns single class", async () => {
      const res = await fetch(`${BASE}/api/classes/thu-2000-cubana`);
      expect(res.ok).toBe(true);
      const json = await res.json();
      expect(json.id).toBe("thu-2000-cubana");
    });

    it("returns 404 for unknown class", async () => {
      const res = await fetch(`${BASE}/api/classes/unknown-id`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/enroll", () => {
    it("creates enrollment", async () => {
      const res = await fetch(`${BASE}/api/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: "thu-2000-cubana",
          name: "TestVitestUser",
          gender: "L",
          age: 30,
        }),
      });
      expect(res.ok).toBe(true);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.enrollment_id).toBeDefined();
    });

    it("rejects missing class_id", async () => {
      const res = await fetch(`${BASE}/api/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test", gender: "L" }),
      });
      expect(res.status).toBe(400);
    });

    it("rejects invalid gender", async () => {
      const res = await fetch(`${BASE}/api/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: "thu-2000-cubana",
          name: "Test",
          gender: "X",
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("Admin endpoints", () => {
    const headers = { "X-Admin-Token": adminToken };

    describe("PATCH /api/admin/classes/:id", () => {
      it("updates class", async () => {
        const res = await fetch(`${BASE}/api/admin/classes/thu-2000-cubana`, {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ max_capacity: 25 }),
        });
        expect(res.ok).toBe(true);
        const json = await res.json();
        expect(json.max_capacity).toBe(25);
      });
    });

    describe("POST /api/admin/enrollments", () => {
      it("adds enrollment", async () => {
        const res = await fetch(`${BASE}/api/admin/enrollments`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            class_id: "thu-2000-cubana",
            name: "AdminTest",
            gender: "F",
            age: 22,
          }),
        });
        expect(res.ok).toBe(true);
        const json = await res.json();
        expect(json.ok).toBe(true);
      });
    });

    describe("POST /api/admin/pairs", () => {
      it("creates pair", async () => {
        const res = await fetch(`${BASE}/api/admin/pairs`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ leader_id: 1, follower_id: 2 }),
        });
        expect(res.ok).toBe(true);
        const json = await res.json();
        expect(json.ok).toBe(true);
      });
    });

    describe("POST /api/admin/reserved", () => {
      it("adds reserved pair", async () => {
        const res = await fetch(`${BASE}/api/admin/reserved`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            class_id: "thu-2000-cubana",
            leader_nick: "VT",
            follower_nick: "ST",
            note: "Vitest",
          }),
        });
        expect(res.ok).toBe(true);
        const json = await res.json();
        expect(json.ok).toBe(true);
      });
    });

    describe("DELETE endpoints", () => {
      it("rejects without token", async () => {
        const res = await fetch(`${BASE}/api/admin/classes/thu-2000-cubana`, {
          method: "DELETE",
        });
        expect(res.status).toBe(401);
      });
    });
  });
});
