---
name: execute-review
description: Code review — review and stabilize feature code for compliance with project rules, adherence to the TechSpec and tasks and tests, with a final report and verdict. Use when the user asks to review code, run a code review, validate rule compliance, or fix problems found during review. Do not use to validate behavior in QA (execute-qa) or to implement new tasks.
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder under `./tasks/prd-*/`. Read the project `AGENTS.md`. Under `tasks/prd-[slug]/`, read `techspec.md` and `tasks.md`; consult `prd.md` only when needed to clarify a requirement. Generate `codereview.md` in the same folder.

Check project rules and the TechSpec before pointing out any problem. Run the tests and validations required in `AGENTS.md` before recording the verdict; the review may be **PASSED** only when all applicable tests pass.

## Flow

1. **Analyze** — read `AGENTS.md`, every rule in `.agents/rules/`, the TechSpec (expected architecture), and the tasks (implemented scope). Load only applicable project skills from `.agents/skills/`.
   **Done when:** expected architecture, scope, rules, and applicable skills are clear.

2. **Rule compliance** — check each change against the applicable project rules in `.agents/rules/`. Record each violation and the matching rule.
   **Done when:** every change has been checked against the applicable rules.

3. **TechSpec adherence** — compare the implementation with the specification:
   - [ ] Architecture as specified
   - [ ] Components, interfaces, and contracts as defined
   - [ ] Data models as documented
   - [ ] Endpoints/APIs and integrations, when applicable, as specified

   **Done when:** each TechSpec decision is confirmed as implemented or recorded as a justified deviation.

4. **Task completeness** — for each task marked complete, verify that the code was implemented, related acceptance criteria are tracked, subtasks were finished, and the task's tests are present. Functional validation of criteria remains QA's responsibility.
   **Done when:** each task marked complete meets those four points.

5. **Tests** — read the test, validation, build, and coverage commands defined in `AGENTS.md` and run the applicable commands inside each affected app. If a command requires a running application, prepare an isolated worktree environment: use an available port in the `30**` range (for example `3000–3099`) for the backend, an available port in the `51**` range (for example `5100–5199`) for the frontend, and a dedicated range for each extra database or service. Check each port before starting the process; if it is busy, choose another within the range. Configure URLs between services, record ports and started processes, and do not assume commands or tools that are not defined in the project.
   **Done when:** all applicable commands defined in `AGENTS.md` have been run, with tests passing and minimum coverage respected when applicable.

6. **Fix and re-validate** — for each problem found:
   - fix the root cause and adjust or create the needed tests;
   - if the fix requires changing the PRD, TechSpec, or scope, record the problem as a blocker and ask the user for a decision;
   - run the tests again and repeat the relevant checks.

   **Done when:** there are no blocking problems and the relevant tests and checks have been re-run.

7. **Report** — generate `codereview.md` following this skill's `./references/TEMPLATE.md`, with the verdict:
   - **PASSED** — criteria met, tests passing, code compliant with rules and TechSpec.
   - **PASSED WITH RESERVATIONS** — main criteria met; recommended improvements are not blocking.
   - **FAILED** — failing tests, serious standard violation, lack of TechSpec adherence, or a security issue.

   **Done when:** `codereview.md` is saved from the template with the verdict recorded.

8. **Shut down the environment** — stop every service started by this run, terminate processes gracefully, and confirm that ports, temporary databases, containers, and other resources were released. Do not stop processes belonging to another worktree or the user. Perform this cleanup even if the review is interrupted, blocked, or failed.
