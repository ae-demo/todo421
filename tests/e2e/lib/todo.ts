import type { Page } from "@playwright/test";

// Shared drive helpers for the todo-webapp UI, used across specs/*.spec.ts.
// Each returns once the app has navigated to the resulting screen.

export async function createList(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "New List" }).click();
  await page.getByRole("textbox", { name: "List name" }).fill(name);
  await page.getByRole("button", { name: "Create" }).click();
}

export interface NewTaskOptions {
  title: string;
  dueDate?: string; // yyyy-mm-dd
  priority?: "Low" | "Medium" | "High";
  categories?: string; // comma-separated
}

export async function addTask(page: Page, opts: NewTaskOptions): Promise<void> {
  await page.getByRole("button", { name: "Add Task" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(opts.title);
  if (opts.dueDate) {
    await page.getByLabel("Due date").fill(opts.dueDate);
  }
  if (opts.priority) {
    await page.getByLabel("Priority").click();
    await page.getByRole("option", { name: opts.priority }).click();
  }
  if (opts.categories) {
    await page.getByRole("textbox", { name: "Categories/tags" }).fill(opts.categories);
  }
  await page.getByRole("button", { name: "Save" }).click();
}
