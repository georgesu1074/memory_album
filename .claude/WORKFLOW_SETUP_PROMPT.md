# Workflow Setup Prompt for New Projects

Copy and paste this entire prompt to Claude Code to set up the complete workflow system in a new project:

---

## PROMPT START

I want to set up a comprehensive development workflow system with slash commands and automated state tracking for my project. Please create the following:

### 1. Core Workflow Components

Create a development workflow with these components:
- A master development plan (`/development-plan.md`) with sprints and tasks
- A `/development-docs/` directory for active feature documentation
- A `.claude/commands/` directory with slash command definitions
- A `.workflow-state.json` file for tracking progress (git-ignored)
- Project documentation in `CLAUDE.md`

### 2. Slash Commands to Create

Create these slash commands in `.claude/commands/`:

**Workflow Commands:**
- `/project-init` - Initialize project context and scan environment
- `/start-feature [name]` - Start work on a new feature
- `/test-feature [name]` - Create test plan and run tests
- `/complete-feature [name]` - Finalize feature and archive
- `/sync-dev-docs [context]` - Synchronize documentation
- `/next` - Intelligently determine next action
- `/warmup` - Quick refresh of project state
- `/sprint-status` - Show current sprint progress

**Utility Commands:**
- `/commit-smart [message]` - Smart git commits
- `/debug [context]` - Debug issues
- `/workflow-state [action]` - Manage workflow state
- `/optimize-workflow` - Analyze and improve workflow

### 3. State Management System

Create `.workflow-state.json` with this structure:
```json
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
```

Add `.workflow-state.json` to `.gitignore` to keep it local.

### 4. Command Behaviors

Each command should automatically update the workflow state:

- `/project-init`: Set initialized=true, scan environment
- `/start-feature`: Set current_feature, phase="development"
- `/test-feature`: Set phase="testing"
- `/complete-feature`: Clear feature, add to completed, phase="between_features"
- `/sync-dev-docs`: Update task counts
- `/commit-smart`: Update last_commit_at
- `/next`: Read state and suggest appropriate action based on phase

### 5. Feature Development Flow

When `/start-feature [name]` is called:
1. Create `/development-docs/[feature-name]/` directory
2. Create `plan.md` with implementation planning template
3. Create `tasks.md` with extracted tasks from development plan
4. Update workflow state
5. Set up TodoWrite tracking

When `/test-feature [name]` is called:
1. Generate `test-plan.md` with test scenarios
2. Create `test-results.md` template
3. Update phase to "testing"

When `/complete-feature [name]` is called:
1. Generate `pr-summary.md` with changes
2. Mark feature as complete
3. Update workflow state
4. Suggest next feature

### 6. The `/next` Command Logic

Make `/next` intelligent by checking workflow state:
- If not initialized → suggest `/project-init`
- If stale (>2 hours) → suggest `/warmup`
- If phase="between_features" → suggest next feature
- If phase="development" and all tasks done → suggest `/test-feature`
- If phase="testing" and tests pass → suggest `/complete-feature`
- Otherwise → continue current work

### 7. Documentation Structure

Create this structure:
```
/docs/                    # High-level planning (static)
  ├── architecture.md
  ├── api-design.md
  └── database-schema.md
  
/development-docs/        # Active development (dynamic)
  └── [feature-name]/
      ├── plan.md         # Implementation planning
      ├── tasks.md        # Task checklist
      ├── test-plan.md    # Test scenarios
      ├── test-results.md # Test outcomes
      └── pr-summary.md   # Completion summary

/.claude/                 # Workflow system
  ├── commands/           # Individual command files
  ├── workflow-state-guide.md
  └── CLAUDE.md          # Project context
```

### 8. Key Principles

1. **Atomic Development**: Complete logical units before starting new ones
2. **Todo-Driven**: Use TodoWrite extensively for task tracking
3. **State Automation**: Commands auto-update state, manual validation available
4. **Multiple Safety Layers**: Automatic + manual checks
5. **Progressive Documentation**: Start high-level (plan.md), then detailed (tasks.md)

### 9. CLAUDE.md Template

Create a CLAUDE.md with:
```markdown
# [Project Name] Context

## Project Overview
[Brief description]

## Development Workflow
- Use `/project-init` to start new sessions
- Use `/next` to continue work
- Use `/warmup` for quick status checks
- Complete features atomically before starting new ones

## Tech Stack
[List technologies]

## Current Status
Check `.workflow-state.json` for current position

## Slash Commands Available
See `.claude/commands/` for all commands
```

### 10. Sprint Planning Template

Create `/development-plan.md` with sprint structure:
```markdown
# Development Plan

## Sprint 0: Initial Setup
- [ ] Initialize project
- [ ] Set up environment
- [ ] Configure dependencies

## Sprint 1: [Feature Group]
### Epic: [Feature Name]
- [ ] Task 1
- [ ] Task 2
```

Please create all these files and set up the complete workflow system. Make sure:
- All commands auto-update workflow state
- State is git-ignored but persists locally
- `/next` provides intelligent navigation
- Documentation is clear and comprehensive

## PROMPT END

---

## Additional Notes for Manual Setup

After Claude creates the workflow:

1. **Test the workflow:**
   ```bash
   /project-init
   /warmup
   /next
   ```

2. **Customize for your project:**
   - Update tech stack in CLAUDE.md
   - Modify development-plan.md for your features
   - Adjust command behaviors as needed

3. **Optional enhancements:**
   - Add project-specific commands
   - Customize state structure
   - Add hooks if desired

## Making This a Reusable Package

To turn this into a reusable system:

1. **Create a template repo** with all workflow files
2. **Make it installable:**
   ```bash
   npx create-claude-workflow
   # or
   git clone workflow-template .claude
   ```

3. **Consider a CLI tool:**
   ```bash
   claude-workflow init
   claude-workflow add-command [name]
   ```

## Benefits of This Workflow

- **Consistent across projects**: Same commands everywhere
- **Self-documenting**: Commands explain themselves
- **State-aware**: Always knows where you are
- **Recovery-capable**: Can fix corrupted states
- **Team-friendly**: Each developer has own state

## Version Control Strategy

For now, keep this prompt in your `.claude/` directory. Later, consider:
- GitHub template repository
- NPM package with scaffolding
- VS Code extension for Claude workflows
- Shared team workflow library