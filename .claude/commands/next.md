# /next

Automatically determine and execute the next action in the development workflow.

## Usage
```
/next
```

## Implementation

```javascript
function executeNext() {
  // Read workflow state
  const state = JSON.parse(fs.readFileSync('.workflow-state.json'));
  
  // Not initialized
  if (!state.workflow_position.initialized) {
    return execute('/project-init');
  }
  
  // Check staleness (> 2 hours)
  const lastCommand = new Date(state.workflow_position.last_command_at);
  const hoursSince = (Date.now() - lastCommand) / (1000 * 60 * 60);
  if (hoursSince > 2) {
    return execute('/warmup');
  }
  
  // Use state to determine next action
  switch(state.phase) {
    case 'not_started':
      if (!state.environment.nextjs) {
        return execute('/dev-setup');
      }
      return suggestNextFeature(state);
      
    case 'between_features':
      return suggestNextFeature(state);
      
    case 'development':
      if (state.tasks_completed === state.tasks_total) {
        return execute('/test-feature', state.current_feature);
      }
      if (needsSync(state)) {
        return execute('/sync-dev-docs');
      }
      return continueCurrentTask(state);
      
    case 'testing':
      if (hasPassingTests(state.current_feature)) {
        return execute('/complete-feature', state.current_feature);
      }
      return "Fix failing tests, then run /complete-feature";
      
    default:
      return execute('/workflow-state recover');
  }
}

function suggestNextFeature(state) {
  const nextFeature = getNextFeatureFromPlan(state.features_completed);
  if (nextFeature) {
    return execute('/start-feature', nextFeature);
  }
  return "🎉 All features complete! Run /deploy-check";
}

function needsSync(state) {
  // Sync every 3 tasks or if > 30 min since last sync
  const tasksSinceSync = state.tasks_completed % 3 === 0;
  const timeSinceSync = Date.now() - new Date(state.last_sync_at) > 30 * 60 * 1000;
  return tasksSinceSync || timeSinceSync;
}
```

### State-Driven Flow
```
START
  ↓
[Read .workflow-state.json]
  ↓
Initialized?
  ├─ NO → Execute: /project-init
  └─ YES → Check staleness
           ↓
           Stale (>2hrs)?
           ├─ YES → Execute: /warmup
           └─ NO → Check phase
                   ↓
                   [Switch on phase]
                   ├─ not_started → /dev-setup or first feature
                   ├─ between_features → /start-feature [next]
                   ├─ development → Check tasks
                   │                ├─ All done → /test-feature
                   │                ├─ Need sync → /sync-dev-docs
                   │                └─ Continue → Work on next task
                   └─ testing → Check test results
                               ├─ Passing → /complete-feature
                               └─ Failing → Fix tests
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