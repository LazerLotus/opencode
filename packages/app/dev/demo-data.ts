import { createPatch, diffLines } from "diff"
import type {
  AssistantMessage,
  FileNode,
  Message,
  Part,
  PermissionRequest,
  Project,
  ProviderListResponse,
  QuestionRequest,
  Session,
  SnapshotFileDiff,
  Todo,
} from "@opencode-ai/sdk/v2/types"

const directory = "/demo/acceler-workspace"
const sessionID = "ses_demo_design"
const created = 1791792000000
const model = { providerID: "demo", modelID: "preview-model" }
const files: Record<string, string> = {
  "README.md":
    "# Acceler workspace\n\nA deterministic design preview. No commands are executed and no real files are changed.\n\n## Explore\nCompare workspace designs, inspect the session changes, and browse the sample files.\n",
  "package.json":
    '{\n  "name": "acceler-workspace-demo",\n  "private": true,\n  "scripts": { "test": "bun test", "dev": "vite" }\n}\n',
  "src/app.tsx":
    'import { WorkspaceCard } from "./components/workspace-card"\n\nexport function App() {\n  return <WorkspaceCard title="Your next idea" description="A little room to make something great." />\n}\n',
  "src/components/workspace-card.tsx":
    'export function WorkspaceCard(props: { title: string; description: string }) {\n  return (\n    <article class="workspace-card" aria-labelledby="workspace-title">\n      <h2 id="workspace-title">{props.title}</h2>\n      <p>{props.description}</p>\n      <span class="workspace-card__hint">Ready when you are</span>\n    </article>\n  )\n}\n',
  "src/styles/workspace.css":
    ".workspace-card {\n  padding: 24px;\n  border: 1px solid var(--border-base);\n  border-radius: 16px;\n  background: var(--background-base);\n}\n.workspace-card__hint { color: var(--text-weak); }\n",
  "tests/workspace-card.test.ts":
    'import { expect, test } from "bun:test"\n\ntest("workspace card keeps its accessible heading", () => {\n  const title = "Your next idea"\n  expect(title.length).toBeGreaterThan(0)\n})\n',
  "docs/design-notes.md":
    "# Design notes\n\n- Keep task content readable in both themes.\n- Use blue for brand surfaces, yellow for emphasis, and green for support.\n- Keep keyboard focus visible.\n\nThese are sample project files for preview only.\n",
}
const diffs = [
  {
    file: "src/components/workspace-card.tsx",
    status: "modified" as const,
    before:
      'export function WorkspaceCard(props: { title: string }) {\n  return <div class="workspace-card">{props.title}</div>\n}\n',
    after: files["src/components/workspace-card.tsx"],
  },
  { file: "src/styles/workspace.css", status: "added" as const, before: "", after: files["src/styles/workspace.css"] },
].map((source) => {
  const changes = diffLines(source.before, source.after)
  return {
    ...source,
    patch: createPatch(source.file, source.before, source.after, "", "", { context: Infinity }),
    additions: changes.filter((change) => change.added).reduce((sum, change) => sum + (change.count ?? 0), 0),
    deletions: changes.filter((change) => change.removed).reduce((sum, change) => sum + (change.count ?? 0), 0),
  }
}) satisfies Array<SnapshotFileDiff & { file: string; before: string; after: string }>
const sessions = [
  [sessionID, "Demo · Polish the workspace welcome card"],
  ["ses_demo_permission", "Demo · Review a dependency update"],
  ["ses_demo_question", "Demo · Choose the documentation structure"],
  ["ses_demo_failure", "Demo · Investigate a failed build"],
  ["ses_demo_accessibility", "Demo · Keyboard navigation audit"],
  ["ses_demo_theme", "Demo · Refine light and dark theme tokens"],
].map(([id, title], index) => ({
  id,
  title,
  slug: id.replaceAll("_", "-"),
  projectID: "proj_demo_acceler",
  directory,
  version: "demo",
  agent: "build",
  model: { id: model.modelID, providerID: model.providerID },
  time: { created: created - index * 3_600_000, updated: created - index * 600_000 },
  ...(id === sessionID
    ? {
        summary: {
          additions: diffs.reduce((sum, diff) => sum + diff.additions, 0),
          deletions: diffs.reduce((sum, diff) => sum + diff.deletions, 0),
          files: diffs.length,
          diffs,
        },
      }
    : {}),
})) satisfies Session[]
const messages: Record<string, Array<{ info: Message; parts: Part[] }>> = {
  [sessionID]: [
    user(
      sessionID,
      "msg_demo_01",
      "Polish the workspace welcome card. Keep the content readable, add an accessible heading, and make the styling work in both themes. Please show the changes and explain the tradeoffs.",
    ),
    assistant(sessionID, "msg_demo_02", "msg_demo_01", [
      {
        type: "reasoning",
        text: "I’ll inspect the existing card before changing its structure. The heading needs an explicit association, and the panel should use theme variables rather than fixed text colors. I’ll keep the change small and verify the rendered markup and styles.",
        time: { start: created + 1000, end: created + 3000 },
      },
      {
        type: "text",
        text: "I found a compact card that currently renders a single line. I’m adding a heading, a short description, and a quiet hint while keeping the component API small.",
      },
      {
        type: "tool",
        tool: "read",
        callID: "call_demo_read",
        state: {
          status: "completed",
          input: { filePath: `${directory}/src/components/workspace-card.tsx` },
          title: "Read workspace-card.tsx",
          output: diffs[0].before,
          metadata: { preview: diffs[0].before },
          time: { start: created + 3000, end: created + 3500 },
        },
      },
      {
        type: "tool",
        tool: "edit",
        callID: "call_demo_edit",
        state: {
          status: "completed",
          input: {
            filePath: `${directory}/src/components/workspace-card.tsx`,
            oldString: diffs[0].before,
            newString: diffs[0].after,
          },
          title: "Update the welcome card",
          output: "Sample edit completed. The preview files are held in memory.",
          metadata: { filediff: diffs[0], diff: diffs[0].patch },
          time: { start: created + 4000, end: created + 5000 },
        },
      },
      {
        type: "tool",
        tool: "bash",
        callID: "call_demo_test",
        state: {
          status: "completed",
          input: { command: "bun test", description: "Check the welcome card" },
          title: "Run sample checks",
          output:
            "Demo transcript — this command was not executed.\n\n✓ Accessible heading\n✓ Theme surface variables\n✓ Narrow layout\n\n3 checks passed",
          metadata: { exit: 0, output: "3 sample checks passed", description: "Check the welcome card" },
          time: { start: created + 6000, end: created + 8000 },
        },
      },
    ]),
    user(sessionID, "msg_demo_03", "Great. Summarize what changed and leave me a short review checklist."),
    assistant(sessionID, "msg_demo_04", "msg_demo_03", [
      {
        type: "text",
        text: '## A little more room for your next idea\n\nThe welcome card now has a clear heading and supporting copy. Its colors follow the selected theme, so your workspace design and light or dark appearance can change independently.\n\n| Area | Change | Why it helps |\n| --- | --- | --- |\n| Structure | Semantic `article` and `h2` | Gives the card a clear identity |\n| Styling | Theme surface and border tokens | Keeps contrast consistent |\n| Spacing | A 24px inset and soft corners | Makes the message easier to scan |\n\n```tsx\n<article class="workspace-card" aria-labelledby="workspace-title">\n  <h2 id="workspace-title">{props.title}</h2>\n  <p>{props.description}</p>\n</article>\n```\n\n### Review checklist\n\n- [x] Keep the title readable in both themes\n- [x] Use an accessible heading association\n- [x] Keep the content compact on narrow screens\n- [ ] Review the final wording with the team\n\n> This is a static demo transcript. The sample tool results illustrate the interface; they do not report checks run against your project.\n\nThe two changed files are ready to inspect in the review panel.',
      },
    ]),
  ],
  ses_demo_permission: [
    user(
      "ses_demo_permission",
      "msg_demo_permission_01_user",
      "Check the dependency update and ask before installing anything.",
    ),
    assistant(
      "ses_demo_permission",
      "msg_demo_permission_02_assistant",
      "msg_demo_permission_01_user",
      [
        {
          type: "text",
          text: "The manifest is ready for review. This sample is waiting for permission to install dependencies; the demo never executes commands.",
        },
        {
          type: "tool",
          tool: "bash",
          callID: "call_demo_install",
          state: {
            status: "pending",
            input: { command: "bun install", description: "Install reviewed dependencies" },
            raw: '{"command":"bun install"}',
          },
        },
      ],
      false,
    ),
  ],
  ses_demo_question: [
    user("ses_demo_question", "msg_demo_question_01_user", "Help organize the project documentation."),
    assistant(
      "ses_demo_question",
      "msg_demo_question_02_assistant",
      "msg_demo_question_01_user",
      [
        { type: "text", text: "Before organizing the sample docs, choose the reading order that fits your audience." },
        {
          type: "tool",
          tool: "question",
          callID: "call_demo_question",
          state: {
            status: "running",
            input: {
              questions: [
                {
                  header: "Reading order",
                  question: "Who should the guide help first?",
                  options: [
                    { label: "New contributors", description: "Start with setup and a first change." },
                    { label: "Maintainers", description: "Start with architecture and release notes." },
                  ],
                },
              ],
            },
            title: "Choose the documentation audience",
            time: { start: created + 1000 },
          },
        },
      ],
      false,
    ),
  ],
  ses_demo_failure: [
    user("ses_demo_failure", "msg_demo_failure_01_user", "Investigate the build error and explain the next step."),
    assistant("ses_demo_failure", "msg_demo_failure_02_assistant", "msg_demo_failure_01_user", [
      {
        type: "tool",
        tool: "bash",
        callID: "call_demo_failure",
        state: {
          status: "error",
          input: { command: "bun run build", description: "Inspect sample build failure" },
          error:
            "Demo build failure: Cannot resolve './tokens.css' from src/styles/workspace.css. No command was executed.",
          metadata: { exit: 1 },
          time: { start: created + 1000, end: created + 2000 },
        },
      },
      {
        type: "text",
        text: "### The import needs attention\n\nThe sample build could not find `tokens.css`. Check the import path and whether that file belongs in the repository before trying again. No files have been changed in this session.",
      },
    ]),
  ],
  ses_demo_accessibility: [
    user(
      "ses_demo_accessibility",
      "msg_demo_accessibility_01_user",
      "Review the welcome screen’s keyboard navigation.",
    ),
    assistant("ses_demo_accessibility", "msg_demo_accessibility_02_assistant", "msg_demo_accessibility_01_user", [
      {
        type: "text",
        text: "## Keyboard review notes\n\n1. Keep focus visible on every interactive control.\n2. Preserve a predictable tab order.\n3. Make headings describe their sections.\n\nThe next review should include the design selector, file tree, and composer at a narrow viewport.",
      },
    ]),
  ],
  ses_demo_theme: [
    user("ses_demo_theme", "msg_demo_theme_01_user", "Document the theme token approach."),
    assistant("ses_demo_theme", "msg_demo_theme_02_assistant", "msg_demo_theme_01_user", [
      {
        type: "text",
        text: "## Theme boundaries\n\nUse `--background-base`, `--text-base`, and `--border-base` for the working surface. Brand colors belong in decoration.\n\n```css\n.workspace-card {\n  background: var(--background-base);\n  color: var(--text-base);\n  border: 1px solid var(--border-base);\n}\n```\n\nThis keeps the eleven workspace designs independent from the chosen color scheme.",
      },
    ]),
  ],
}

export const demo = {
  directory,
  sessionID,
  sessions,
  messages,
  files,
  diffs,
  project: {
    id: "proj_demo_acceler",
    worktree: directory,
    name: "Acceler workspace · Demo",
    vcs: "git",
    sandboxes: [],
    time: { created, updated: created },
  } satisfies Project,
  provider: {
    connected: ["demo"],
    default: { demo: "preview-model" },
    all: [
      {
        id: "demo",
        name: "Demo provider",
        source: "custom",
        env: [],
        options: {},
        models: {
          "preview-model": {
            id: "preview-model",
            providerID: "demo",
            name: "Preview model",
            api: { id: "preview-model", url: "", npm: "@ai-sdk/openai-compatible" },
            capabilities: {
              temperature: false,
              reasoning: true,
              attachment: false,
              toolcall: true,
              input: { text: true, image: false, audio: false, video: false, pdf: false },
              output: { text: true, image: false, audio: false, video: false, pdf: false },
              interleaved: false,
            },
            cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
            limit: { context: 200000, output: 16000 },
            status: "active",
            options: {},
            headers: {},
            release_date: "2026-01-01",
          },
        },
      },
    ],
  } satisfies ProviderListResponse,
  todos: [
    { id: "todo_demo_1", content: "Inspect the welcome card", status: "completed", priority: "high" },
    { id: "todo_demo_2", content: "Add accessible structure and theme styling", status: "completed", priority: "high" },
    { id: "todo_demo_3", content: "Review the final wording", status: "pending", priority: "medium" },
  ] satisfies Array<Todo & { id: string }>,
  permissions: [
    {
      id: "per_demo_install",
      sessionID: "ses_demo_permission",
      permission: "bash",
      patterns: ["bun install"],
      always: ["bun install"],
      metadata: { command: "bun install", description: "Sample dependency install" },
      tool: { messageID: "msg_demo_permission_02_assistant", callID: "call_demo_install" },
    },
  ] satisfies PermissionRequest[],
  questions: [
    {
      id: "que_demo_docs",
      sessionID: "ses_demo_question",
      questions: [
        {
          header: "Reading order",
          question: "Who should the guide help first?",
          options: [
            { label: "New contributors", description: "Start with setup and a first change." },
            { label: "Maintainers", description: "Start with architecture and release notes." },
          ],
        },
      ],
      tool: { messageID: "msg_demo_question_02_assistant", callID: "call_demo_question" },
    },
  ] satisfies QuestionRequest[],
}

export function demoFileList(path: string): FileNode[] {
  const relative = path.replace(directory, "").replace(/^\/+|\/+$/g, "")
  const prefix = relative ? `${relative}/` : ""
  return [
    ...new Set(
      Object.keys(files)
        .filter((file) => file.startsWith(prefix))
        .map((file) => file.slice(prefix.length).split("/")[0]),
    ),
  ].map((name) => {
    const target = `${prefix}${name}`
    return {
      name,
      path: target,
      absolute: `${directory}/${target}`,
      type: target in files ? "file" : "directory",
      ignored: false,
    }
  })
}

function user(session: string, id: string, text: string): { info: Message; parts: Part[] } {
  return {
    info: {
      id,
      sessionID: session,
      role: "user",
      agent: "build",
      model,
      time: { created: created + (id === "msg_demo_03" ? 10000 : 0) },
    },
    parts: [{ id: `prt_${id}`, sessionID: session, messageID: id, type: "text", text }],
  }
}

function assistant(
  session: string,
  id: string,
  parentID: string,
  parts: Array<
    | Omit<Extract<Part, { type: "text" }>, "id" | "sessionID" | "messageID">
    | Omit<Extract<Part, { type: "reasoning" }>, "id" | "sessionID" | "messageID">
    | Omit<Extract<Part, { type: "tool" }>, "id" | "sessionID" | "messageID">
  >,
  completed = true,
): { info: AssistantMessage; parts: Part[] } {
  return {
    info: {
      id,
      sessionID: session,
      parentID,
      role: "assistant",
      agent: "build",
      mode: "build",
      modelID: model.modelID,
      providerID: model.providerID,
      path: { cwd: directory, root: directory },
      cost: 0,
      tokens: { input: 2400, output: 1100, reasoning: 300, cache: { read: 800, write: 0 } },
      time: {
        created: created + (id === "msg_demo_04" ? 11000 : 1000),
        ...(completed ? { completed: created + (id === "msg_demo_04" ? 15000 : 9000) } : {}),
      },
      ...(completed ? { finish: "stop" } : {}),
    },
    parts: parts.map((part, index) => ({ ...part, id: `prt_${id}_${index}`, sessionID: session, messageID: id })),
  }
}
