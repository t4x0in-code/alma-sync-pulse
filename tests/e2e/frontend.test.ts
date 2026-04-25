import { test, expect } from "@playwright/test";

const BASE = process.env.VITE_PUBLIC_BOT_API_URL || "http://localhost:5173";

test.describe("Frontend Flows", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("h1")).toContainText(/AlmaLatina|Tanz das/);
  });

  test("shows class card with enrollments", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=Salsa Cubana")).toBeVisible();
    await expect(page.locator("text=Plätze frei")).toBeVisible();
  });

  test("enrollment dialog opens", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /Anmelden|Jetzt anmelden/i }).click();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto(`${BASE}/tony-admin`);
    await expect(page.locator("h1")).toContainText(/Admin-Anmeldung|Admin/i);
  });

  test("shows demo mode banner when no bot", async ({ page }) => {
    await page.goto(BASE);
    const banner = page.locator("text=Demo-Modus");
    await expect(banner).toBeVisible({ timeout: 10000 });
  });
});
