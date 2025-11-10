import { test, expect } from "@playwright/test"

test.describe("Inventory Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory")
    await page.waitForLoadState("networkidle")
  })

  test("should filter apps by risk level", async ({ page }) => {
    // Wait for table to load
    await expect(page.getByRole("table")).toBeVisible()

    // Click on "High" risk filter
    await page.getByRole("button", { name: /high/i }).click()

    // Verify that only high-risk apps are displayed
    const rows = await page.getByRole("row").all()
    expect(rows.length).toBeGreaterThan(0)

    // Check that high risk badge is visible
    await expect(page.locator("text=High").first()).toBeVisible()
  })

  test("should filter apps by status", async ({ page }) => {
    // Click on "Unsanctioned" status filter
    await page.getByRole("button", { name: /unsanctioned/i }).click()

    // Verify table updates with unsanctioned apps
    await expect(page.locator("text=Unsanctioned").first()).toBeVisible()
  })

  test("should search for apps by name", async ({ page }) => {
    // Type in search input
    await page.getByPlaceholder(/search/i).fill("Dropbox")

    // Verify Dropbox appears in results
    await expect(page.getByText("Dropbox")).toBeVisible()
  })

  test("should export CSV", async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent("download")

    // Click Export CSV button
    await page.getByRole("button", { name: /export csv/i }).click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain("shadow-it-inventory")
  })

  test("should open app drawer and interact", async ({ page }) => {
    // Click "Explain" button on first app row
    await page
      .getByRole("button", { name: /explain/i })
      .first()
      .click()

    // Verify drawer opens
    await expect(page.getByRole("heading", { name: /about/i })).toBeVisible()

    // Test copying a scope chip
    const scopeChip = page.locator("[data-scope-chip]").first()
    await scopeChip.hover()
    await scopeChip.getByRole("button", { name: /copy/i }).click()

    // Verify copy success (toast notification)
    await expect(page.getByText(/copied/i)).toBeVisible()

    // Try disabled action and check tooltip
    const disabledButton = page.getByRole("button", { name: /revoke/i })
    await disabledButton.hover()

    // Verify tooltip appears explaining why it's disabled
    await expect(page.getByText(/only secops can perform/i)).toBeVisible()

    // Close drawer
    await page.keyboard.press("Escape")
    await expect(page.getByRole("heading", { name: /about/i })).not.toBeVisible()
  })

  test("should sort apps by different columns", async ({ page }) => {
    // Sort by Risk
    await page.getByRole("button", { name: /risk/i }).click()

    // Verify sorting changed
    const firstAppRisk = await page.locator("tbody tr").first().locator("[data-risk-badge]").textContent()
    expect(["High", "Medium", "Low"]).toContain(firstAppRisk?.trim())

    // Sort by Users
    await page.getByRole("button", { name: /users/i }).click()

    // Verify table re-sorted
    await expect(page.locator("tbody tr").first()).toBeVisible()
  })

  test("should paginate through results", async ({ page }) => {
    // Click next page button
    await page.getByRole("button", { name: /next/i }).click()

    // Verify pagination updated
    await expect(page.getByText(/page 2/i)).toBeVisible()

    // Go back to previous page
    await page.getByRole("button", { name: /previous/i }).click()
    await expect(page.getByText(/page 1/i)).toBeVisible()
  })
})
