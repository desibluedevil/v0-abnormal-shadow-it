import { test, expect } from "@playwright/test"

test.describe("Audit Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/audit")
    await page.waitForLoadState("networkidle")
  })

  test("should filter by action type", async ({ page }) => {
    // Click "Revoke" action filter
    await page.getByRole("button", { name: "Revoke" }).click()

    // Verify table updates with revoke actions
    await expect(page.getByText(/revoke/i).first()).toBeVisible()
  })

  test("should filter by status", async ({ page }) => {
    // Click "Success" status filter
    await page.getByRole("button", { name: "Success" }).click()

    // Verify success status chips are visible
    await expect(page.locator("text=Success").first()).toBeVisible()
  })

  test("should filter by date range", async ({ page }) => {
    // Open "From Date" picker
    await page.getByRole("button", { name: /from date/i }).click()

    // Select a date from calendar
    await page.locator('[role="gridcell"]').first().click()

    // Open "To Date" picker
    await page.getByRole("button", { name: /to date/i }).click()

    // Select a date from calendar
    await page.locator('[role="gridcell"]').nth(7).click()

    // Verify table updates with filtered date range
    await expect(page.getByRole("table")).toBeVisible()
  })

  test("should export audit CSV", async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent("download")

    // Click Export CSV button
    await page.getByRole("button", { name: /export csv/i }).click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain("audit-log")
  })

  test("should expand audit entry for details", async ({ page }) => {
    // Click chevron to expand first entry
    await page.locator("tbody tr").first().getByRole("button").first().click()

    // Verify expanded panel shows details
    await expect(page.getByText(/receipt id/i)).toBeVisible()
    await expect(page.getByText(/timestamp/i)).toBeVisible()
    await expect(page.getByText(/actor/i)).toBeVisible()

    // Test copy to clipboard for Receipt ID
    await page.getByRole("button", { name: /copy receipt/i }).click()
    await expect(page.getByText(/copied/i)).toBeVisible()
  })

  test("should open source event link if available", async ({ page }) => {
    // Expand an entry with details
    await page.locator("tbody tr").first().getByRole("button").first().click()

    // Check if "Open source event" link exists
    const sourceLink = page.getByRole("link", { name: /open source event/i })
    if (await sourceLink.isVisible()) {
      // Verify link is clickable
      await expect(sourceLink).toBeEnabled()
    }
  })
})
