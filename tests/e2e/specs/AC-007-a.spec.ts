// spec: tests/validation/test-plan.md § AC-007-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-007-a: a user can filter tasks by priority", async ({ page }) => {
  await login(page);
  await createList(page, `ac007a-${Date.now()}`);
  const highTitle = `Urgent fix ${Date.now()}`;
  const lowTitle = `Someday maybe ${Date.now()}`;
  await addTask(page, { title: highTitle, priority: "High" });
  await addTask(page, { title: lowTitle, priority: "Low" });

  await page.getByLabel("Priority").click();
  await page.getByRole("option", { name: "High" }).click();

  await expect(page.getByRole("row", { name: new RegExp(highTitle) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(lowTitle) })).toHaveCount(0);
});
