# Quick Workflow Setup (Copy & Paste Version)

Copy this entire block and paste it to Claude Code in a new project:

```
Create a complete development workflow system with these components:

1. Create `.claude/commands/` directory with these slash commands:
- /project-init: Initialize project context
- /start-feature: Begin new feature with plan.md and tasks.md
- /test-feature: Create test plan and run tests
- /complete-feature: Finalize and archive feature
- /sync-dev-docs: Sync documentation between files
- /next: Intelligently determine next action
- /warmup: Quick status refresh
- /sprint-status: Show progress
- /commit-smart: Smart git commits
- /workflow-state: Manage state
- /debug: Troubleshooting

2. Create `.workflow-state.json` (git-ignored) with:
{
  "current_sprint": 0,
  "current_feature": null,
  "phase": "not_started",
  "tasks_completed": 0,
  "tasks_total": 0,
  "workflow_position": {
    "last_command": null,
    "last_command_at": null,
    "next_suggested": "/project-init",
    "initialized": false
  },
  "features_completed": [],
  "last_sync_at": null,
  "last_commit_at": null,
  "environment": {
    "nextjs": false,
    "dependencies": false,
    "supabase": false,
    "env_file": false
  }
}

3. Make commands auto-update state:
- /project-init: Sets initialized=true
- /start-feature: Sets current_feature and phase="development"
- /test-feature: Sets phase="testing"
- /complete-feature: Clears feature, sets phase="between_features"
- /sync-dev-docs: Updates task counts
- /next: Reads state and suggests next action

4. Create this structure:
/development-docs/[feature]/
  - plan.md (planning)
  - tasks.md (checklist)
  - test-plan.md (test scenarios)
  - test-results.md (outcomes)
  - pr-summary.md (summary)

5. Feature workflow:
/start-feature → development → /test-feature → testing → /complete-feature → next

6. Make /next intelligent:
- Not initialized? → /project-init
- No feature? → /start-feature [next]
- All tasks done? → /test-feature
- Tests pass? → /complete-feature
- Otherwise → continue current work

Create all files with full implementation. Each command should update .workflow-state.json automatically. Add .workflow-state.json to .gitignore.
```