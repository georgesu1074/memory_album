# /sync-dev-docs

Synchronize development documentation based on current progress.

## Usage
```
/sync-dev-docs [context]
```

## Contexts
- `feature-start` - When starting a new feature
- `task-complete` - After completing tasks
- `test-results` - After running tests
- (none) - Auto-detect what needs syncing

## Implementation

### 1. Auto-Detection (no context provided)
```
1. Check for active feature folder in /development-docs/
2. Compare tasks.md with development-plan.md
3. Count completed tasks since last sync
4. Check for missing required files
5. Execute appropriate sync action
```

### 2. Feature Start (`feature-start`)
```
1. Read development-plan.md
2. Find epic matching current feature
3. Create plan.md template first (high-level planning)
4. Extract all tasks under that epic guided by plan
5. Create tasks.md with checkbox format:
   - [ ] Task 1
   - [ ] Task 2
6. Cross out tasks in development-plan.md:
   - ~~[ ] Task 1~~
   - ~~[ ] Task 2~~
7. Create .sync-status file with timestamp
```

### 3. Task Complete (`task-complete`)
```
1. Read tasks.md in active feature folder
2. Count checked vs unchecked tasks
3. Update development-plan.md with same check status
4. Update .sync-status with:
   - last_sync: timestamp
   - tasks_completed: count
   - tasks_remaining: count
5. If all tasks complete, suggest /test-feature
```

### 4. Test Results (`test-results`)
```
1. Read test-results.md
2. Parse test outcomes
3. Update development-plan.md with test status
4. If tests pass, prepare for completion
5. If tests fail, highlight fixes needed
```

## File Operations

### Creating plan.md (First)
```markdown
# [Feature Name] Implementation Plan

## Overview
[Auto-filled from epic description]

## Technical Approach
[To be filled during development]

## Key Decisions
- 

## Dependencies
- 

## Notes
- 
```

### Creating tasks.md (After plan.md)
```markdown
# [Feature Name] Tasks

Extracted from Sprint [X]: [Epic Name]

## Tasks
- [ ] Task 1 description
- [ ] Task 2 description
- [x] Task 3 description (if completed)

## Progress
Completed: X/Y (XX%)
Last sync: [timestamp]
```

### Updating development-plan.md
```markdown
### Epic: [Name]
- ~~[ ] Moved task~~ → [feature-name]
- ~~[x] Completed moved task~~ → [feature-name]
- [ ] Unmoved task (still in plan)
```

### Sync Status File (.sync-status)
```json
{
  "feature": "memory-submission",
  "last_sync": "2024-01-15T10:30:00Z",
  "tasks_total": 10,
  "tasks_completed": 6,
  "tasks_moved": 10,
  "phase": "development",
  "test_status": null
}
```

## Output Examples

**Feature Start:**
```
📋 Syncing docs for feature: memory-submission
✓ Created tasks.md with 10 tasks
✓ Created plan.md template
✓ Crossed out tasks in development-plan.md
✓ Ready to begin development
```

**Progress Update:**
```
📊 Syncing progress...
✓ 6/10 tasks complete (60%)
✓ Updated development-plan.md
✓ 4 tasks remaining
✓ Last sync: 5 minutes ago
```

**Test Phase:**
```
🧪 Syncing test results...
✓ 8/10 tests passing
✗ 2 tests failing:
  - Photo upload on iOS Safari
  - Character counter validation
✓ Updated test-results.md
⚠️ Fix failing tests before completion
```

**Completion Ready:**
```
✅ Feature ready for completion!
✓ All tasks complete
✓ All tests passing
✓ Documentation synced
→ Run /complete-feature memory-submission
```

## Important Rules

1. **Never modify /docs/ folder** - Only /development-docs/
2. **Preserve formatting** - Maintain markdown structure
3. **Bidirectional sync** - Changes flow both ways
4. **Atomic operations** - All or nothing updates
5. **Track everything** - Maintain .sync-status for state

## Error Handling

- Missing development-plan.md → Error: "No development plan found"
- No active feature → Suggest: "Run /start-feature first"
- Conflicts detected → Prompt: "Manual resolution needed"
- Invalid feature name → List valid features from mapping