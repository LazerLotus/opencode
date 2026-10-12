# Tracker

## Identity

- **Work key:** A-002-demo-preview.
- **Active Ask:** A-002.
- **Goal:** A populated development preview using the real shared app and eleven designs.
- **Last update:** 2026-10-12 16:16:00 +0800.
- **Evidence commit:** 7df6688f718f9bfc4441390dacd945d77fdbc879.

## Overall state

- **State:** complete.
- **Reason:** Source, validation and independent review passed; record delivery is the closeout transaction.
- **Total:** 3.
- **Completed:** 3.
- **Remaining:** 0.

## Accepted task checklist

- [x] **T-1:** Add deterministic rich demo sessions, tool activity, diffs, files, tasks and permission/question examples in packages/app/dev/demo-data.ts and demo-server.ts. Dev middleware owns only /__demo requests, never proxies a real backend; unsupported mutations return explicit errors. Verify API bodies and populated controls. Proof: six actual HTTP tests and browser scenarios passed; final diff rendering regression remains in T-3. Source: A-002 request for mocking data and session details.
- [x] **T-2:** Add a dedicated dev:demo launch and first-open session through packages/app/package.json, vite.config.ts, src/entry.tsx and dev/demo-browser.ts. Use dedicated localhost port for storage, preserve persisted choices, exclude mocks from production builds. Document launch and limits in dev/README.md. Proof: first-open browser journey, package typecheck, production build and absence of fixture markers in emitted JS. Source: A-002 open the dev version with details.
- [x] **T-3:** Verify actual browser first launch, populated messages/review/files, design switching, additional scenarios and production exclusion. Run package typecheck and focused tests; review exact commit, then deliver source and this stream records. Fix only in-scope failures. Proof: exact commit 7df6688f718f9bfc4441390dacd945d77fdbc879 accepted by final independent review; seven HTTP tests, four browser outcomes, typecheck and production build/exclusion evidence. Source: A-002 and active Agentflow workflow.

## Accepted scope changes

- None.

## Current recovery

- **Current item:** none.
- **Last proven result:** Seven HTTP tests (49 assertions), package typecheck, four browser journeys and production build passed. External API guard verified; necessary Home session-list route retained after deletion experiment. Production JS contains none of the checked fixture identifiers.
- **Active blocker or running process:** none.
- **Next safe action:** none.
- **Expected changed files:** packages/app/dev/demo-data.ts; packages/app/dev/demo-server.test.ts; packages/app/dev/demo-server.ts; packages/app/dev/demo-browser.ts; packages/app/dev/README.md; packages/app/package.json; packages/app/vite.config.ts; packages/app/tsconfig.json; packages/app/src/entry.tsx; packages/app/e2e/regression/demo-preview.spec.ts; this stream notebook and A-002 artifacts.

## Completion proof

- **All accepted tasks checked:** yes.
- **Blocking accepted decision:** none.
- **Operation running:** no.
- **Next action remaining:** none.
- **Evidence status:** complete.
- **Judgment:** complete.

## Update meaning

- Saving this tracker is a recovery checkpoint, not a stop signal.
- Work continues with the next unfinished item unless an independent stop condition applies.
