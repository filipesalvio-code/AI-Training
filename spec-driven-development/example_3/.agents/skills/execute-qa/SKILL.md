---
name: execute-qa
description: "QA — validate and stabilize an implemented feature against the PRD, TechSpec, and tasks: unit, integration, and E2E tests with the available browser tool, accessibility, responsiveness, bug fixes, and a final report with evidence. Use when the user asks to run QA. Do not use to implement new tasks or to review code (execute-review)."
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder under `./tasks/prd-*/`. Read the project `AGENTS.md`. Under `tasks/prd-[slug]/`, read `prd.md`, `techspec.md`, and `tasks.md`; generate and maintain `qa.md` with defects, fixes, regression tests, and evidence. Save all browser-tool evidence under `tasks/prd-[slug]/evidences/`.

QA is **PASSED** only when every PRD acceptance criterion has been verified and is met. If you find bugs, fix them at the root cause, add regression tests, and re-validate. For UI flows, use the browser tool available in the environment, such as Playwright MCP, Vercel Agent Browser, or an equivalent tool.

## Flow

1. **Analyze** — read `AGENTS.md`, every rule in `.agents/rules/`, the PRD, the TechSpec, and each task file; build a checklist with one verification item per acceptance criterion (`CA-*`) and associate the matching test cases (`TU-*`, `TI-*`, and `E2E-*`).
   **Done when:** there is a verification item and at least one associated test case for every PRD acceptance criterion.

2. **Prepare the environment** — start the services needed for validation in an isolated worktree environment. Use an available port in the `30**` range (for example `3000–3099`) for the backend, an available port in the `51**` range (for example `5100–5199`) for the frontend, and a dedicated range for each extra database or service. Check each port before starting the process; if it is busy, choose another within the range. Configure URLs between services, record ports and started processes, and open the app with the available browser tool.
   **Done when:** required services respond, the home page is loaded, and the URLs and ports used are recorded.

3. **Test each flow (E2E)** — for each acceptance criterion with a UI flow, run the matching E2E case with the available browser tool and verify the expected result in application state. When behavior is unexpected, investigate UI state, browser console messages, API requests and responses, and backend logs before logging or fixing the bug. Capture visual evidence, save it under `tasks/prd-[slug]/evidences/`, mark the result as PASSED or FAILED, and record each failure in `qa.md`.

   **Done when:** every acceptance criterion with a UI flow is marked PASSED or FAILED, with evidence.

4. **Run TechSpec test cases** — run the unit (`TU-*`) and integration (`TI-*`) cases associated with acceptance criteria, when applicable, using the commands defined in `AGENTS.md` and the applicable rules. When the project defines a coverage goal, verify it with the stack's available mechanisms and record the result in `qa.md`. Also record each case result in the checklist and each failure in `qa.md`.
   **Done when:** all associated unit and integration cases have been run or are explicitly blocked.

5. **Check accessibility** — on each screen, use the available browser tool to test keyboard navigation and verify labels and semantics:
   - [ ] Keyboard navigation (Tab, Enter, Esc)
   - [ ] Interactive elements with descriptive labels
   - [ ] Images with appropriate alternative text (`alt`)
   - [ ] Adequate color contrast
   - [ ] Forms with labels associated to fields
   - [ ] Clear, accessible error messages
   - [ ] Appropriate font sizes

   **Done when:** each item has been verified on each screen.

6. **Check visual and responsiveness** — capture the main screens, save them under `tasks/prd-[slug]/evidences/`, cover states (empty, with data, and error) and main breakpoints, and document inconsistencies.
   **Done when:** main states and breakpoints are captured and inconsistencies are documented.

7. **Fix found bugs** — for each bug recorded in `qa.md`:
   - locate and fix the root cause, without masking the symptom;
   - create a regression test that fails without the fix;
   - record in `qa.md` the status, applied fix, and created test;
   - if the fix requires changing the PRD, TechSpec, or scope, stop and ask the user for a decision.

   **Done when:** each bug in `qa.md` has a fix and a regression test, or is explicitly blocked by a user decision.

8. **Re-validate** — repeat failed flows, run regression tests, and re-check affected acceptance criteria. If any validation fails, return to step 7.
   **Done when:** every acceptance criterion is marked PASSED, with no unresolved bugs.

9. **Report** — generate `qa.md` following this skill's `./references/TEMPLATE.md`, including fixed bugs, regression tests, and final evidence.
   **Done when:** `qa.md` is generated from the template and updated with final results.

10. **Shut down the environment** — stop every service started by this run, terminate processes gracefully, and confirm that ports, temporary databases, containers, and other resources were released. Do not stop processes belonging to another worktree or the user. Perform this cleanup even if QA is interrupted, blocked, or failed.
