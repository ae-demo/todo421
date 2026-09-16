// spec: tests/validation/test-plan.md § AC-003-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-003-a: a user can add a task to a list with a title", async ({ page }) => {
  await login(page);
  await createList(page, `ac003a-${Date.now()}`);
  const title = `Buy milk ${Date.now()}`;
  await addTask(page, { title });
  await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();
});
