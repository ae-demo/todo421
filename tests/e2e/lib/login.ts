import { test, type Page } from "@playwright/test";

// Drives the real Thunder sign-in form. Credentials come only from the
// environment (set from the roles gate ticket, issue #3) — never hardcoded.
export async function login(page: Page): Promise<void> {
  const username = process.env.AEP_E2E_USERNAME;
  const password = process.env.AEP_E2E_PASSWORD;
  if (!username || !password) {
    throw new Error("AEP_E2E_USERNAME / AEP_E2E_PASSWORD not set");
  }

  // AuthGate attempts a silent sign-in (hidden iframe) before falling back to
  // a full redirect. Observed 11-12s in isolation, but this deployment's IdP
  // has shown slower redirects under sustained load — budget generously.
  test.setTimeout(90_000);

  await page.goto("/");
  // The redirect to the IdP itself can take well over the suite's general
  // actionTimeout (see above) before this field exists.
  await page.getByRole("textbox", { name: "Username" }).fill(username, { timeout: 60_000 });
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.hostname.includes("idp"));
}
