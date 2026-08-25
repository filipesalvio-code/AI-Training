---
name: create-tasks
description: Tasks — break a feature into implementation tasks from the existing PRD and TechSpec under `tasks/prd-*/`. Use when the user asks to decompose a feature into tasks or to plan its execution. Do not use to write the PRD (create-prd) or the TechSpec (create-techspec).
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder under `./tasks/prd-*/`. Required files are `tasks/prd-[slug]/prd.md` and `tasks/prd-[slug]/techspec.md`; if either is missing, stop and point to the matching skill (`/create-prd` or `/create-techspec`).

Each task is an **incremental delivery** with clear scope, explicit dependencies, and its own tests. Reference the PRD acceptance criteria and use the TechSpec test cases as the source of truth for task tests. Reference `techspec.md` instead of repeating implementation details.

## Flow

1. **Analyze** — read `AGENTS.md`, every rule in `.agents/rules/`, the PRD, and the TechSpec; inventory requirements, acceptance criteria (`CA-*`), technical decisions, components, and every test case defined in the TechSpec. Identify skills in `.agents/skills/` that apply to each task.
   **Done when:** the inventory of criteria and test cases is complete and applicable skills per task are identified.

2. **Propose the structure** — build a high-level task list, preferably with at most 10 items. List dependencies before the tasks that depend on them, such as backend before frontend when the frontend depends on it, and both before E2E tests. Show the list to the user for approval before generating any file.
   **Done when:** the user approves the list.

3. **Generate the files** — under `./tasks/prd-[slug]/`:
   - `tasks.md` following this skill's `./references/TEMPLATE_TASKS.md`
   - one `task_[num].md` file per task, following this skill's `./references/TEMPLATE_TASK.md`. Use sequential numbers starting at 1 (`task_1.md`, `task_2.md`, …) and include subtasks (`[num].1`, `[num].2`, …), references to acceptance criteria (`CA-*`), and tests matching the TechSpec cases
     **Done when:** every acceptance criterion and test case from the inventory is mapped into one or more tasks, and each task's tests match the TechSpec cases.

4. **Report** — present the generated files and wait for user confirmation before starting any implementation.
