* _2026-10-12 16:11:12 +0800 (gpt-6.1-sol/high)_

Reviewed implementation commit: f8bd9fa77ceb5a0eb49b5bf896f8bd7da48dc212

- **Changes required:** The populated preview renders the requested detail, but selecting an external server can bypass its advertised read-only boundary.

- **Smaller implementation available:** The demo selects legacy message loading, so its parallel current-message converter and message routes are unnecessary. The current session-list endpoint is needed by Home.

- **Next action:** Reject external backend requests in the demo adapter, remove the unused message representation, verify the affected boundaries and visible preview, and freeze a corrective commit for review.

## Findings

- **R1 — P2, blocking outcome:** `packages/app/dev/demo-browser.ts:49` forwards cross-origin requests unchanged. The entry file forces only the initial/default mock connection; existing server controls can select another server later. `packages/app/src/context/server-sdk.tsx:336–345` supplies `Platform.fetch` to the normal SDK/API clients, including mutation calls. Consequently, the app can submit real requests to a selected backend while still displaying “READ-ONLY DEMO,” contradicting the strip and README promise that commands/provider work do not execute. Restrict the demo adapter's backend requests to its own origin and return an explicit rejection before forwarding an external request. This is a source-traced failure path; the reviewer did not submit a real mutation.

- **R2 — P3, blocking minimality:** `packages/app/dev/demo-server.ts:159–181` accepts parallel current-message routes, and `200–250` adds `currentMessage`. The demo health endpoint advertises legacy protocol; `packages/app/src/utils/server-protocol.ts:29` selects v1 immediately and `packages/app/src/context/server-session.ts:538–568` fetches legacy messages for v1. The parallel message responses are exercised by their own added HTTP test rather than the demonstrated owner flow. Removing the unused message routes/converter while retaining the current session list and other API endpoints with actual consumers is a sufficient smaller implementation, so the frozen planner requires Minimality to block. Test pagination through the actual legacy message route instead.

- **R2 correction after deletion experiment:** The initial recommendation was too broad. Removing the current session list made Home show zero rows instead of six: `packages/app/src/pages/home/home-sessions-controller.tsx:70` calls `ctx.sdk.client.v2.session.list` directly, even for a legacy server. The reviewer missed that direct consumer when tracing the compatible API. Retain `/api/session` list pagination and `currentSession`; the host reports that session/tool/scenario journeys pass with the unused current-message layer removed. This narrows the finding without accepting the corrective working tree.

- **Supporting evidence for R2:** The unused `currentMessage` converter also does not produce valid current schema shapes: text/reasoning items omit required IDs, tool times reuse legacy `start/end` instead of `created/ran/completed`, and pending/error tags differ from `packages/schema/src/session-message.ts`. Repairing an unrequested second protocol would add scope; removing it addresses the identified unnecessary implementation.

## Outcome and implementation boundary

- Read the original A-002 Ask, tracker, dispatch, frozen facts/plan, and notebook RUN/WIP records. The owner requested mock data to inspect detail in development. A dedicated populated launch with existing controls satisfies that request; an execution simulator or production timeline change is unnecessary.

- Inspected all ten changed files and the complete diff against `8f8460b9eb495eb24bc995f7830da1248dd27695`. Fixtures provide six sessions, Markdown/code, tool states, generated diffs, files, tasks, permission/question/error examples, and a preview provider. Bootstrap seeds missing preferences and opens populated history. The scenario strip enables exploration. Middleware supplies required reads and rejects namespace mutations. Launch/config/typecheck integration and focused tests support those behaviors; README describes operation and limits.

- The Vite plugin imports only for `command === "serve"` and demo mode. Browser bootstrap imports only under `DEV && MODE === "demo"`. Ordinary development configuration is preserved, and production does not activate mock middleware. The adapter changes only the demo's platform fetch, without replacing global fetch. Same-origin API paths receive `/__demo`; already-prefixed paths remain intact.

- Namespace handling leaves ordinary Vite routes untouched, rejects unknown mock routes, and never reads project files or proxies a backend. Mock mutations return 405. The legacy event stream supplies a connection event and heartbeat, clears its interval on response close, and allows cancellation. These controls work for the mock origin; R1 concerns requests that escape it.

## Checks, visual evidence, and limits

- Reused host/worker evidence: seven actual localhost HTTP tests passed with 48 assertions; three browser journeys passed in 5.6s against actual Vite middleware without route mocks; package typecheck passed. The production build passed and its emitted JavaScript contained none of the three checked fixture markers. Later fixture/label refinement did not alter the production exclusion boundary. No passing suite was repeated by the reviewer. The frozen source diff passes `git diff --check`.

- Independently inspected all six retained images: populated session with real diff code, permission request, question choices, failed tool, six-session home, and mobile. They support visible fixture detail, actual shared controls, and mobile reachability. Browser tests additionally switch all eleven designs and preserve the selected design on reload; they do not prove every possible UI state.

- Independently examined reuse/deletion: using the existing diff library and shared renderer is appropriate and avoids production changes. Deleting the scenario strip would hinder access to distinct detail examples. The broader session-layer deletion failed the populated-home check and was rejected. Deleting only the unused parallel message converter preserves the displayed outcome and removes malformed unsupported shapes, as described in R2.

- No new runtime dependency, protocol/server implementation, generated client, execution, or permission logic change was introduced. Added imports follow the repository's named-import rules. Untracked `BRAND_GUIDELINES.md` is unrelated owner work and was not reviewed as part of this change. Final factual STATUS/tracker/notebook and delivery records remain the host's post-review closeout.

- This review concerns exact commit f8bd9fa, even though the host began corrections after findings were sent. Corrective working-tree changes are not accepted by this report. The reviewer used the configured gpt-6.1-sol/high tier, the same model family and shared filesystem permissions; the source-edit restriction was instructed, not operating-system enforced. Only this report was written, with no source edits, server restarts, delegation, Agentflow invocation, staging, commits, or pushes.

Outcome: BLOCKING

Minimality: BLOCKING

Conformance: PASS

Verdict: BLOCKING

Self-check: Reviewed the exact frozen commit, all ten changed files, original Ask and required records, meaningful host evidence, and all six screenshots; identified a source-traced read-only boundary failure and a sufficient smaller implementation; distinguished passing preview checks from missing external-server coverage and pending corrections; wrote only review.md.
