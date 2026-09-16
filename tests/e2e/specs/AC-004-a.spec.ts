// spec: tests/validation/test-plan.md § AC-004-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-004-a: a user can edit an existing task's title, due date, priority, or categories/tags", async ({ page }) => {
  await login(page);
  await createList(page, `ac004a-${Date.now()}`);
  const title = `Draft task ${Date.now()}`;
  const updatedTitle = `${title} (updated)`;
  await addTask(page, { title, priority: "Low" });

  // Open the task and change its title, due date, priority and categories
  await page.getByRole("row", { name: new RegExp(title) }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(updatedTitle);
  await page.getByLabel("Due date").fill("2026-11-15");
  await page.getByLabel("Priority").click();
  await page.getByRole("option", { name: "High" }).click();
  await page.getByRole("textbox", { name: "Categories/tags" }).fill("finalized");
  await page.getByRole("button", { name: "Save" }).click();

  // Back on the list detail page, the row reflects the updated title
  await expect(page.getByRole("row", { name: new RegExp(updatedTitle.replace(/[()]/g, "\\$&")) })).toBeVisible();
});
