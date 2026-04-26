// TODO-0007 — /addwizard flow TDD tests
// Tests wizard state machine logic and DB-layer insert behaviour.
// The wizard's confirm step runs the same INSERT as POST /api/admin/enrollments —
// so we test the REST proxy instead of mocking bot internals.

import { describe, it, expect } from "vitest";

// ---------- unit: wizard state machine ----------

interface WizardState {
  step: "class" | "gender" | "name" | "age" | "confirm";
  classId: string;
  gender: string;
  name: string;
  age: number | null;
}

function wizardTransitionClass(state: WizardState, classId: string): WizardState {
  if (state.step !== "class") throw new Error("wrong step");
  return { ...state, classId, step: "gender" };
}

function wizardTransitionGender(state: WizardState, gender: string): WizardState {
  if (state.step !== "gender") throw new Error("wrong step");
  if (gender !== "L" && gender !== "F") throw new Error("invalid gender");
  return { ...state, gender, step: "name" };
}

function wizardTransitionName(state: WizardState, name: string): WizardState {
  if (state.step !== "name") throw new Error("wrong step");
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 80) throw new Error("name 2–80 chars");
  return { ...state, name: trimmed, step: "age" };
}

function wizardTransitionAge(state: WizardState, age: number | null): WizardState {
  if (state.step !== "age") throw new Error("wrong step");
  if (age !== null && (age < 10 || age > 99)) throw new Error("age 10–99");
  return { ...state, age, step: "confirm" };
}

describe("/addwizard state machine", () => {
  const initial: WizardState = { step: "class", classId: "", gender: "", name: "", age: null };

  it("class step advances to gender", () => {
    const s = wizardTransitionClass(initial, "thu-2000-cubana");
    expect(s.step).toBe("gender");
    expect(s.classId).toBe("thu-2000-cubana");
  });

  it("gender step advances to name", () => {
    const s = wizardTransitionGender({ ...initial, step: "gender" }, "L");
    expect(s.step).toBe("name");
    expect(s.gender).toBe("L");
  });

  it("gender F is valid", () => {
    const s = wizardTransitionGender({ ...initial, step: "gender" }, "F");
    expect(s.gender).toBe("F");
  });

  it("invalid gender throws", () => {
    expect(() => wizardTransitionGender({ ...initial, step: "gender" }, "X")).toThrow("invalid gender");
  });

  it("name step advances to age and trims whitespace", () => {
    const s = wizardTransitionName({ ...initial, step: "name" }, "  Ana García  ");
    expect(s.step).toBe("age");
    expect(s.name).toBe("Ana García");
  });

  it("name too short throws", () => {
    expect(() => wizardTransitionName({ ...initial, step: "name" }, "A")).toThrow("2–80");
  });

  it("name too long throws", () => {
    expect(() => wizardTransitionName({ ...initial, step: "name" }, "x".repeat(81))).toThrow("2–80");
  });

  it("age step advances to confirm", () => {
    const s = wizardTransitionAge({ ...initial, step: "age" }, 25);
    expect(s.step).toBe("confirm");
    expect(s.age).toBe(25);
  });

  it("age skip (null) is valid", () => {
    const s = wizardTransitionAge({ ...initial, step: "age" }, null);
    expect(s.age).toBeNull();
    expect(s.step).toBe("confirm");
  });

  it("age below 10 throws", () => {
    expect(() => wizardTransitionAge({ ...initial, step: "age" }, 9)).toThrow("age 10–99");
  });

  it("age above 99 throws", () => {
    expect(() => wizardTransitionAge({ ...initial, step: "age" }, 100)).toThrow("age 10–99");
  });

  it("full happy path: class → gender → name → age → confirm", () => {
    let s = initial;
    s = wizardTransitionClass(s, "thu-2000-cubana");
    s = wizardTransitionGender(s, "F");
    s = wizardTransitionName(s, "Maria Lopez");
    s = wizardTransitionAge(s, 28);
    expect(s).toMatchObject({
      step: "confirm",
      classId: "thu-2000-cubana",
      gender: "F",
      name: "Maria Lopez",
      age: 28,
    });
  });

  it("full happy path with age skip", () => {
    let s = initial;
    s = wizardTransitionClass(s, "thu-2000-cubana");
    s = wizardTransitionGender(s, "L");
    s = wizardTransitionName(s, "Carlos Ruiz");
    s = wizardTransitionAge(s, null);
    expect(s.step).toBe("confirm");
    expect(s.age).toBeNull();
  });

  it("wrong step order throws", () => {
    expect(() => wizardTransitionGender(initial, "L")).toThrow("wrong step");
    expect(() => wizardTransitionName(initial, "Alice")).toThrow("wrong step");
    expect(() => wizardTransitionAge(initial, 30)).toThrow("wrong step");
  });
});

// ---------- integration: wizard confirm → DB insert (via REST proxy) ----------

const BASE = process.env.BOT_API_URL || "http://localhost:8081";
const RUN_INTEGRATION = process.env.RUN_INTEGRATION === "true";
const adminToken = process.env.ADMIN_TOKEN || "change-me-please";

(RUN_INTEGRATION ? describe : describe.skip)(
  "/addwizard confirm step — REST integration",
  () => {
    const adminReq = (path: string, options: RequestInit = {}) =>
      fetch(`${BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
          ...(options.headers as Record<string, string>),
        },
      });

    it("wizard confirm inserts enrollment with age", async () => {
      const name = `WizardTest_${Date.now()}`;
      const res = await adminReq("/api/admin/enrollments", {
        method: "POST",
        body: JSON.stringify({ class_id: "thu-2000-cubana", name, gender: "F", age: 27 }),
      });
      expect(res.ok).toBe(true);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(typeof json.id).toBe("number");

      // Verify it's in the class
      const cls = await (await fetch(`${BASE}/api/classes/thu-2000-cubana`)).json();
      const found = cls.enrollments.find((e: { id: number }) => e.id === json.id);
      expect(found).toBeDefined();
      expect(found.name).toBe(name);
      expect(found.age).toBe(27);

      // Cleanup
      await adminReq(`/api/admin/enrollments/${json.id}`, { method: "DELETE" });
    });

    it("wizard confirm inserts enrollment with age=null (skip)", async () => {
      const name = `WizardSkipAge_${Date.now()}`;
      const res = await adminReq("/api/admin/enrollments", {
        method: "POST",
        body: JSON.stringify({ class_id: "thu-2000-cubana", name, gender: "L" }),
      });
      expect(res.ok).toBe(true);
      const json = await res.json();
      expect(json.ok).toBe(true);

      const cls = await (await fetch(`${BASE}/api/classes/thu-2000-cubana`)).json();
      const found = cls.enrollments.find((e: { id: number }) => e.id === json.id);
      expect(found.age).toBeNull();

      // Cleanup
      await adminReq(`/api/admin/enrollments/${json.id}`, { method: "DELETE" });
    });

    it("wizard confirm rejects invalid gender", async () => {
      const res = await adminReq("/api/admin/enrollments", {
        method: "POST",
        body: JSON.stringify({ class_id: "thu-2000-cubana", name: "Bad", gender: "X" }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("invalid gender");
    });

    it("wizard confirm rejects name too short", async () => {
      const res = await adminReq("/api/admin/enrollments", {
        method: "POST",
        body: JSON.stringify({ class_id: "thu-2000-cubana", name: "A", gender: "L" }),
      });
      expect(res.status).toBe(400);
    });
  }
);
