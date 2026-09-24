---
name: resolving-merge-conflicts
description: Use when you need to resolve an in-progress git merge/rebase conflict.
---

# Resolving Merge Conflicts

Source: mattpocock/skills (268k+ stars).

1. See the current state of the merge/rebase. Check git history and the conflicting files.
2. Find the primary sources for each conflict. Read commit messages and PRs.
3. Resolve each hunk. Preserve both intents where possible. Never invent new behaviour. Always resolve; never `--abort` unless the human asks.
4. Run `cd cited && npx tsc --noEmit && npx vitest run`.
5. Stage everything and commit / `git rebase --continue`.
