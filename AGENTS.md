<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commit Convention

All commits must be atomic — each commit should represent a single logical change, with all related files staged together and unrelated changes kept separate.

## Bug Fix Workflow

When asked to fix something in the app that doesn't have a GitHub issue:

1. **Log an issue** — create a GitHub issue describing the problem
2. **Investigate** — find the root cause and post a detailed findings comment on the issue
3. **Implement** — apply the fix in code
4. **Confirm** — ask the user to confirm the fix works before committing
5. **Commit** — only commit after user confirmation, with the issue number in the message
6. **Close** — close the issue with a commit reference

If an issue already exists, follow the same methodology: investigate, post findings, implement, confirm, commit, close.
