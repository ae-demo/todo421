// spec: tests/validation/test-plan.md § AC-004-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-004-b: edited task details are reflected when the task is viewed again", async ({ page }) => {
  await login(page);
  await createList(page, `ac004b-${Date.now()}`);
  const title = `Draft task ${Date.now()}`;
  const updatedTitle = `${title} (updated)`;
  await addTask(page, { title, priority: "Low" });

  await page.getByRole("row", { name: new RegExp(title) }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(updatedTitle);
  await page.getByLabel("Priority").click();
  await page.getByRole("option", { name: "High" }).click();
  await page.getByRole("button", { name: "Save" }).click();

  // View the task again: navigate back to the list, then re-open it
  const escaped = updatedTitle.replace(/[()]/g, "\\$&");
  const row = page.getByRole("row", { name: new RegExp(escaped) });
  await expect(row).toBeVisible();
  await row.click();

  // The edit form re-fetches the task and shows the updated values
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue(updatedTitle);
  await expect(page.getByLabel("Priority")).toHaveText("High");
});
