# /complete-feature

Finalize a feature after development and testing.

## Usage
```
/complete-feature [feature-name]
```

## Examples
```
/complete-feature memory-submission
/complete-feature ai-categorization
```

## Implementation

### 1. Validation
```
1. Check feature folder exists
2. Verify all tasks in tasks.md are [x] checked
3. Verify test-results.md exists
4. Check that critical tests passed
5. If validation fails, show what's missing
```

### 2. Generate pr-summary.md
```markdown
# [Feature Name] - PR Summary

## Overview
[Brief description of what was built]

## Changes Made

### New Files
- `path/to/file1.tsx` - [Description]
- `path/to/file2.ts` - [Description]

### Modified Files
- `path/to/file3.tsx` - [What changed]

### Configuration
- Added environment variables: [List]
- Updated dependencies: [List]

## Features Implemented
✅ [Feature 1]
✅ [Feature 2]
✅ [Feature 3]

## Testing
- Tests Run: X
- Tests Passed: X
- Coverage: X%

## Known Issues
- [Any non-blocking issues]
- [Technical debt noted]

## Screenshots
[If applicable]

## Deployment Notes
- [Any special deployment steps]
- [Environment variables needed]
- [Migration requirements]

## Next Steps
- [What feature comes next]
- [Any follow-up work]
```

### 3. Update development-plan.md
```
1. Find all ~~crossed out~~ tasks for this feature
2. Change them to:
   - ~~[x] Task~~ ✅ [feature-name]
3. Add completion marker to epic heading:
   ### Epic: [Name] ✅
4. Update sprint progress indicator
```

### 4. Create Completion Report
```
1. Count total tasks completed
2. Calculate time spent (if tracked)
3. List any deferred work
4. Note lessons learned
5. Generate metrics
```

### 5. Archive Feature
```
1. Add .completed flag file to feature folder
2. Update .sync-status with completion time
3. Optional: Create feature-complete git commit
4. Clear TodoWrite for this feature
5. Update workflow state:
   - Set current_feature to null
   - Set phase to "between_features"
   - Add feature to features_completed
   - Update workflow_position with next suggested feature
```

### 6. Update Workflow State
```javascript
const state = JSON.parse(fs.readFileSync('.workflow-state.json'));
state.features_completed.push(feature_name);
state.current_feature = null;
state.phase = "between_features";
state.tasks_completed = 0;
state.tasks_total = 0;
const nextFeature = getNextFeatureFromPlan(state.features_completed);
state.workflow_position = {
  last_command: "/complete-feature",
  last_command_at: new Date().toISOString(),
  next_suggested: nextFeature ? `/start-feature ${nextFeature}` : "All features complete!",
  initialized: true
};
fs.writeFileSync('.workflow-state.json', JSON.stringify(state, null, 2));
```

## Output Format

```
🎉 Completing feature: memory-submission

## Summary
✅ 10/10 tasks completed
✅ 15/15 tests passing
📝 PR summary generated

## Changes Made
- Created 5 new components
- Added 3 API endpoints
- Configured Supabase storage
- Implemented photo upload

## Files Changed
- 12 files added
- 3 files modified
- 456 lines of code

## Quality Metrics
- No TypeScript errors
- All tests passing
- Mobile responsive
- Accessible (WCAG AA)

## Documentation
✓ tasks.md - All complete
✓ plan.md - Implementation documented
✓ test-plan.md - Test coverage defined
✓ test-results.md - All tests passed
✓ pr-summary.md - Generated

## Next Feature
Ready to start: ai-categorization
Run /next to begin

---
Feature 'memory-submission' marked as complete! 🎊
```

## Commit Message Template
```
feat(memory-submission): Complete memory submission feature

- Implemented mobile-first submission form
- Added photo upload with preview (max 5 photos)
- Created guest name and memory text inputs
- Added client-side validation
- Integrated with Supabase storage
- Added success confirmation screen

Tests: 15/15 passing
Docs: Complete
```

## Completion Checklist
Before marking complete, verify:
- [ ] All tasks checked in tasks.md
- [ ] No critical bugs in test-results.md
- [ ] Documentation updated
- [ ] Code committed
- [ ] Environment variables documented
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile tested

## Sprint Progress Update
After completing feature, update sprint marker:
```markdown
## Sprint 2: Core Memory Submission Flow
**Progress**: ███████░░░ 70% (7/10 epics)

### Epic: Memory Submission UI ✅
### Epic: Memory Submission API ✅
### Epic: Photo Upload ⏳ (in progress)
```

## Deferred Work Handling
If some non-critical items deferred:
```markdown
## Deferred to Backlog
- [ ] Advanced photo editing
- [ ] Video upload support
- [ ] Draft saving

These items moved to Phase 2 backlog.
```

## Auto-Actions
1. Run `/sync-dev-docs` to ensure consistency
2. Clear current TodoWrite list
3. Update sprint status
4. Suggest `/next` for next feature
5. Optional: Create git tag for feature