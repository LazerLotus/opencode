import { expect, test } from "@playwright/test"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { worldDesigns } from "../../src/components/world-design"
import { mockOpenCodeServer } from "../utils/mock-server"
import { expectAppVisible } from "../utils/waits"

const directory = "C:/OpenCode/WorldDesigns"
const sessionID = "ses_world_designs"

test.beforeEach(async ({ page }) => {
  await mockOpenCodeServer(page, {
    directory,
    project: {
      id: "proj_world_designs",
      worktree: directory,
      vcs: "git",
      name: "World designs",
      time: { created: 1700000000000, updated: 1700000000000 },
      sandboxes: [],
    },
    provider: {
      all: [
        {
          id: "opencode",
          name: "OpenCode",
          models: { test: { id: "test", name: "Test model", limit: { context: 200000 } } },
        },
      ],
      connected: ["opencode"],
      default: { providerID: "opencode", modelID: "test" },
    },
    sessions: [
      {
        id: sessionID,
        slug: "world-designs",
        projectID: "proj_world_designs",
        directory,
        title: "A shared session",
        version: "dev",
        time: { created: 1700000000000, updated: 1700000000000 },
      },
    ],
    pageMessages: () => ({ items: [] }),
  })
  await page.route("**/pty/shells", (route) => route.fulfill({ json: [] }))
  await page.addInitScript((directory) => {
    if (!localStorage.getItem("settings.v3")) {
      localStorage.setItem(
        "settings.v3",
        JSON.stringify({ general: { newLayoutDesigns: true, shouldDisplayTabsToast: false } }),
      )
      localStorage.setItem("opencode-theme-id", "oc-2")
      localStorage.setItem("opencode-color-scheme", "light")
      localStorage.setItem(
        "opencode.global.dat:server",
        JSON.stringify({
          projects: { local: [{ worktree: directory, expanded: true }] },
          lastProject: { local: directory },
        }),
      )
    }
  }, directory)
  await page.goto(`/${base64Encode(directory)}/session/${sessionID}`)
  await expectAppVisible(page.locator('[data-component="prompt-input"]'))
  await page.getByRole("button", { name: "Toggle debug tools" }).click()
})

test("switches all eleven worlds without remounting the draft or changing theme, then restores the selection", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  const editor = page.locator('[data-component="prompt-input"][contenteditable="true"]')
  await editor.fill("Keep this draft while I compare designs")
  const original = await editor.elementHandle()
  const route = page.url()

  for (const scheme of ["light", "dark"]) {
    if (scheme === "dark") {
      await page.evaluate(() => localStorage.setItem("opencode-color-scheme", "dark"))
      await page.reload()
      await expectAppVisible(editor)
    }
    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", scheme)
    for (const design of worldDesigns) {
      await page.locator('[data-action="world-design"]').selectOption(design.id)
      await expect(page.locator(".world-shell")).toHaveAttribute("data-world", design.id)
      await expect(editor).toContainText("Keep this draft while I compare designs")
      expect(page.url()).toBe(route)
      expect(await page.evaluate(() => localStorage.getItem("opencode-theme-id"))).toBe("oc-2")
      await expect(page.locator("html")).toHaveAttribute("data-color-scheme", scheme)
      if (scheme === "light") expect(await original!.evaluate((node) => node.isConnected)).toBe(true)
      await expect(page.locator(".world-brand img")).toBeVisible()
      const bounds = await page.locator(".world-main").boundingBox()
      expect(bounds!.width).toBeGreaterThan(600)
      await page.screenshot({ path: testInfo.outputPath(`${design.id}-${scheme}.png`) })
    }
  }
  await page.reload()
  await expect(page.locator('[data-action="world-design"]')).toHaveValue("orchard")
  await expect(editor).toContainText("Keep this draft while I compare designs")
})

test("keeps all designs and the composer reachable on a narrow screen", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const design of worldDesigns) {
    await page.locator('[data-action="world-design"]').selectOption(design.id)
    await expect(page.locator('[data-component="prompt-input"]')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const picker = await page.locator('[data-action="world-design"]').boundingBox()
    expect(picker!.x).toBeGreaterThanOrEqual(0)
    expect(picker!.x + picker!.width).toBeLessThanOrEqual(390)
    await page.screenshot({ path: testInfo.outputPath(`${design.id}-mobile.png`) })
  }
})

test("moves the shared inspector and resizes the conversation from its left edge", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.locator('[data-action="world-design"]').selectOption("parallax")
  const toggle = page.getByRole("button", { name: "Toggle review", exact: true })
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click()
  const conversation = page.locator("[data-world-conversation]")
  const inspector = page.locator("[data-world-inspector]")
  await expect(inspector).toBeVisible()
  await expect.poll(async () => (await inspector.boundingBox())!.x < (await conversation.boundingBox())!.x).toBe(true)
  const before = (await conversation.boundingBox())!.width
  const handle = conversation.locator('[data-component="resize-handle"][data-edge="start"]').first()
  const box = await handle.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(box!.x - 60, box!.y + box!.height / 2)
  await page.mouse.up()
  await expect.poll(async () => (await conversation.boundingBox())!.width).toBeGreaterThan(before + 40)
  await page.locator('[data-action="world-design"]').selectOption("kinetic")
  await expect.poll(async () => (await inspector.boundingBox())!.x > (await conversation.boundingBox())!.x).toBe(true)
})

test("rearranges home navigation while retaining a separately selected theme", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.evaluate(() => localStorage.setItem("opencode-theme-id", "dracula"))
  await page.reload()
  await page.getByRole("button", { name: "Home", exact: true }).click()
  await expect(page.locator("[data-world-home]")).toBeVisible()
  await expect(page.locator('[data-component="home-session-row"]').first()).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula")
  for (const design of worldDesigns) {
    await page.locator('[data-action="world-design"]').selectOption(design.id)
    const projects = await page.locator("[data-world-home] > aside").boundingBox()
    const sessions = await page.locator("[data-world-home] > section").boundingBox()
    expect(projects!.x < sessions!.x).toBe(design.navigation === "start")
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula")
    await page.screenshot({ path: testInfo.outputPath(`${design.id}-home.png`) })
  }
  await page.getByRole("button", { name: "Settings", exact: true }).click()
  const selector = page.locator('[data-action="settings-design"]')
  await expect(selector).toContainText("Orchard")
  await selector.locator('[data-component="select-v2"]').click()
  await page
    .locator('[data-slot="select-v2-listbox"] [data-component="menu-v2-item"]')
    .filter({ hasText: "Kinetic" })
    .click()
  await expect(page.locator('[data-action="world-design"]')).toHaveValue("kinetic")
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula")
})

test("keeps side-dock selectors reachable in short desktop windows", async ({ page }) => {
  for (const height of [522, 600, 720]) {
    await page.setViewportSize({ width: 1600, height })
    for (const design of ["quanta", "raidweaver"]) {
      const picker = page.locator('[data-action="world-design"]')
      await picker.selectOption(design)
      const box = await picker.boundingBox()
      expect(box!.y + box!.height).toBeLessThanOrEqual(height)
      expect(
        await picker.evaluate((node) => {
          const box = node.getBoundingClientRect()
          return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === node
        }),
      ).toBe(true)
    }
  }
})

test("resizes a file-only inspector from the conversation boundary", async ({ page }) => {
  await page.evaluate(() => {
    const settings = JSON.parse(localStorage.getItem("settings.v3")!)
    settings.general.showFileTree = true
    localStorage.setItem("settings.v3", JSON.stringify(settings))
    const layout = JSON.parse(localStorage.getItem("opencode.global.dat:layout") ?? "{}")
    layout.fileTree = { opened: true, width: 280, tab: "all" }
    localStorage.setItem("opencode.global.dat:layout", JSON.stringify(layout))
  })
  await page.reload()
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.locator('[data-action="world-design"]').selectOption("parallax")
  const review = page.getByRole("button", { name: "Toggle review", exact: true })
  if ((await review.getAttribute("aria-expanded")) === "true") await review.click()
  const inspector = page.locator("#review-panel")
  await expect(inspector).toBeVisible()
  const before = await inspector.boundingBox()
  const handle = inspector.locator('[data-component="resize-handle"]').last()
  const box = await handle.boundingBox()
  expect(box!.x).toBeGreaterThan(before!.x + before!.width - 12)
  await page.mouse.move(box!.x + 1, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(box!.x + 60, box!.y + box!.height / 2)
  await page.mouse.up()
  await expect.poll(async () => (await inspector.boundingBox())!.width).toBeGreaterThan(before!.width + 40)
})
