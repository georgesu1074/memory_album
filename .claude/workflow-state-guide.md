# Workflow State Management Guide

## Overview
The `.workflow-state.json` file tracks the current position in the development workflow, enabling intelligent command suggestions and automatic state recovery. This guide explains how the state system works and how slash commands interact with it.

## State Structure

```json
{
  "current_sprint": 0,                    // Sprint number from development-plan.md
  "current_feature": null,                // Active feature name (e.g., "memory-submission")
  "phase": "not_started",                 // Current phase: not_started | development | testing | between_features
  "tasks_completed": 0,                   // Tasks checked [x] in current feature
  "tasks_total": 0,                       // Total tasks in current feature
  "workflow_position": {
    "last_command": null,                 // Last slash command executed
    "last_command_at": null,               // ISO timestamp of last command
    "next_suggested": "/project-init",    // What /next should recommend
    "initialized": false                  // Has /project-init been run?
  },
  "features_completed": [],               // List of completed feature names
  "last_sync_at": null,                  // When /sync-dev-docs last ran
  "last_commit_at": null,                // When /commit last ran
  "environment": {
    "nextjs": false,                      // Is Next.js initialized?
    "dependencies": false,                 // Are node_modules installed?
    "supabase": false,                    // Is Supabase configured?
    "env_file": false                     // Does .env.local exist?
  }
}
```

## Command Categories

### 1. State-Modifying Commands
These commands actively update the workflow state:

| Command | Updates | When to Use |
|---------|---------|-------------|
| `/project-init` | Sets initialized=true, updates environment | Start of new session |
| `/start-feature` | Sets current_feature, phase="development" | Begin new feature |
| `/test-feature` | Sets phase="testing" | After development complete |
| `/complete-feature` | Clears current_feature, adds to features_completed | After testing passes |
| `/sync-dev-docs` | Updates tasks_completed, last_sync_at | During development |
| `/commit` | Updates last_commit_at | When committing code |
| `/next` | Updates next_suggested | After any major action |

### 2. State-Reading Commands
These commands read but don't modify state:

| Command | Reads | Purpose |
|---------|-------|---------|
| `/warmup` | All state | Quick status overview |
| `/sprint-status` | Sprint & task progress | Detailed progress report |
| `/workflow-state` | Full state | Debug/manage state |

### 3. Independent Commands
These operate without state tracking:

| Command | Purpose |
|---------|---------|
| `/debug` | Troubleshooting issues |
| `/optimize-workflow` | Analyze workflow patterns |

## State Transitions

The workflow follows these key transitions:

```
[Not Started] 
    ↓ /project-init
[Initialized]
    ↓ /start-feature
[Development]
    ↓ /test-feature
[Testing]
    ↓ /complete-feature
[Between Features]
    ↓ /start-feature (next)
[Development] ...
```

## Phase Definitions

### `not_started`
- Fresh project, no initialization
- Next: `/project-init`

### `development`
- Active feature being built
- Has current_feature set
- Tracking tasks_completed/tasks_total
- Next: Continue tasks or `/test-feature`

### `testing`
- Feature complete, running tests
- test-plan.md exists
- Next: Fix failures or `/complete-feature`

### `between_features`
- No active feature
- Last feature completed
- Next: `/start-feature` for next feature

## How Commands Update State

### `/project-init`
```javascript
{
  "workflow_position": {
    "last_command": "/project-init",
    "last_command_at": "2024-01-15T10:30:00Z",
    "next_suggested": "/warmup",
    "initialized": true
  },
  "environment": {
    "nextjs": true,  // If detected
    "dependencies": true,  // If node_modules exists
    "supabase": false,
    "env_file": false
  }
}
```

### `/start-feature memory-submission`
```javascript
{
  "current_feature": "memory-submission",
  "phase": "development",
  "tasks_total": 10,  // From extracted tasks
  "tasks_completed": 0,
  "workflow_position": {
    "last_command": "/start-feature",
    "last_command_at": "2024-01-15T10:35:00Z",
    "next_suggested": "continue development"
  }
}
```

### `/sync-dev-docs`
```javascript
{
  "tasks_completed": 6,  // Counted from [x] in tasks.md
  "last_sync_at": "2024-01-15T11:00:00Z",
  "workflow_position": {
    "last_command": "/sync-dev-docs",
    "next_suggested": "continue task 7"  // If tasks remain
    // OR
    "next_suggested": "/test-feature"  // If all complete
  }
}
```

### `/test-feature`
```javascript
{
  "phase": "testing",
  "workflow_position": {
    "last_command": "/test-feature",
    "last_command_at": "2024-01-15T14:00:00Z",
    "next_suggested": "/complete-feature"  // If tests pass
    // OR
    "next_suggested": "fix failing tests"  // If tests fail
  }
}
```

### `/complete-feature`
```javascript
{
  "current_feature": null,
  "phase": "between_features",
  "tasks_completed": 0,
  "tasks_total": 0,
  "features_completed": ["memory-submission"],  // Appended
  "workflow_position": {
    "last_command": "/complete-feature",
    "last_command_at": "2024-01-15T15:00:00Z",
    "next_suggested": "/start-feature ai-categorization"
  }
}
```

## The `/next` Command Logic

The `/next` command uses state to determine the appropriate action:

```javascript
function determineNextAction(state) {
  // Not initialized
  if (!state.workflow_position.initialized) {
    return "Run /project-init to initialize project";
  }
  
  // Check staleness (> 2 hours old)
  if (isStale(state.workflow_position.last_command_at)) {
    return "Run /warmup to refresh context";
  }
  
  // Between features
  if (state.phase === "between_features" || !state.current_feature) {
    const next = getNextFeature(state.features_completed);
    return `Run /start-feature ${next}`;
  }
  
  // In development
  if (state.phase === "development") {
    if (state.tasks_completed === state.tasks_total) {
      return "Run /test-feature";
    }
    if (needsSync(state.last_sync_at, state.tasks_completed)) {
      return "Run /sync-dev-docs";
    }
    return "Continue with next task";
  }
  
  // In testing
  if (state.phase === "testing") {
    return "Complete testing, then /complete-feature";
  }
}
```

## State Recovery

If state becomes inconsistent, `/workflow-state recover` will:

1. **Scan file system** for actual state
2. **Check development-docs** for active features
3. **Count completed tasks** in tasks.md files
4. **Detect environment** from package.json, node_modules, etc.
5. **Rebuild state** from ground truth

## Manual State Validation

Run `/workflow-state validate` as extra protection to ensure:
- Current feature folder exists if claimed
- Task counts match actual files
- Environment flags match reality
- No impossible state combinations

## Best Practices

1. **Let commands update state automatically** - Don't manually edit
2. **Use `/workflow-state validate`** periodically for safety
3. **Run `/workflow-state recover`** if things seem off
4. **Check `/warmup`** after breaks to see current state
5. **Trust `/next`** for workflow guidance

## State File Location

The state file lives at:
```
/Users/georgesu/projects/memory_album/.workflow-state.json
```

It's intentionally not in `.claude/` so it persists across sessions and is easily accessible.

## Debugging State Issues

If state seems wrong:

1. Run `/workflow-state show` to see current state
2. Run `/workflow-state validate` to check consistency
3. Run `/workflow-state recover` if validation fails
4. Manually check the JSON file if needed
5. Run `/workflow-state reset` as last resort

## Integration with TodoWrite

The TodoWrite tool and workflow state work together:
- TodoWrite tracks individual task details
- Workflow state tracks overall progress
- `/sync-dev-docs` bridges them by updating task counts

This dual system provides both granular task tracking and high-level workflow position.