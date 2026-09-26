---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs
---

# Verification Before Completion

Source: obra/superpowers (290k+ stars).

No completion claim without a fresh local run:

```bash
cd cited
npx prisma validate
npx tsc --noEmit
npx eslint .
npx vitest run
```

Paste the command output. If CI is the evidence, link the green run.
