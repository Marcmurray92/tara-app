import { expect, test } from "@playwright/test";

test("homepage renders the three game cards", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Tara's Birthday Crossword" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connections" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guessing Game" })).toBeVisible();
});

test("connections route shows the coming soon screen", async ({ page }) => {
  await page.goto("/games/connections");

  await expect(page.getByText("Connections is queued up next.")).toBeVisible();
  await expect(page.getByText("The route is live on purpose")).toBeVisible();
});

test("crossword progress survives a refresh", async ({ page }) => {
  await page.goto("/games/crossword/taras-birthday-crossword");

  const firstCell = page.getByRole("button", { name: /Row 1, column 1/i });
  await firstCell.click();
  await page.keyboard.press("H");
  await expect(firstCell).toContainText("H");

  await page.reload();

  await expect(page.getByRole("button", { name: /Row 1, column 1/i })).toContainText("H");
});

test("admin requires login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Admin login" })).toBeVisible();
});

test("health endpoint returns a controlled response", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();

  expect([200, 503]).toContain(response.status());
  expect(body).toHaveProperty("status");
  expect(body).toHaveProperty("database");
});
