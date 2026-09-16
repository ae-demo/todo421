// spec: tests/validation/test-plan.md § AC-003-d
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-003-d: a task can be given one or more categories/tags", async ({ page }) => {
  await login(page);
  await createList(page, `ac003d-${Date.now()}`);
  const title = `Plan trip ${Date.now()}`;
  await addTask(page, { title, categories: "travel, urgent" });
  const row = page.getByRole("row", { name: new RegExp(title) });
  await expect(row).toBeVisible();
  await expect(row.getByText("travel", { exact: true })).toBeVisible();
  await expect(row.getByText("urgent", { exact: true })).toBeVisible();
});
