// spec: tests/validation/test-plan.md § AC-008-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";
import { createList } from "../lib/todo";

test("AC-008-a: a list owner can invite another user to a list", async ({ page }) => {
  await login(page);
  await createList(page, `ac008a-${Date.now()}`);
  const email = `collab-${Date.now()}@example.invalid`;

  await page.getByRole("button", { name: "Invite" }).click();
  await page.getByRole("textbox", { name: "Collaborator email" }).fill(email);
  await page.getByRole("button", { name: "Send Invite" }).click();

  // Back on the list detail page; open Invite/manage again to see the member row
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(page.getByRole("row", { name: new RegExp(email) })).toContainText("Invited");
});
