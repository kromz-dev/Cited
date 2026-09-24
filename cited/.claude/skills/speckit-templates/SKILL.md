---
name: speckit-templates
description: GitHub Spec Kit document templates (constitution, feature spec, implementation plan, tasks, checklist) for spec-driven development. Use when writing a project constitution, a feature specification, a technical plan or a task breakdown and you want the Spec Kit structure.
---

# Spec Kit templates

Templates vendored from https://github.com/github/spec-kit (MIT). The Spec Kit CLI and its scripts are not installed; use the templates directly.

Workflow (Spec Kit order):
1. `templates/constitution-template.md`: project principles and quality gates, written once.
2. `templates/spec-template.md`: WHAT and WHY for a feature. User scenarios with acceptance criteria, functional requirements (FR-001…), key entities, success criteria. No implementation details. Mark unknowns as `[NEEDS CLARIFICATION: …]`.
3. `templates/plan-template.md`: HOW. Technical context, constitution check, data model, contracts, project structure.
4. `templates/tasks-template.md`: ordered, dependency-aware tasks (T001…), `[P]` for parallelisable ones, tests before implementation.
5. `templates/checklist-template.md`: requirement-quality checklist.

Read the relevant template in full before writing, keep its section order, delete sections that do not apply rather than leaving placeholders.
