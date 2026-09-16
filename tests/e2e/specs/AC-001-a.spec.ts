// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";

test("AC-001-a: unauthenticated visitor is directed to sign in before seeing todo data", async ({ page }) => {
  // AuthGate first attempts a silent sign-in (hidden iframe) before falling
  // back to a full redirect, which observably takes ~12s against this
  // deployment — longer than the default assertion timeout.
  test.setTimeout(45_000);
  // 1. Navigate to / with no prior session
  await page.goto("/");
  // 2. Assert the browser ends up on the identity provider's sign-in page
  await expect(page).toHaveURL(/default-idp/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});
