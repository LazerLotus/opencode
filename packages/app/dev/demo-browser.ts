import { demo } from "./demo-data"

const directory = "/demo/acceler-workspace"

export function prepareDemo() {
  // The demo command uses its own fixed port, keeping its browser storage separate.
  const defaults = {
    "settings.v3": {
      general: { newLayoutDesigns: true, shouldDisplayTabsToast: false, showFileTree: true },
    },
    "opencode.global.dat:server": {
      projects: { local: [{ worktree: directory, expanded: true }] },
      lastProject: { local: directory },
    },
    "opencode.global.dat:layout": {
      review: { panelOpened: true, diffStyle: "unified" },
      fileTree: { opened: false, width: 280, tab: "all" },
    },
  }
  Object.entries(defaults).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value))
  })
  const strip = document.createElement("nav")
  strip.setAttribute("aria-label", "Demo scenarios")
  strip.style.cssText =
    "height:32px;display:flex;align-items:center;gap:12px;padding:0 12px;overflow-x:auto;white-space:nowrap;background:#155EF2;color:white;font:12px system-ui"
  const label = document.createElement("strong")
  label.textContent = "READ-ONLY DEMO · Fictional data"
  strip.append(label)
  demo.sessions.forEach((session) => {
    const link = document.createElement("a")
    link.href = `/${btoa(directory).replace(/=+$/, "")}/session/${session.id}`
    link.textContent = session.title
    link.style.cssText = "color:inherit;text-decoration:underline"
    strip.append(link)
  })
  document.body.prepend(strip)
  const root = document.getElementById("root")
  if (root) root.style.height = "calc(100dvh - 32px)"
  if (location.pathname !== "/") return
  history.replaceState(null, "", `/${btoa(directory).replace(/=+$/, "")}/session/ses_demo_design`)
}

// Platform API clients resolve some endpoints from the origin, dropping base paths.
export const demoFetch = Object.assign(
  (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (url.origin !== location.origin)
      return Promise.reject(new Error("The read-only demo cannot connect to another server."))
    if (!url.pathname.startsWith("/__demo/")) url.pathname = `/__demo${url.pathname}`
    return fetch(new Request(url, request))
  },
  { preconnect: fetch.preconnect },
)
