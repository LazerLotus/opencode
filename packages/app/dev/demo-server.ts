import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"
import type { EventServerConnected } from "@opencode-ai/sdk/v2/types"
import { demo, demoFileList } from "./demo-data"

const emptyList = new Set(["/skill", "/command", "/lsp", "/formatter", "/vcs/status", "/pty", "/pty/shells"])
const emptyObject = new Set(["/global/config", "/config", "/provider/auth", "/mcp", "/experimental/resource"])

export function demoServer(): Plugin {
  return {
    name: "acceler-design-demo",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (serveDemo(request, response) === false) next()
      })
    },
  }
}

export function serveDemo(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? "/", "http://localhost")
  if (url.pathname !== "/__demo" && !url.pathname.startsWith("/__demo/")) return false
  const path = url.pathname.slice("/__demo".length)
  const json = (body: unknown, status = 200) => {
    response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" })
    response.end(JSON.stringify(body))
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    request.resume()
    return json(
      {
        name: "DemoReadOnlyError",
        data: {
          message:
            "This development preview is read-only. No commands, file changes, or provider requests are executed.",
        },
      },
      405,
    )
  }
  if (path === "/global/event" || path === "/event") {
    response.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    })
    response.flushHeaders()
    const event = { type: "server.connected", properties: {}, id: "evt_demo_connected" } satisfies EventServerConnected
    response.write(
      `retry: 10000\n\ndata: ${JSON.stringify(path === "/global/event" ? { directory: "global", payload: event } : event)}\n\n`,
    )
    const timer = setInterval(() => response.write(": demo heartbeat\n\n"), 15000)
    timer.unref()
    response.once("close", () => clearInterval(timer))
    return
  }
  if (path === "/global/health") return json({ healthy: true, version: "demo" })
  const location = { directory: demo.directory, project: { id: demo.project.id, directory: demo.directory } }
  if (path === "/api/reference") return json({ location, data: [] })
  if (path === "/api/agent")
    return json({
      location,
      data: [
        {
          id: "build",
          name: "Build",
          mode: "primary",
          hidden: false,
          request: { settings: {}, headers: {}, body: {} },
          permissions: [],
        },
        {
          id: "plan",
          name: "Plan",
          mode: "primary",
          hidden: false,
          request: { settings: {}, headers: {}, body: {} },
          permissions: [],
        },
      ],
    })
  if (path === "/api/command" || path === "/api/mcp" || path === "/api/pty/shells") return json({ location, data: [] })
  if (path === "/api/mcp/resource") return json({ location, data: { resources: [], templates: [] } })
  if (path === "/api/path")
    return json({
      state: demo.directory,
      config: demo.directory,
      worktree: demo.directory,
      directory: demo.directory,
      home: "/demo",
    })
  if (path === "/api/vcs") return json({ location, data: { branch: "demo-welcome-card", defaultBranch: "dev" } })
  if (path === "/api/project") return json([demo.project])
  if (path === "/api/project/current") return json({ id: demo.project.id, directory: demo.directory })
  if (path === "/session" || path === "/api/session") {
    const search = url.searchParams.get("search")?.toLowerCase()
    const sessions = demo.sessions.filter((session) => !search || session.title.toLowerCase().includes(search))
    if (path === "/session") return json(sessions)
    const offset = Math.max(0, Number(url.searchParams.get("cursor")) || 0)
    const limit = Math.max(1, Number(url.searchParams.get("limit")) || 50)
    return json({
      data: sessions.slice(offset, offset + limit).map(currentSession),
      cursor: { next: offset + limit < sessions.length ? String(offset + limit) : undefined },
    })
  }
  if (path === "/api/session/active") return json({ data: {} })
  if (path.startsWith("/api/")) return json({ error: "Demo endpoint not found" }, 404)
  if (path === "/path")
    return json({
      state: demo.directory,
      config: demo.directory,
      worktree: demo.directory,
      directory: demo.directory,
      home: "/demo",
    })
  if (path === "/project") return json([demo.project])
  if (path === "/project/current" || path === `/project/${demo.project.id}`) return json(demo.project)
  if (path === "/agent")
    return json([
      {
        name: "build",
        description: "Demo coding assistant",
        mode: "primary",
        native: true,
        permission: [],
        options: {},
        model: { providerID: "demo", modelID: "preview-model" },
      },
      { name: "plan", description: "Demo planning assistant", mode: "primary", permission: [], options: {} },
    ])
  if (path === "/vcs") return json({ branch: "demo-welcome-card", default_branch: "dev" })
  if (path === "/vcs/diff") return json(demo.diffs)
  if (path === "/provider") return json(demo.provider)
  if (path === "/permission") return json(demo.permissions)
  if (path === "/question") return json(demo.questions)
  if (path === "/session/status") return json({})
  if (path === "/experimental/capabilities") return json({ backgroundSubagents: false })
  if (emptyList.has(path)) return json([])
  if (emptyObject.has(path)) return json({})
  if (path === "/file") return json(demoFileList(url.searchParams.get("path") ?? ""))
  if (path === "/file/content") {
    const file = (url.searchParams.get("path") ?? "").replace(`${demo.directory}/`, "")
    if (!(file in demo.files)) return json({ error: "Demo file not found" }, 404)
    return json({ type: "text", content: demo.files[file] })
  }
  if (path === "/find/file") {
    const query = (url.searchParams.get("query") ?? "").toLowerCase()
    const dirs = url.searchParams.get("dirs") === "true"
    const paths = dirs ? ["src", "src/components", "src/styles", "tests", "docs"] : Object.keys(demo.files)
    return json(
      paths
        .filter((file) => file.toLowerCase().includes(query))
        .slice(0, Math.max(1, Number(url.searchParams.get("limit")) || 100)),
    )
  }
  const match = path.match(/^\/session\/([^/]+)(?:\/(message|todo|diff|children)(?:\/([^/]+))?)?$/)
  if (!match) return json({ error: "Demo endpoint not found" }, 404)
  const session = demo.sessions.find((item) => item.id === match[1])
  if (!session) return json({ error: "Demo session not found" }, 404)
  if (!match[2]) return json(session)
  if (match[2] === "todo") return json(session.id === demo.sessionID ? demo.todos : [])
  if (match[2] === "diff") return json(session.id === demo.sessionID ? demo.diffs : [])
  if (match[2] === "children") return json([])
  const messages = demo.messages[session.id] ?? []
  if (match[3]) {
    const message = messages.find((item) => item.info.id === match[3])
    return message ? json(message) : json({ error: "Demo message not found" }, 404)
  }
  const limit = Math.max(1, Number(url.searchParams.get("limit")) || 80)
  const cursor = url.searchParams.get("before")
  const end = cursor ? messages.findIndex((message) => message.info.id === cursor) : messages.length
  if (end < 0) return json({ error: "Invalid demo message cursor" }, 400)
  const start = Math.max(0, end - limit)
  const next = start > 0 ? messages[start].info.id : undefined
  const items = messages.slice(start, end)
  if (next) response.setHeader("x-next-cursor", next)
  return json(items)
}

function currentSession(session: (typeof demo.sessions)[number]) {
  return {
    id: session.id,
    projectID: session.projectID,
    title: session.title,
    agent: session.agent,
    model: session.model,
    time: session.time,
    cost: 0,
    tokens: { input: 2400, output: 1100, reasoning: 300, cache: { read: 800, write: 0 } },
    location: { directory: demo.directory, project: { id: demo.project.id, directory: demo.directory } },
  }
}
