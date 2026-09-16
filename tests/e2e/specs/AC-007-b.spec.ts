// spec: tests/validation/test-plan.md § AC-007-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-007-b: a user can filter tasks by category/tag", async ({ page }) => {
  await login(page);
  await createList(page, `ac007b-${Date.now()}`);
  const stamp = Date.now();
  const homeTitle = `Fix sink ${stamp}`;
  const workTitle = `Write report ${stamp}`;
  await addTask(page, { title: homeTitle, categories: `home-${stamp}` });
  await addTask(page, { title: workTitle, categories: `work-${stamp}` });

  await page.getByLabel("Category").click();
  await page.getByRole("option", { name: `home-${stamp}` }).click();

  await expect(page.getByRole("row", { name: new RegExp(homeTitle) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(workTitle) })).toHaveCount(0);
});
