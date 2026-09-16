// spec: tests/validation/test-plan.md § AC-006-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-006-b: a deleted task no longer appears in the list's tasks", async ({ page }) => {
  await login(page);
  const listName = `ac006b-${Date.now()}`;
  await createList(page, listName);
  const title = `Cancel subscription ${Date.now()}`;
  await addTask(page, { title });

  const row = page.getByRole("row", { name: new RegExp(title) });
  await row.getByRole("button").click();
  await expect(row).toHaveCount(0);

  // Re-fetch from the server: leave and come back to the list
  await page.getByRole("link", { name: "My Lists" }).click();
  await page.getByRole("row", { name: new RegExp(listName) }).click();
  await expect(page.getByRole("row", { name: new RegExp(title) })).toHaveCount(0);
});
