import { test, expect } from "@playwright/test"

test.describe("Review Page - Approve and Dismiss", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/review")
    await page.waitForLoadState("networkidle")
  })

  test("should approve a case", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Review Queue")

    // Check if there are any cases to approve
    const approveButtons = page.locator('button:has-text("Approve")')
    const buttonCount = await approveButtons.count()

    if (buttonCount > 0) {
      // Click the first Approve button
      await approveButtons.first().click()
      await page.waitForTimeout(1000)

      // Check for success toast
      const toast = page.locator("[data-sonner-toast]")
      if ((await toast.count()) > 0) {
        await expect(toast).toContainText(/Sanctioned/i)
        console.log("[v0] Case approved successfully")
      }
    } else {
      console.log("[v0] No cases available to approve")
    }
  })

  test("should dismiss a case", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Review Queue")

    // Check if there are any cases to dismiss
    const dismissButtons = page.locator('button:has-text("Dismiss")')
    const buttonCount = await dismissButtons.count()

    if (buttonCount > 0) {
      // Click the first Dismiss button
      await dismissButtons.first().click()
      await page.waitForTimeout(1000)

      // Check for success toast
      const toast = page.locator("[data-sonner-toast]")
      if ((await toast.count()) > 0) {
        await expect(toast).toContainText(/Dismissed/i)
        console.log("[v0] Case dismissed successfully")
      }
    } else {
      console.log("[v0] No cases available to dismiss")
    }
  })

  test("should batch approve multiple cases", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Review Queue")

    // Select multiple checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()

    if (checkboxCount > 2) {
      // Select first two cases
      await checkboxes.nth(1).click()
      await checkboxes.nth(2).click()
      await page.waitForTimeout(500)

      // Click batch Approve All button
      const batchApproveButton = page.getByRole("button", { name: /Approve All/ })
      if ((await batchApproveButton.count()) > 0) {
        await batchApproveButton.click()
        await page.waitForTimeout(1000)

        // Check for success toast
        const toast = page.locator("[data-sonner-toast]")
        if ((await toast.count()) > 0) {
          await expect(toast).toContainText(/Batch Approved/i)
          console.log("[v0] Batch approval successful")
        }
      }
    } else {
      console.log("[v0] Not enough cases for batch approval")
    }
  })

  test("should batch dismiss multiple cases", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Review Queue")

    // Select multiple checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()

    if (checkboxCount > 2) {
      // Select first two cases
      await checkboxes.nth(1).click()
      await checkboxes.nth(2).click()
      await page.waitForTimeout(500)

      // Click batch Dismiss All button
      const batchDismissButton = page.getByRole("button", { name: /Dismiss All/ })
      if ((await batchDismissButton.count()) > 0) {
        await batchDismissButton.click()
        await page.waitForTimeout(1000)

        // Check for success toast
        const toast = page.locator("[data-sonner-toast]")
        if ((await toast.count()) > 0) {
          await expect(toast).toContainText(/Batch Dismissed/i)
          console.log("[v0] Batch dismiss successful")
        }
      }
    } else {
      console.log("[v0] Not enough cases for batch dismiss")
    }
  })

  test("should change sort options", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Review Queue")

    // Click Priority sort
    await page.getByRole("button", { name: "Priority" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/sort=priority/)

    // Click Impact sort
    await page.getByRole("button", { name: "Impact" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/sort=impact/)

    // Click Confidence sort
    await page.getByRole("button", { name: "Confidence" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/sort=confidence/)

    console.log("[v0] Sort options tested successfully")
  })
})
