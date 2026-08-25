---
name: execute-task
description: Task — identify and implement the next task for a feature from the PRD, TechSpec, and tasks.md, marking it complete at the end. Use when the user asks to execute, implement, or start a task/subtask, or to continue implementing a feature. Do not use to review (execute-review) or QA-validate (execute-qa) what is already implemented.
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder under `./tasks/prd-*/`. Required files under `tasks/prd-[slug]/` are `prd.md`, `techspec.md`, and `tasks.md`; if any is missing, stop and point to the matching skill (`/create-prd`, `/create-techspec`, or `/create-tasks`).

A task is an **incremental delivery** with explicit dependencies and its own tests. Implement all subtasks and move from plan to implementation as soon as the approach is clear. Reference `techspec.md` instead of repeating implementation details.

## Flow

1. **Select the task** — identify the next unfinished task in `tasks.md`; open the matching `task_[num].md` and read its definition, subtasks (`[num].1`, `[num].2`…), related acceptance criteria, and tests.
   **Done when:** the next task and all of its subtasks are identified.

2. **Prepare** — read `AGENTS.md` and every rule in `.agents/rules/`; review PRD context and TechSpec requirements for the task; understand dependencies from earlier tasks; load only applicable project skills from `.agents/skills/` and look up library docs on the web when needed.
   When the task requires running the application, prepare an isolated worktree environment: use an available port in the `30**` range (for example `3000–3099`) for the backend, an available port in the `51**` range (for example `5100–5199`) for the frontend, and a dedicated range for each extra database or service. Check each port before starting the process; if it is busy, choose another within the range. Configure URLs between services, record ports and started processes, and start only the required services.
   **Done when:** the approach is clear, `AGENTS.md` and all rules have been consulted, applicable skills are loaded, and required services are available.

3. **Implement** — implement each subtask in order; at the end, run the task's validations and tests using the commands defined in `AGENTS.md` and the applicable rules.
   **Done when:** every subtask is implemented and the applicable validations and tests for the task pass.

4. **Complete and clean up** — mark all subtasks and applicable tests as done (`[x]`) in `task_[num].md`. Then mark the task as done (`[x]`) in `tasks.md`, report in one line what was implemented, and shut down every service started by this run. Stop processes gracefully, confirm ports were released, and do not stop processes belonging to another worktree or the user. Perform this cleanup even if the run is interrupted or blocked.
   **Done when:** all subtasks and applicable tests are marked in the task file, and the task is marked complete in `tasks.md`.
