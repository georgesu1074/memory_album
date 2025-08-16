# /commit-smart

Create a git commit with smart detection of changes and workflow state updates.

## Usage
```
/commit-smart "[message]"
/commit-smart  # Auto-generates message
```

## Examples
```
/commit-smart "Add photo upload validation"
/commit-smart "Fix mobile responsive issues"
/commit-smart  # Generates: "feat: Add memory submission form with validation"
```

## Implementation

### 1. Analyze Changes
```bash
git status --porcelain
git diff --staged --stat
git diff --cached --name-only
```

### 2. Auto-Generate Message (if not provided)
```
1. Identify changed files
2. Determine change type:
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - style: Formatting
   - refactor: Code restructuring
   - test: Test changes
   - chore: Maintenance
3. Extract component/area from file paths
4. Summarize changes
```

### 3. Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
```
feat(memory-submission): Add photo upload with preview

- Support up to 5 photos per memory
- Add image compression client-side
- Show thumbnail previews
- Implement remove photo functionality
```

### 4. Execution
```bash
# Stage changes if needed
git add -A

# Create commit
git commit -m "generated message"

# Show result
git log -1 --oneline
```

### 5. Update Workflow State
```javascript
// Update last commit timestamp
const state = JSON.parse(fs.readFileSync('.workflow-state.json'));
state.last_commit_at = new Date().toISOString();
state.workflow_position.last_command = "/commit-smart";
state.workflow_position.last_command_at = new Date().toISOString();
// Don't change next_suggested - let workflow continue
fs.writeFileSync('.workflow-state.json', JSON.stringify(state, null, 2));
```

## Smart Detection Rules

### Feature Detection
- New components → `feat:`
- New API routes → `feat:`
- New pages → `feat:`

### Fix Detection
- Changes with "fix", "bug", "issue" → `fix:`
- Error handling changes → `fix:`

### Documentation
- *.md files → `docs:`
- Comments only → `docs:`

### Style Changes
- Formatting only → `style:`
- CSS/Tailwind changes → `style:`

### Refactoring
- File moves → `refactor:`
- Function extraction → `refactor:`
- No behavior change → `refactor:`

## Conventional Commit Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (formatting, semicolons)
- `refactor:` Code change that neither fixes nor adds feature
- `perf:` Performance improvement
- `test:` Adding tests
- `build:` Build system changes
- `ci:` CI configuration
- `chore:` Other changes
- `revert:` Revert previous commit

## Output Example

**With message:**
```
📝 Creating commit...

Changes to commit:
- app/components/MemoryForm.tsx (new)
- app/api/memories/route.ts (new)
- lib/validation.ts (modified)

✅ Committed: feat(memory): Add memory submission form

[main 5a3f2d1] feat(memory): Add memory submission form
 3 files changed, 245 insertions(+), 12 deletions(-)
```

**Auto-generated:**
```
📝 Analyzing changes...

Detected: New feature (3 new components)
Area: memory-submission
Type: feat

Generated message:
"feat(memory-submission): Add form components and validation"

✅ Committed successfully!
```

## Commit Frequency Guidelines
- After completing a logical unit of work
- Every 2-3 tasks from tasks.md
- Before switching context
- After fixing a bug
- Before testing
- End of work session

## Git Configuration Check
```bash
# Ensure user configured
git config user.name
git config user.email

# If not set:
git config user.name "Your Name"
git config user.email "your.email@example.com"
```