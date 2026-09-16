// spec: tests/validation/test-plan.md § AC-003-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-003-b: a task can be given a due date", async ({ page }) => {
  await login(page);
  await createList(page, `ac003b-${Date.now()}`);
  const title = `Renew passport ${Date.now()}`;
  await addTask(page, { title, dueDate: "2026-12-01" });
  const row = page.getByRole("row", { name: new RegExp(title) });
  await expect(row).toBeVisible();
  await expect(row.getByText("2026-12-01")).toBeVisible();
});
