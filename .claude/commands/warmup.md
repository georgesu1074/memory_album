# /warmup

Quick refresh of current project state and recent progress.

## Usage
```
/warmup
```

## Implementation

1. **Read CLAUDE.md** for project overview
2. **Read .workflow-state.json** for current position
3. **Check development-plan.md** for sprint details
4. **Scan /development-docs/** if feature active
5. **Check git status** for uncommitted changes
6. **Review TodoWrite** for current tasks
7. **Display workflow position** from state

## Output Format

```markdown
# 🌅 Memory Album - Project Warmup

## Current Status
**Sprint**: [X] - [Sprint Name]
**Goal**: [Sprint Goal]
**Progress**: [X/Y tasks complete] ([percentage]%)

## Active Feature
**Working on**: [feature-name]
**Status**: [X/Y tasks complete]
**Current task**: [task description]
**Blockers**: [any blockers]

## Recent Progress (Last Session)
✅ [Completed task 1]
✅ [Completed task 2]
✅ [Completed task 3]

## Next Up
1. [Next immediate task]
2. [Following task]
3. [Task after that]

## Decisions Needed
- [Any pending decisions]
- [Design choices to make]

## Quick Actions
- Run `/next` to continue where you left off
- Run `/sprint-status` for detailed progress
- Run `/manual-help [service]` if you need setup assistance

## Environment Status
- Next.js: [installed/not installed]
- Dependencies: [installed/not installed]
- Supabase: [configured/not configured]
- Env File: [exists/missing]
- Git: [clean/X uncommitted changes]

## Workflow Position
- Last Command: [command] ([time ago])
- Next Suggested: [action]
- Last Sync: [time ago]
- Last Commit: [time ago]
```

## Example Output

```markdown
# 🌅 Memory Album - Project Warmup

## Current Status
**Sprint**: 2 - Core Memory Submission Flow
**Goal**: Guests can submit memories with photos
**Progress**: 6/10 tasks complete (60%)

## Active Feature
**Working on**: memory-submission-ui
**Status**: 6/10 tasks complete
**Current task**: Build textarea with character counter
**Blockers**: None

## Recent Progress (Last Session)
✅ Created mobile-first submission form component
✅ Added memory type selector (Bride/Groom/Both)
✅ Created guest name input with validation

## Next Up
1. Build textarea with character counter
2. Implement photo upload component with preview
3. Add client-side form validation

## Decisions Needed
- Photo compression approach (client vs server)
- Character limit for memories (500 or 1000?)

## Quick Actions
- Run `/next` to continue where you left off
- Run `/sprint-status` for detailed progress
- Run `/manual-help supabase` if you need setup assistance

## Environment Status
- Next.js: Installed ✓
- Supabase: Not configured ⚠️
- Git: 3 uncommitted changes
```

## Notes
- Keep output concise but informative
- Focus on actionable information
- Highlight any blockers prominently
- Always suggest next action