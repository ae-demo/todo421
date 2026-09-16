// spec: tests/validation/test-plan.md § AC-006-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-006-a: a user can delete a task from a list", async ({ page }) => {
  await login(page);
  await createList(page, `ac006a-${Date.now()}`);
  const title = `Cancel subscription ${Date.now()}`;
  await addTask(page, { title });

  const row = page.getByRole("row", { name: new RegExp(title) });
  await expect(row).toBeVisible();
  await row.getByRole("button").click();
  await expect(row).toHaveCount(0);
});
