// spec: tests/validation/test-plan.md § AC-003-c
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-003-c: a task can be given a priority", async ({ page }) => {
  await login(page);
  await createList(page, `ac003c-${Date.now()}`);
  const title = `File taxes ${Date.now()}`;
  await addTask(page, { title, priority: "High" });
  const row = page.getByRole("row", { name: new RegExp(title) });
  await expect(row).toBeVisible();
  await expect(row.getByText("High")).toBeVisible();
});
