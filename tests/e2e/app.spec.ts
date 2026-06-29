import { expect, test } from "@playwright/test";

test("homepage renders the core game rows", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Crossword", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connections", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Colour Field", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Movie Review Guess", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who Liked It Better", exact: true })).toBeVisible();
});

test("connections route lets the player solve a group", async ({ page }) => {
  await page.goto("/games/connections/tara-movie-connections");

  await page.getByRole("button", { name: "Groundhog Day" }).click();
  await page.getByRole("button", { name: "Palm Springs" }).click();
  await page.getByRole("button", { name: "Edge of Tomorrow" }).click();
  await page.getByRole("button", { name: "Happy Death Day" }).click();
  await page.getByRole("button", { name: /^Submit$/i }).click();

  await expect(page.locator("div").filter({ hasText: /^That was clean\. Time loops\.$/ })).toBeVisible();
  await expect(page.getByText(/Groundhog Day, Palm Springs, Edge of Tomorrow, Happy Death Day/i)).toBeVisible();
});

test("crossword progress survives a refresh", async ({ page }) => {
  await page.goto("/games/crossword/taras-birthday-crossword");

  const firstCell = page.locator('button[aria-label*="current value blank"]').first();
  await firstCell.click();
  await page.getByRole("button", { name: "H", exact: true }).click();
  await expect(page.locator('button[aria-label*="current value H"]').first()).toContainText("H");

  await page.reload();

  await expect(page.locator('button[aria-label*="current value H"]').first()).toContainText("H");
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

test("colour field pack opens the first playable board", async ({ page }) => {
  await page.goto("/games/colour-field");

  await expect(page.getByRole("heading", { name: "Colour Field" })).toBeVisible();
  await page.getByRole("link", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL(/\/games\/colour-field\/midnight-vows$/);
  await expect(page.locator('button[aria-label^="Tile row "]')).toHaveCount(16);
  await expect(page.getByText("Study the solved field before it scrambles.")).toBeVisible();
  await expect(page.getByText("Tap a tile. Tap another tile. Rebuild the gradient.")).toBeVisible();
});

test("who liked it better progress survives a refresh", async ({ page }) => {
  await page.goto("/games/who-liked-it-better");

  await page.getByRole("button", { name: "Kid Cudi" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kid Cudi liked it better." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kid Cudi liked it better." })).toBeVisible();
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
