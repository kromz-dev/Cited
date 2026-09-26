---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work
---

# Finishing a Development Branch

Source: obra/superpowers (290k+ stars).

**Cited workflow:** `feat/t0XX-<sujet>` from `main` → CI green → PR → humain merge. Do not merge yourself.

1. Run `cd cited && npx tsc --noEmit && npx eslint . && npx vitest run`.
2. If red, stop. Do not open the PR.
3. Open a PR against `main` with a one-line title matching the task id.
4. Wait for GitHub Actions `CI` on `.github/workflows/ci.yml`.
5. Do not delete the branch until the human merges.
