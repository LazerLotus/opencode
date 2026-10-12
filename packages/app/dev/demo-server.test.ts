import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { fetch } from "bun"
import { createServer } from "node:http"
import { parsePatch } from "diff"
import { resolveFileDiff } from "@opencode-ai/session-ui/session-diff"
import { demo } from "./demo-data"
import { demoServer, serveDemo } from "./demo-server"

const server = createServer((request, response) => {
  if (serveDemo(request, response) !== false) return
  response.writeHead(418, { "content-type": "text/plain" })
  response.end("Vite fallback")
})
const state = { url: "" }

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  if (!address || typeof address === "string") throw new Error("Demo test server did not start")
  state.url = `http://127.0.0.1:${address.port}`
})
afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
})

describe("development demo server", () => {
  test("is serve-only and leaves all ordinary paths to Vite", async () => {
    expect(demoServer().apply).toBe("serve")
    for (const path of ["/", "/session", "/global/health", "/api/health", "/__demo-other/session", "/src/entry.tsx"]) {
      const response = await fetch(`${state.url}${path}`)
      expect(response.status).toBe(418)
      expect(await response.text()).toBe("Vite fallback")
    }
    expect(await (await fetch(`${state.url}/__demo/global/health`)).json()).toMatchObject({ healthy: true })
    expect((await fetch(`${state.url}/__demo/api/health`)).status).toBe(404)
  })
  test("rejects unknown endpoints and mutations with an explicit read-only error", async () => {
    expect((await fetch(`${state.url}/__demo/not-a-route`)).status).toBe(404)
    const response = await fetch(`${state.url}/__demo/session/${demo.sessionID}/prompt_async`, {
      method: "POST",
      body: JSON.stringify({ parts: [{ type: "text", text: "Change a real file" }] }),
    })
    expect(response.status).toBe(405)
    expect(await response.json()).toMatchObject({
      name: "DemoReadOnlyError",
      data: { message: expect.stringContaining("read-only") },
    })
    expect(demo.messages[demo.sessionID]).toHaveLength(4)
  })
  test("serves rich legacy history and navigable fixture files", async () => {
    const messages = await (await fetch(`${state.url}/__demo/session/${demo.sessionID}/message`)).json()
    expect(messages).toHaveLength(4)
    expect(messages[1].parts.map((part: { type: string }) => part.type)).toEqual([
      "reasoning",
      "text",
      "tool",
      "tool",
      "tool",
    ])
    expect(messages[3].parts[0].text).toContain("| Area | Change |")
    const diff = await (await fetch(`${state.url}/__demo/session/${demo.sessionID}/diff`)).json()
    expect(diff).toHaveLength(2)
    expect(diff[0]).toMatchObject({
      file: "src/components/workspace-card.tsx",
      status: "modified",
      patch: expect.stringContaining("aria-labelledby"),
    })
    const tree = await (await fetch(`${state.url}/__demo/file?path=src`)).json()
    expect(tree).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "src/components", type: "directory" }),
        expect.objectContaining({ path: "src/app.tsx", type: "file" }),
      ]),
    )
    const content = await (
      await fetch(`${state.url}/__demo/file/content?path=src/components/workspace-card.tsx`)
    ).json()
    expect(content).toMatchObject({ type: "text", content: expect.stringContaining("aria-labelledby") })
    expect((await fetch(`${state.url}/__demo/file/content?path=/etc/passwd`)).status).toBe(404)
  })
  test("renders complete code from both generated fixture patches", () => {
    for (const diff of demo.diffs) {
      const parsed = parsePatch(diff.patch)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].hunks.length).toBeGreaterThan(0)
      const resolved = resolveFileDiff(diff)
      expect(resolved.additionLines.join("")).toBe(diff.after)
      expect(resolved.deletionLines.join("")).toBe(diff.before)
      expect(resolved.additionLines.length).toBeGreaterThan(0)
    }
  })
  test("paginates legacy history using the fixture cursor", async () => {
    const response = await fetch(`${state.url}/__demo/session/${demo.sessionID}/message?limit=2`)
    const page = await response.json()
    expect(page.map((message: { info: { id: string } }) => message.info.id)).toEqual(["msg_demo_03", "msg_demo_04"])
    expect(response.headers.get("x-next-cursor")).toBe("msg_demo_03")
    const previous = await fetch(`${state.url}/__demo/session/${demo.sessionID}/message?limit=2&before=msg_demo_03`)
    const messages = await previous.json()
    expect(messages.map((message: { info: { id: string } }) => message.info.id)).toEqual(["msg_demo_01", "msg_demo_02"])
    expect(messages[1].parts).toEqual(expect.arrayContaining([expect.objectContaining({ type: "tool", tool: "edit" })]))
    expect(previous.headers.get("x-next-cursor")).toBeNull()
    expect((await fetch(`${state.url}/__demo/api/session/${demo.sessionID}/message`)).status).toBe(404)
  })
  test("serves distinct permission, question, and failed tool scenarios", async () => {
    expect(await (await fetch(`${state.url}/__demo/permission`)).json()).toEqual(demo.permissions)
    expect(await (await fetch(`${state.url}/__demo/question`)).json()).toEqual(demo.questions)
    const failure = await (await fetch(`${state.url}/__demo/session/ses_demo_failure/message`)).json()
    expect(failure[1].parts[0].state).toMatchObject({
      status: "error",
      error: expect.stringContaining("No command was executed"),
    })
  })
  test("opens a persistent legacy event stream and lets the consumer cancel it", async () => {
    const response = await fetch(`${state.url}/__demo/global/event`)
    expect(response.headers.get("content-type")).toBe("text/event-stream")
    const reader = response.body!.getReader()
    const initial = await reader.read()
    expect(initial.done).toBe(false)
    expect(new TextDecoder().decode(initial.value)).toContain('"payload":{"type":"server.connected"')
    await reader.cancel()
  })
})
