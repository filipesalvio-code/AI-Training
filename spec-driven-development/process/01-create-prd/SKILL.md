---
name: create-prd
description: PRD — Product Requirements Document. Use when the user asks for a PRD or wants to define requirements and scope for a new feature or product (first step in the PRD → TechSpec → tasks flow). Do not use for technical specifications (create-techspec) or to break requirements into tasks (create-tasks).
argument-hint: --prompt "feature description"
---

The PRD defines the problem, goals, expected outcomes, constraints, and scope. Goals and outcomes must have measurable criteria. Implementation details — such as architecture and code — belong in the TechSpec and stay out of the PRD.

## Workflow

1. **Clarify** — ask the user questions with `AskUserQuestion` before drafting:
   - Problem to solve and measurable goals
   - Primary users, user stories, and main flows
   - Core features: inputs, outputs, and actions
   - Out-of-scope items and dependencies
   - UI/UX and accessibility guidelines

   For domain-specific business rules, research on the web instead of asking the user.
   **Done when:** every template section has a recorded answer or assumption.

2. **Draft** — read this skill's `./references/TEMPLATE.md` in full and follow its structure exactly.
   **Done when:** every template section is filled with feature- or product-specific information.

3. **Save and report** — write the document to `./tasks/prd-[slug]/prd.md`, using a kebab-case feature slug. Report the path with a one-line summary.
