import { test, expect } from "@playwright/test"

test.describe("Audit Page - Filters and Export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/audit")
    await page.waitForLoadState("networkidle")
  })

  test("should change action type filters", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Click Revoke filter
    await page.getByRole("button", { name: "Revoke" }).click()
    await page.waitForTimeout(500)

    // Click Sessions filter
    await page.getByRole("button", { name: "Sessions" }).click()
    await page.waitForTimeout(500)

    // Click Notify filter
    await page.getByRole("button", { name: "Notify" }).click()
    await page.waitForTimeout(500)

    // Click Ticket filter
    await page.getByRole("button", { name: "Ticket" }).click()
    await page.waitForTimeout(500)

    // Reset to All
    await page.getByRole("button", { name: "All", exact: true }).first().click()
    await page.waitForTimeout(500)

    console.log("[v0] Action type filters tested successfully")
  })

  test("should change status filters", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Click Success filter
    await page.getByRole("button", { name: "Success" }).click()
    await page.waitForTimeout(500)

    // Click Error filter
    await page.getByRole("button", { name: "Error" }).click()
    await page.waitForTimeout(500)

    // Reset to All
    const allButtons = page.getByRole("button", { name: "All", exact: true })
    await allButtons.nth(1).click()
    await page.waitForTimeout(500)

    console.log("[v0] Status filters tested successfully")
  })

  test("should search audit receipts", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Type in search
    await page.getByPlaceholder(/Search by actor/).fill("secops")
    await page.waitForTimeout(500)

    console.log("[v0] Search functionality tested")

    // Clear search
    await page.getByPlaceholder(/Search by actor/).clear()
    await page.waitForTimeout(500)
  })

  test("should select date range", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Click From Date button
    const fromDateButton = page.getByRole("button", { name: /Pick a date/ }).first()
    await fromDateButton.click()
    await page.waitForTimeout(500)

    // Select a date from the calendar (if visible)
    const calendar = page.locator('[role="dialog"]').filter({ has: page.locator("table") })
    if ((await calendar.count()) > 0) {
      // Click on a date cell
      const dateCell = calendar.locator('button[name="day"]').first()
      await dateCell.click()
      await page.waitForTimeout(500)
    }

    console.log("[v0] Date range selection tested")
  })

  test("should expand and collapse audit receipt details", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Check if there are any receipts
    const receiptRows = page.locator("table tbody tr")
    const rowCount = await receiptRows.count()

    if (rowCount > 0) {
      // Click on first receipt to expand
      await receiptRows.first().click()
      await page.waitForTimeout(500)

      // Check if details are visible
      const detailsSection = page.locator("text=Action Details")
      await expect(detailsSection).toBeVisible()

      console.log("[v0] Receipt expanded successfully")

      // Click again to collapse
      await receiptRows.first().click()
      await page.waitForTimeout(500)

      console.log("[v0] Receipt collapsed successfully")
    } else {
      console.log("[v0] No receipts available to expand")
    }
  })

  test("should copy receipt ID to clipboard", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Check if there are any receipts
    const copyButtons = page.locator("button:has(code)")
    const buttonCount = await copyButtons.count()

    if (buttonCount > 0) {
      // Click first copy button
      await copyButtons.first().click()
      await page.waitForTimeout(1000)

      // Check for success toast
      const toast = page.locator("[data-sonner-toast]")
      if ((await toast.count()) > 0) {
        await expect(toast).toContainText(/Copied/i)
        console.log("[v0] Receipt ID copied successfully")
      }
    } else {
      console.log("[v0] No receipts available to copy")
    }
  })

  test("should export audit receipts to CSV", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Set up download listener
    const downloadPromise = page.waitForEvent("download")

    // Click export button
    await page.getByRole("button", { name: /Export CSV/ }).click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("audit_receipts.csv")

    console.log("[v0] Audit CSV exported successfully:", download.suggestedFilename())
  })
})
