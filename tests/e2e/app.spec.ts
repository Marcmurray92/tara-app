import { expect, test } from "@playwright/test";

test("homepage renders the three game cards", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /Crossword/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Connections/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Review Guess/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Liked It Better/i })).toBeVisible();
});

test("connections route lets the player solve a group", async ({ page }) => {
  await page.goto("/games/connections");

  await page.getByRole("button", { name: "Groundhog Day" }).click();
  await page.getByRole("button", { name: "Palm Springs" }).click();
  await page.getByRole("button", { name: "Edge of Tomorrow" }).click();
  await page.getByRole("button", { name: "Happy Death Day" }).click();
  await page.getByRole("button", { name: /Submit group/i }).click();

  await expect(page.getByText("Solved: Time loops.")).toBeVisible();
  await expect(page.getByText("Solved 1/4")).toBeVisible();
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

test("guessing game progress survives a refresh", async ({ page }) => {
  await page.goto("/games/guessing");

  await page.getByRole("button", { name: /Mean Girls/i }).click();
  await expect(page.getByText("Easy complete")).toBeVisible();
  await expect(page.getByRole("button", { name: "Next Round" })).toBeVisible();

  await page.reload();

  await expect(page.getByText("Easy complete")).toBeVisible();
  await expect(page.getByRole("button", { name: "Next Round" })).toBeVisible();
});

test("who liked it better progress survives a refresh", async ({ page }) => {
  await page.goto("/games/who-liked-it-better");

  await page.getByRole("button", { name: "Kid Cudi" }).click();
  await expect(page.getByText("Kid Cudi liked it better.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();

  await page.reload();

  await expect(page.getByText("Kid Cudi liked it better.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
});

test("admin requires login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Admin login" })).toBeVisible();
  await expect(page.getByLabel("Username")).toBeVisible();
});

test("health endpoint returns a controlled response", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();

  expect([200, 503]).toContain(response.status());
  expect(body).toHaveProperty("status");
  expect(body).toHaveProperty("database");
});
