import { expect, test } from "@playwright/test"
import { worldDesigns } from "../../src/components/world-design"

test.skip(process.env.OPENCODE_DEMO !== "1", "Requires the development demo server")

// Run against `bun run dev:demo`; requests use the real Vite demo middleware.
test("opens a populated design preview without a backend and retains presentation choices", async ({
  page,
}, testInfo) => {
  const failures: string[] = []
  page.on("pageerror", (error) => failures.push(error.message))
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto("/")
  await expect(page.getByLabel("Demo scenarios")).toBeVisible()
  await expect(page.locator('[data-component="prompt-input"]')).toBeVisible()
  await expect(page.getByRole("heading", { name: "Review checklist", exact: true })).toBeVisible()
  const picker = page.locator('[data-action="world-design"]')
  await expect(page.locator("#review-panel")).toContainText("workspace-card.tsx")
  await expect(page.locator("#review-panel").getByText(/export function WorkspaceCard/)).not.toHaveCount(0)
  for (const design of worldDesigns) {
    await picker.selectOption(design.id)
    await expect(page.getByRole("heading", { name: "Review checklist", exact: true })).toBeVisible()
  }
  await page.screenshot({ path: testInfo.outputPath("populated-session.png") })
  await picker.selectOption("broodmind")
  await expect(page.locator(".world-shell")).toHaveAttribute("data-world", "broodmind")
  await page.reload()
  await expect(picker).toHaveValue("broodmind")
  expect(failures).toEqual([])
})

test("shows approval, question, and error scenarios in the shared interface", async ({ page }, testInfo) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Demo · Review a dependency update", exact: true }).click()
  await expect(page.getByRole("button", { name: "Allow once", exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("permission.png") })
  await page.getByRole("link", { name: "Demo · Choose the documentation structure", exact: true }).click()
  await expect(page.getByText("Who should the guide help first?", { exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("question.png") })
  await page.getByRole("link", { name: "Demo · Investigate a failed build", exact: true }).click()
  await expect(page.getByRole("heading", { name: "The import needs attention", exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("failed-tool.png") })
})

test("shows populated home and keeps the demo controls reachable on mobile", async ({ page }, testInfo) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Review checklist", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Home", exact: true }).click()
  await expect(page.locator('[data-component="home-session-row"]')).toHaveCount(6)
  await page.screenshot({ path: testInfo.outputPath("home.png") })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("link", { name: "Demo · Polish the workspace welcome card", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Review checklist", exact: true })).toBeVisible()
  await expect(page.locator('[data-action="world-design"]')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("mobile.png") })
})

test("rejects external API mutations before issuing a network request", async ({ page }) => {
  const external: string[] = []
  page.on("request", (request) => {
    if (request.url().startsWith("https://demo-external.invalid/")) external.push(request.url())
  })
  await page.goto("/")
  const result = await page.evaluate(async () => {
    const modulePath = "/dev/demo-browser.ts"
    const { demoFetch } = await import(modulePath)
    return demoFetch("https://demo-external.invalid/session/example/prompt_async", {
      method: "POST",
      body: JSON.stringify({ parts: [{ type: "text", text: "Do not execute" }] }),
    }).then(
      () => "Unexpected success",
      (error: Error) => error.message,
    )
  })
  expect(result).toBe("The read-only demo cannot connect to another server.")
  expect(external).toEqual([])
})
