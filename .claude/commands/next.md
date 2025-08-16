# /next

Automatically determine and execute the next action in the development workflow.

## Usage
```
/next
```

## Implementation

```
START
  ↓
[Read development-plan.md]
  ↓
[Check /development-docs/ for active features]
  ↓
Any feature folders exist with incomplete tasks?
  ├─ NO → [Find next uncompleted epic in development-plan.md]
  │        ↓
  │        Found epic? 
  │        ├─ YES → Execute: /start-feature [name]
  │        └─ NO → "🎉 All features complete! Run /deploy-check"
  │
  └─ YES → [Read [feature]/tasks.md]
           ↓
           More than 3 tasks completed since last sync?
           ├─ YES → Execute: /sync-dev-docs
           └─ NO → Continue
                   ↓
           All tasks have [x]?
           ├─ NO → [Find next unchecked task]
           │        ↓
           │        [Start working on task]
           │        ↓
           │        [Update TodoWrite]
           │        ↓
           │        Output: "Working on: [task description]"
           │
           └─ YES → [Check for test-plan.md]
                    ↓
                    test-plan.md exists?
                    ├─ NO → Execute: /test-feature [current-feature]
                    └─ YES → [Check test-results.md]
                             ↓
                             All tests passed?
                             ├─ NO → Output: "Fix failing tests in test-results.md"
                             └─ YES → [Check for pr-summary.md]
                                      ↓
                                      pr-summary.md exists?
                                      ├─ NO → Execute: /complete-feature [current-feature]
                                      └─ YES → [Move to next feature]
                                               ↓
                                               Execute: /next (recursive)
```

## Output Examples

**Starting new feature:**
```
📦 Starting new feature: memory-submission
Creating /development-docs/memory-submission/
Extracting 10 tasks from Sprint 2
Run /next to begin first task
```

**Continuing work:**
```
⚙️ Working on: Create mobile-first submission form component
[Previous task ✓] Add memory type selector
[Current task →] Create guest name input with validation
[Next task] Build textarea with character counter
```

**Testing needed:**
```
✅ All development tasks complete!
🧪 Starting testing phase...
Generating test-plan.md
Run /next to begin testing
```

**Feature complete:**
```
🎉 Feature 'memory-submission' complete!
Moving to next feature...
Starting: ai-categorization
```

**All done:**
```
🏁 All sprints complete!
Your MVP is ready for deployment.
Run /deploy-check for final validation.
```

## Auto-Sync Points
- After starting feature: `/sync-dev-docs feature-start`
- Every 3 completed tasks: `/sync-dev-docs`
- Before testing: `/sync-dev-docs`
- After testing: `/sync-dev-docs test-results`
- At completion: `/sync-dev-docs`