# Populated design preview

From `packages/app`, run:

```sh
bun run dev:demo
```

Open http://127.0.0.1:3013. The first visit opens a populated session automatically. The demo strip switches between sample scenarios; the app's Home button shows the populated workspace. Use the Design selector to compare all eleven presentations, and Settings to choose a theme independently.

The demo includes conversation text, Markdown, code, tool activity, changed files, file contents, tasks, and separate permission, question, and error examples. These are fictional fixtures. No provider credentials or backend process are needed. Unsupported actions return an explicit demo error rather than executing commands or modifying real files.

The dedicated port keeps this preview's browser storage separate from the ordinary development app. Design, theme and draft choices persist on reload. Use this command's default port rather than a port used by your regular app. To restore first-visit preferences, clear site data for this demo origin.

`bun run dev` continues to use the normal backend. The mock middleware runs only in Vite's development `demo` mode; production builds do not activate it or include demo session data.
