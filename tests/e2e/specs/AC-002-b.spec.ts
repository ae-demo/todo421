// spec: tests/validation/test-plan.md § AC-002-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList } from "../lib/todo";

test("AC-002-b: a newly created list appears in the user's list of lists", async ({ page }) => {
  // 1. Sign in as test-user
  await login(page);
  // 2. Create a list with a unique name
  const name = `ac002b-${Date.now()}`;
  await createList(page, name);
  // 3. Navigate back to My Lists via the sidebar nav link
  await page.getByRole("link", { name: "My Lists" }).click();
  await expect(page.getByRole("heading", { name: "My Lists", level: 1 })).toBeVisible();
  // Assert: the My Lists table shows a row for the new list
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();
});
