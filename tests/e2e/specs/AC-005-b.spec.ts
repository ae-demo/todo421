// spec: tests/validation/test-plan.md § AC-005-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-005-b: a user can mark a complete task as incomplete", async ({ page }) => {
  await login(page);
  const listName = `ac005b-${Date.now()}`;
  await createList(page, listName);
  const title = `Return package ${Date.now()}`;
  await addTask(page, { title });

  const row = page.getByRole("row", { name: new RegExp(title) });
  const checkbox = row.getByRole("checkbox");
  // Mark complete, then incomplete again
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();

  // Re-fetch from the server: leave and come back to the list
  await page.getByRole("link", { name: "My Lists" }).click();
  await page.getByRole("row", { name: new RegExp(listName) }).click();
  await expect(page.getByRole("row", { name: new RegExp(title) }).getByRole("checkbox")).not.toBeChecked();
});
