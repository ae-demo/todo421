// spec: tests/validation/test-plan.md § AC-007-c
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList, addTask } from "../lib/todo";

test("AC-007-c: a user can sort tasks by due date", async ({ page }) => {
  await login(page);
  await createList(page, `ac007c-${Date.now()}`);
  const stamp = Date.now();
  const laterTitle = `Later task ${stamp}`;
  const soonerTitle = `Sooner task ${stamp}`;
  // Added out of due-date order, so a correct sort must reorder them
  await addTask(page, { title: laterTitle, dueDate: "2026-12-31" });
  await addTask(page, { title: soonerTitle, dueDate: "2026-10-01" });

  await page.getByLabel("Sort by due date").click();
  await page.getByRole("option", { name: "Due date" }).click();

  const rows = page.getByRole("row").filter({ hasText: new RegExp(`${laterTitle}|${soonerTitle}`) });
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText(soonerTitle);
  await expect(rows.nth(1)).toContainText(laterTitle);
});
