import { describe, it, expect, beforeEach, vi } from "vitest";
import { localApi } from "../../src/lib/localStore";

describe("localStore", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: {
        data: {} as Record<string, string>,
        getItem(key: string) {
          return this.data[key] ?? null;
        },
        setItem(key: string, value: string) {
          this.data[key] = value;
        },
        removeItem(key: string) {
          delete this.data[key];
        },
      },
      dispatchEvent: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      CustomEvent: vi.fn().mockImplementation((type: string, init?: any) => ({
        type,
        ...init,
      })),
    });
    localApi.reset();
  });

  describe("listClasses", () => {
    it("returns seeded class with enrichments", () => {
      const classes = localApi.listClasses();
      expect(classes).toHaveLength(1);
      expect(classes[0].id).toBe("thu-2000-cubana");
      expect(classes[0].current_enrollment).toBe(4);
      expect(classes[0].counts_by_gender).toEqual({ L: 2, F: 2 });
    });

    it("includes enrollments, pairs, reserved", () => {
      const [k] = localApi.listClasses();
      expect(k.enrollments).toHaveLength(4);
      expect(k.pairs).toHaveLength(1);
      expect(k.reserved).toHaveLength(5);
    });
  });

  describe("enroll", () => {
    it("adds new enrollment", () => {
      const result = localApi.enroll({
        class_id: "thu-2000-cubana",
        name: "Test User",
        gender: "L",
        age: 25,
      });
      expect(result.ok).toBe(true);
      expect(result.enrollment_id).toBe(5);
      const [k] = localApi.listClasses();
      expect(k.current_enrollment).toBe(5);
    });

    it("rejects closed class", () => {
      localApi.updateClass("thu-2000-cubana", { status: "closed" });
      expect(() =>
        localApi.enroll({
          class_id: "thu-2000-cubana",
          name: "New User",
          gender: "F",
        }),
      ).toThrow("class is full");
    });
  });

  describe("deleteEnrollment", () => {
    it("removes enrollment and related pairs", () => {
      const result = localApi.deleteEnrollment(1);
      expect(result.ok).toBe(true);
      const [k] = localApi.listClasses();
      expect(k.enrollments).toHaveLength(3);
      expect(k.pairs).toHaveLength(0); // pair with leader_id=1 removed
    });

    it("throws if not found", () => {
      expect(() => localApi.deleteEnrollment(999)).toThrow("not found");
    });
  });

  describe("pairs", () => {
    it("creates proposed pair", () => {
      const result = localApi.createPair(1, 2);
      expect(result.ok).toBe(true);
      expect(result.id).toBe(2);
      const [k] = localApi.listClasses();
      expect(k.pairs).toHaveLength(2);
    });

    it("confirms pair", () => {
      localApi.setPairStatus(1, "confirmed");
      const [k] = localApi.listClasses();
      const p = k.pairs.find((p) => p.id === 1);
      expect(p?.status).toBe("confirmed");
    });

    it("deletes pair", () => {
      localApi.deletePair(1);
      const [k] = localApi.listClasses();
      expect(k.pairs).toHaveLength(0);
    });
  });

  describe("reserved", () => {
    it("adds reserved pair", () => {
      const result = localApi.addReserved({
        class_id: "thu-2000-cubana",
        leader_nick: "TE",
        follower_nick: "ST",
        note: "Test",
      });
      expect(result.ok).toBe(true);
      const [k] = localApi.listClasses();
      expect(k.reserved).toHaveLength(6);
    });

    it("rejects invalid nick length", () => {
      expect(() =>
        localApi.addReserved({
          class_id: "thu-2000-cubana",
          leader_nick: "TOO",
          follower_nick: "LONG",
        }),
      ).toThrow("2 letters");
    });

    it("deletes reserved", () => {
      localApi.deleteReserved(1);
      const [k] = localApi.listClasses();
      expect(k.reserved).toHaveLength(4);
    });
  });

  describe("updateClass", () => {
    it("patches class fields", () => {
      const [k] = localApi.listClasses();
      expect(k.max_capacity).toBe(20);
      localApi.updateClass("thu-2000-cubana", { max_capacity: 30 });
      const [k2] = localApi.listClasses();
      expect(k2.max_capacity).toBe(30);
    });

    it("recomputes status on capacity change", () => {
      localApi.updateClass("thu-2000-cubana", { max_capacity: 4 });
      const [k] = localApi.listClasses();
      expect(k.status).toBe("closed"); // 4 enrollments, 4 capacity
    });
  });
});
