---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans
---

# Using Git Worktrees

Source: obra/superpowers (290k+ stars).

For Cited, prefer a short-lived branch on the same clone:

```bash
git fetch origin && git checkout main && git pull
git checkout -b feat/t0XX-sujet
```

Use a worktree only if two tasks must run in parallel:

```bash
git worktree add ../Cited-t0XX feat/t0XX-sujet
```
