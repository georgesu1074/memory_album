# /workflow-state

Manage and inspect the workflow state tracking system.

## Usage
```
/workflow-state [action]
```

## Actions
- `show` - Display current state (default)
- `reset` - Reset state by analyzing project
- `recover` - Recover from inconsistent state
- `set` - Manually set state
- `validate` - Check state consistency

## Examples
```
/workflow-state
/workflow-state show
/workflow-state reset
/workflow-state recover
/workflow-state set development memory-submission
/workflow-state validate
```

## Implementation

### Show Current State
```javascript
function showState() {
  const state = JSON.parse(fs.readFileSync('.workflow-state.json'));
  
  return `
  📊 Current Workflow State
  
  Sprint: ${state.current_sprint}
  Phase: ${state.phase}
  Progress: ${state.tasks_completed}/${state.tasks_total} tasks
  
  Feature: ${state.current_feature || 'None active'}
  Completed: ${state.features_completed.join(', ') || 'None yet'}
  
  Workflow:
  - Last Command: ${state.workflow_position.last_command || 'None'}
  - Last Run: ${state.workflow_position.last_command_at || 'Never'}
  - Next Action: ${state.workflow_position.next_suggested}
  - Initialized: ${state.workflow_position.initialized ? '✅' : '❌'}
  
  Timestamps:
  - Last Sync: ${state.last_sync_at || 'Never'}
  - Last Commit: ${state.last_commit_at || 'Never'}
  
  Environment:
  - Next.js: ${state.environment.nextjs ? '✅' : '❌'}
  - Dependencies: ${state.environment.dependencies ? '✅' : '❌'}
  - Supabase: ${state.environment.supabase ? '✅' : '❌'}
  - Env File: ${state.environment.env_file ? '✅' : '❌'}
  `;
}
```

### Reset State
```javascript
function resetState() {
  // Backup current state
  fs.copyFileSync('.workflow-state.json', '.workflow-state.backup.json');
  
  // Analyze project
  const analysis = {
    hasPackageJson: fs.existsSync('package.json'),
    hasNodeModules: fs.existsSync('node_modules'),
    hasEnvFile: fs.existsSync('.env.local'),
    activeFeatures: scanActiveFeatures(),
    currentSprint: detectCurrentSprint(),
  };
  
  // Build new state
  const newState = buildStateFromAnalysis(analysis);
  
  // Save
  fs.writeFileSync('.workflow-state.json', JSON.stringify(newState, null, 2));
  
  return 'State reset based on project analysis';
}
```

### Recover State
```javascript
function recoverState() {
  const fileState = analyzeFileSystem();
  const gitState = analyzeGitHistory();
  const docState = analyzeDevelopmentDocs();
  
  const recovered = mergeStates(fileState, gitState, docState);
  
  // Show discrepancies
  const issues = findDiscrepancies(currentState, recovered);
  
  if (issues.length > 0) {
    console.log('Found inconsistencies:');
    issues.forEach(issue => console.log(`- ${issue}`));
    
    // Prompt for resolution
    return promptForResolution(issues);
  }
  
  return 'State is consistent';
}
```

### Set State Manually
```javascript
function setState(phase, feature) {
  const state = JSON.parse(fs.readFileSync('.workflow-state.json'));
  
  state.phase = phase;
  if (feature) {
    state.current_feature = feature;
  }
  
  state.workflow_position.last_command = '/workflow-state set';
  state.workflow_position.last_command_at = new Date().toISOString();
  
  fs.writeFileSync('.workflow-state.json', JSON.stringify(state, null, 2));
  
  return `State updated: phase=${phase} feature=${feature || 'none'}`;
}
```

### Validate State
```javascript
function validateState() {
  const state = JSON.parse(fs.readFileSync('.workflow-state.json'));
  const errors = [];
  
  // Check feature exists if claimed
  if (state.current_feature.name) {
    const featurePath = `/development-docs/${state.current_feature.name}`;
    if (!fs.existsSync(featurePath)) {
      errors.push(`Feature folder missing: ${featurePath}`);
    }
  }
  
  // Check environment matches
  if (state.environment.nextjs && !fs.existsSync('package.json')) {
    errors.push('State says Next.js initialized but package.json missing');
  }
  
  // Check task progress
  const actualProgress = countCompletedTasks();
  if (actualProgress !== state.tasks_completed) {
    errors.push(`Task count mismatch: state=${state.tasks_completed}, actual=${actualProgress}`);
  }
  
  return errors.length === 0 ? 'State valid ✅' : `Issues found:\n${errors.join('\n')}`;
}
```

## State Update Integration

### Auto-Update on Commands
Each command updates relevant state:

```javascript
// In /start-feature
function updateStateForFeatureStart(featureName, tasks) {
  const state = readState();
  state.current_feature = featureName;
  state.phase = 'development';
  state.tasks_completed = 0;
  state.tasks_total = tasks.length;
  state.workflow_position = {
    last_command: '/start-feature',
    last_command_at: new Date().toISOString(),
    next_suggested: 'continue development',
    initialized: true
  };
  saveState(state);
}
```

## Output Examples

### Show State
```
📊 Current Workflow State

Sprint: 2 - Core Memory Submission
Status: in_progress
Progress: 15/30 tasks

Feature: memory-submission
Phase: development
Tasks: 6/10

Position: development
Last Command: /commit-smart
Next: Continue with task 7

Environment:
- Next.js: ✅
- Dependencies: ✅
- Supabase: ❌
- Qdrant: ❌
- Gemini: ❌
```

### Validation Result
```
❌ Issues found:
- Feature folder missing: /development-docs/memory-submission
- Task count mismatch: state=6, actual=8
- Last command was 2 hours ago (possible stale state)

Run /workflow-state recover to fix
```

### Recovery Result
```
🔄 Recovering workflow state...

Analyzing:
- File system... ✓
- Git history... ✓
- Development docs... ✓

Discrepancies found:
1. Current feature is actually 'ai-categorization' not 'memory-submission'
2. 8 tasks completed, not 6
3. Testing phase, not development

Would you like to:
1. Accept recovered state
2. Keep current state
3. Manually resolve

Choice: 1

✅ State recovered successfully
```

## Helper Functions

### Scan Active Features
```javascript
function scanActiveFeatures() {
  const devDocs = '/development-docs';
  const features = fs.readdirSync(devDocs)
    .filter(dir => fs.statSync(path.join(devDocs, dir)).isDirectory())
    .filter(dir => !fs.existsSync(path.join(devDocs, dir, '.completed')));
  
  return features;
}
```

### Detect Current Sprint
```javascript
function detectCurrentSprint() {
  const plan = fs.readFileSync('/development-docs/development-plan.md', 'utf-8');
  const sprintMatch = plan.match(/## Sprint (\d+): ([^\n]+)/);
  
  if (sprintMatch) {
    return {
      number: parseInt(sprintMatch[1]),
      name: sprintMatch[2]
    };
  }
  
  return { number: 0, name: 'Unknown' };
}
```

### Count Completed Tasks
```javascript
function countCompletedTasks() {
  let count = 0;
  const features = scanActiveFeatures();
  
  features.forEach(feature => {
    const tasksFile = path.join('/development-docs', feature, 'tasks.md');
    if (fs.existsSync(tasksFile)) {
      const content = fs.readFileSync(tasksFile, 'utf-8');
      count += (content.match(/\[x\]/gi) || []).length;
    }
  });
  
  return count;
}
```