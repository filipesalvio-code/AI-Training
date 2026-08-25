---
name: create-techspec
description: TechSpec — technical specification derived from an existing PRD. Use when the user asks for a TechSpec or the architecture of a feature that already has a PRD in `tasks/prd-*/prd.md`. Do not use without a PRD (create-prd) or to break work into tasks (create-tasks).
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder under `./tasks/prd-*/`. The required PRD is `tasks/prd-[slug]/prd.md`; if it is missing, stop and point to `/create-prd`.

The TechSpec defines the architecture, components, contracts, and tests for the solution. The problem, goals, and scope already live in the PRD; reference it instead of repeating that information. Specify without implementing: include code only in the template's interface examples. Prefer a simple, evolvable architecture with clear interfaces.

## Flow

1. **Analyze the PRD** — read it fully; extract requirements, acceptance criteria, constraints, and success metrics.
   **Done when:** requirements, acceptance criteria, constraints, and success metrics are identified.

2. **Explore the project** — read `AGENTS.md` and every rule in `.agents/rules/`; use the Explore agent before asking the user anything. Examine affected files and modules, interfaces and integration points, callers and callees, configuration, persistence, error handling, existing tests, and infrastructure. Decide whether to reuse existing libraries or build something new. Research library docs and open business rules on the web.
   **Done when:** you can name each new or modified component and where it fits in the current code.

3. **Clarify** — ask the user questions with `AskUserQuestion` before drafting. Focus on what exploration did not clarify: domain boundaries, data flow and contracts, external dependencies (failure modes, timeouts, and idempotency), main interfaces, and critical test scenarios.
   **Done when:** every question has an explicit answer or assumption.

4. **Draft** — read this skill's `./references/TEMPLATE.md` in full and follow its structure exactly. Under “Compliance with AGENTS.md and rules”, confirm you read `AGENTS.md` and every rule in `.agents/rules/`. Under “Compliance with skills”, check only the applicable project skills in `.agents/skills/` and record deviations with justification. Under “Test approach”, define applicable cases named and identified by layer (`TU-*` for unit, `TI-*` for integration, and `E2E-*` for E2E), mapping each case to the acceptance criteria it verifies. When there is a coverage goal, use the one defined in `AGENTS.md` or the project rules.
   **Done when:** every template section is filled and each component from step 2 is specified.

5. **Save and report** — write the document to `tasks/prd-[slug]/techspec.md` and report the path with a one-line summary.
