// spec: tests/validation/test-plan.md § AC-002-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList } from "../lib/todo";

test("AC-002-a: a user can create a new list by providing a name", async ({ page }) => {
  // 1. Sign in as test-user
  await login(page);
  // 2-4. Create a new list with a unique name
  const name = `ac002a-${Date.now()}`;
  await createList(page, name);
  // Assert: lands on the new list's detail page with that name as heading
  await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
});
