# /project-init

Initialize Memory Album project context for new Claude session.

## Usage
```
/project-init
```

## Implementation

### 1. Load Core Context
```
1. Read CLAUDE.md for project overview
2. Parse development workflow rules
3. Load slash command definitions
4. Set up feature name mappings
```

### 2. Analyze Current State
```
1. Read development-plan.md
2. Identify current sprint
3. Check /development-docs/ for active work
4. Look for in-progress features
5. Count completed vs remaining tasks
```

### 3. Environment Check
```
1. Check if Next.js initialized
2. Verify package.json exists
3. Check for .env.local
4. Look for node_modules
5. Check git status
```

### 4. Set Up Working Memory
```
1. Load active feature into TodoWrite
2. Set current sprint context
3. Note any blockers
4. Load recent decisions from docs
5. Initialize or update workflow state
```

### 5. Update Workflow State
```javascript
// Read or create workflow state
let state;
if (fs.existsSync('.workflow-state.json')) {
  state = JSON.parse(fs.readFileSync('.workflow-state.json'));
} else {
  // Create initial state
  state = {
    current_sprint: 0,
    current_feature: null,
    phase: "not_started",
    tasks_completed: 0,
    tasks_total: 0,
    workflow_position: {
      last_command: null,
      last_command_at: null,
      next_suggested: "/project-init",
      initialized: false
    },
    features_completed: [],
    last_sync_at: null,
    last_commit_at: null,
    environment: {
      nextjs: false,
      dependencies: false,
      supabase: false,
      env_file: false
    }
  };
}

// Update from environment scan
state.environment.nextjs = fs.existsSync('package.json');
state.environment.dependencies = fs.existsSync('node_modules');
state.environment.env_file = fs.existsSync('.env.local');
state.environment.supabase = state.environment.env_file && 
  fs.readFileSync('.env.local', 'utf-8').includes('SUPABASE');

// Update workflow position
state.workflow_position = {
  last_command: "/project-init",
  last_command_at: new Date().toISOString(),
  next_suggested: state.environment.nextjs ? "/warmup" : "/dev-setup",
  initialized: true
};

// Detect current feature from development-docs
const activeFeature = scanActiveFeatures();
if (activeFeature) {
  state.current_feature = activeFeature;
  state.phase = "development";
  // Count tasks if feature exists
  const tasksFile = `/development-docs/${activeFeature}/tasks.md`;
  if (fs.existsSync(tasksFile)) {
    const content = fs.readFileSync(tasksFile, 'utf-8');
    state.tasks_completed = (content.match(/\[x\]/gi) || []).length;
    state.tasks_total = (content.match(/\[[ x]\]/gi) || []).length;
  }
}

fs.writeFileSync('.workflow-state.json', JSON.stringify(state, null, 2));
```

## Output Format

```markdown
# 🚀 Memory Album Project Initialized

## Project Overview
**Goal**: Multi-tenant wedding memory collection platform
**Phase**: MVP Development for your wedding
**Architecture**: Next.js + Supabase + Qdrant + Gemini

## Current State
**Sprint**: 2 - Core Memory Submission
**Progress**: 25/90 tasks complete (28%)
**Active Feature**: memory-submission-ui

## Development Status

### ✅ Completed
- Project documentation
- Architecture planning
- Tech stack decisions

### 🚧 In Progress
- Memory submission UI (6/10 tasks)
  Current: Building character counter

### 📋 Upcoming
- Memory submission API
- AI categorization
- Album display

## Environment
- Next.js: [Not initialized - run /dev-setup]
- Git: [Initialized, 5 uncommitted files]
- Dependencies: [Not installed]
- Supabase: [Not configured]

## Recent Decisions
- Use Gemini over Claude (10x cheaper)
- Single Vercel deployment
- Store embeddings for future RAG
- Mobile-first development

## Workflow Commands Ready
- `/warmup` - Quick status check
- `/next` - Continue development
- `/start-feature` - Begin new feature
- `/test-feature` - Run tests
- `/complete-feature` - Finish feature
- `/sync-dev-docs` - Update documentation

## Next Actions
1. Run `/dev-setup` to initialize project
2. Run `/manual-help supabase` for setup guide
3. Run `/next` to start Sprint 0

## Important Context
- Building for your wedding first (June 2024)
- 200 guests expected
- Must work perfectly on mobile
- Total AI cost target: <$3

## Documentation Structure
```
/docs/              # High-level planning (read-only)
/development-docs/  # Active development (auto-updated)
/.claude/          # Workflow commands
```

## Quick Start
Ready to begin? Run `/next` to automatically start where we left off.

---
✨ Project context loaded! Memory Album workspace ready.
```

## Context Loading Priority

### Critical Context (Always Load)
1. Project goal and phase
2. Current sprint and progress
3. Active features
4. Tech stack decisions
5. Workflow commands

### Secondary Context (As Needed)
1. Cost analysis
2. Performance targets
3. Security requirements
4. Future phases

### Skip If Irrelevant
1. Completed sprint details
2. Archived features
3. Rejected alternatives

## State Detection Logic

```python
def detect_state():
    if not exists("package.json"):
        return "NOT_INITIALIZED"
    
    if not exists("node_modules"):
        return "DEPS_NOT_INSTALLED"
    
    if not exists(".env.local"):
        return "ENV_NOT_CONFIGURED"
    
    if has_active_feature():
        return "DEVELOPMENT_ACTIVE"
    
    if all_features_complete():
        return "READY_FOR_DEPLOY"
    
    return "READY_TO_START"
```

## TodoWrite Setup
```
# Clear any stale todos
todos.clear()

# Load active feature tasks
if active_feature:
    tasks = read_tasks(active_feature)
    for task in tasks:
        if not task.completed:
            todos.add(task)

# Set first uncompleted as in_progress
if todos:
    todos[0].status = "in_progress"
```

## Memory Optimization
Keep context focused by:
1. Only loading current sprint details
2. Skipping completed feature docs
3. Summarizing instead of full text
4. Using references instead of copying

## Comparison with /prime
| Aspect | /prime (Global) | /project-init (Project) |
|--------|----------------|------------------------|
| Scope | All projects | Memory Album only |
| Context | General | Specific workflow |
| Docs | Basic | Full documentation |
| State | None | Sprint progress |
| Setup | Minimal | Complete workspace |

## Error Handling
- Missing CLAUDE.md → Create from template
- No development-plan.md → Suggest creating one
- Corrupted state → Offer to reset
- Merge conflicts → Guide resolution