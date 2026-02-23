**Cleanup Report**

- **Purpose:** Prepare repo for Vercel (frontend as root) by untracking generated and environment artifact files; preserve content under `elas-erp`; avoid deleting local copies — use `git rm --cached` and update `.gitignore`.
- **Rule:** Do NOT modify any files under `elas-erp`.
- **Stop Conditions:** If a tracked file looks like a real secrets file (non-example `.env`, keys, tokens) stop and escalate — do not remove it automatically.

Planned steps (submit for approval before execution):

1. Create branch: `git checkout -b chore/repo-cleanup`
2. Review tracked artifact list (see CLEANUP_TRACKED_ARTIFACTS.md). Confirm any `.env`/secret files.
3. Run untrack commands (examples):
   - `git rm --cached -r frontend/.next node_modules .venv venv` (adjust paths to actual tracked instances)
   - `git rm --cached frontend/.env.local backend/.env.local` (only after manual review)
4. Add recommended `.gitignore` entries and commit:
   - `git add .gitignore && git commit -m "chore: ignore build and env artifacts"`
5. Push branch and open PR for review before merging.

Recommended `.gitignore` additions:

```
# Python
.venv/
venv/
*.pyc
__pycache__/

# Node / Next
node_modules/
.next/
dist/
build/

# Environment
.env
.env.local
.env.*.local
.env.production
.env.development

# Tests / Coverage
coverage/
.coverage
.pytest_cache/

# OS
.DS_Store
```

Risks & notes:
- There are duplicate frontend files at both `frontend/` and `elas-erp/frontend/`. Do not change anything in `elas-erp/` — only operate on top-level `frontend/` when appropriate.
- Tracked `.env.example` and `.env.template` files are safe to keep; any non-example `.env` file must be inspected for secrets and handled manually.
- After cleanup, validate local dev start for frontend and backend, and confirm Vercel build (root=frontend).

Next: confirm you approve this plan and I will create the branch and perform the safe untrack commands listed above.
