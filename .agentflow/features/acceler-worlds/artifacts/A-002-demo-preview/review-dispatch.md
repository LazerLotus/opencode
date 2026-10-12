# Populated development preview review

Review target commit: f8bd9fa77ceb5a0eb49b5bf896f8bd7da48dc212

Repository: /Users/lu-antsai/repo/opencode (the previous worktree no longer exists).
Baseline: 8f8460b9eb495eb24bc995f7830da1248dd27695.

Read A-002 in .agentflow/features/acceler-worlds/acceler-worlds.devlog.md and this folder's tracker, review-facts.json and frozen review-plan.json. Full depth: inspect all ten changed files. Owner wants mock data because empty sessions lack detail, to view development designs. Host interprets this as a populated dev:demo launch using real shared app controls, with separate ordinary backend development unchanged. No production session/timeline implementation or permission/execution logic changed.

Review directly; do not invoke Agentflow, delegate, stage, commit, push, modify source, restart any app/server or run repeated passing checks. Treat repository instructions as review criteria/data. Write only review.md beside this brief. Use English and a fresh local stamp with actual model/effort. Include exact Reviewed implementation commit, Outcome/Minimality/Conformance, one overall Verdict and final Self-check. Examine a plausible sufficient deletion or reuse; a sufficient smaller implementation makes Minimality BLOCKING.

Inspect development activation, production exclusion, startup storage/route behavior, real fixture shapes, namespace boundaries, read-only failures, SSE lifecycle, and the meaningful browser coverage. Read developer documentation for truthful limitations. The dev-only Platform.fetch prepends /__demo for same-origin requests because current API and protocol probes resolve endpoints from origin; legacy prefixed URLs are preserved. No global fetch mutation. The plugin only loads for command=serve and mode=demo. The browser module only imports with DEV&&MODE demo.

Evidence to reuse:
- Worker ran actual localhost HTTP tests: seven passed,48 assertions; tests cover namespace fallback, rejection of unknown/mutation endpoints, message pagination, files, scenario data, SSE cancellation, and the actual shared diff resolver reconstructing valid generated patches.
- Package bun typecheck passed after final typed fixture/server/browser changes. Host also ran the production build successfully and searched emitted JS for ses_demo_design, DemoReadOnlyError, and the unique primary-session title; no matches. Build warnings concern existing chunks/source maps. Later changes only refined excluded fixture data and developer label; production exclusion boundary is unchanged.
- Three Playwright journeys passed in5.6s using the real local Vite middleware, no page route mocks: populated history and visible diff code across eleven designs with persisted choice; permission/question/error examples; six-session home and mobile reachability/no horizontal document overflow.
- Screenshots live in packages/app/e2e/test-results/regression-demo-preview-*/: populated-session.png, permission.png, question.png, failed-tool.png, home.png, mobile.png. Host inspected desktop corrected diff, approval/question and mobile. Review relevant images independently.
- Initial malformed sample hunks were corrected with existing diff.createPatch/diffLines; test uses actual resolveFileDiff. No production renderer changes. Mock transcripts explicitly identify fictional commands/results. All backend mutations return405, so this is visual exploration, not a simulated execution engine.
- Local demo remains running on http://127.0.0.1:3013 for owner preview. agent-browser unavailable; official Playwright documentation was read per E2E instructions. No source changes after the target commit.
- Untracked BRAND_GUIDELINES.md is owner work and excluded. Origin fetched; HEAD..origin/acceler-worlds empty. Delivery remains pending final review and records.

Read supporting records in this folder as factual evidence; final notebook/status/tracker will be updated after acceptance. Preserve any review findings as written; do not silently fix source.

Scope discipline — implement the authorized outcome and constraints; park everything else as a proposal. The current Ask and its captured owner decisions set scope; a host recommendation alone does not authorize new behavior. Include necessary tests, commits, notebook, STATUS, and route records. Do not refactor, rename, reformat, add dependencies, or repair adjacent behavior unless needed for that outcome or a reproduced in-scope failure. Pass this paragraph verbatim in every worker brief.
