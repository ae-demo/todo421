// spec: tests/validation/test-plan.md § AC-005-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-005-a: a user can mark an incomplete task as complete", async ({ page }) => {
  await login(page);
  const listName = `ac005a-${Date.now()}`;
  await createList(page, listName);
  const title = `Wash car ${Date.now()}`;
  await addTask(page, { title });

  const row = page.getByRole("row", { name: new RegExp(title) });
  const checkbox = row.getByRole("checkbox");
  await expect(checkbox).not.toBeChecked();
  await checkbox.click();

  // Re-fetch from the server: leave and come back to the list
  await page.getByRole("link", { name: "My Lists" }).click();
  await page.getByRole("row", { name: new RegExp(listName) }).click();
  await expect(page.getByRole("row", { name: new RegExp(title) }).getByRole("checkbox")).toBeChecked();
});
