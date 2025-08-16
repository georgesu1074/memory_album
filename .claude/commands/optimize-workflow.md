# /optimize-workflow

Analyze current workflow and conservatively suggest improvements.

## Usage
```
/optimize-workflow
```

## Implementation

### 1. Analyze Chat History
```
1. Count command usage frequency
2. Identify repeated manual tasks
3. Measure time between commands
4. Find error patterns
5. Detect workflow friction
```

### 2. Review Current Workflow
```
1. Check which commands are used most
2. Identify unused commands
3. Find gaps in automation
4. Look for manual steps that repeat
```

### 3. Conservative Evaluation Criteria
Only suggest new commands if they:
- Save >5 minutes per use
- Would be used >3 times per week
- Reduce error rate significantly
- Automate 3+ manual steps
- Fill a clear workflow gap

## Output Format

```markdown
# 🔧 Workflow Optimization Analysis

## Current Workflow Performance

### Command Usage (Last 7 Days)
1. `/next` - 47 times (most used) ✅
2. `/commit-smart` - 23 times ✅
3. `/sync-dev-docs` - 19 times ✅
4. `/debug` - 5 times
5. `/warmup` - 3 times

### Workflow Efficiency
- **Average task completion**: 12 minutes
- **Commands per feature**: 8.5
- **Manual interventions**: 2 per feature
- **Error rate**: 5%

## Patterns Detected

### Repetitive Tasks
1. Checking TypeScript errors (8 times)
   - Time spent: ~3 min each
   - Total: 24 minutes

2. Formatting code (6 times)
   - Time spent: ~2 min each
   - Total: 12 minutes

## Optimization Recommendations

### ✅ Recommendation 1: Add `/typecheck` command
**Rationale**: 
- Would save 24 min/week
- Reduces context switching
- Catches errors earlier

**Implementation**:
```
/typecheck [file]
- Run tsc --noEmit
- Show errors with line numbers
- Suggest fixes
```

### ❌ No other recommendations
The current workflow is well-optimized. Additional commands would add complexity without significant benefit.

## Workflow Health

### Strengths 💪
- `/next` automation working perfectly
- Good command coverage
- Minimal manual work
- Clear workflow progression

### No Issues Found 🎯
- No bottlenecks detected
- No redundant commands
- No missing critical automation

## Conclusion
Your workflow is already lean and efficient. No changes recommended at this time.

---
✨ Workflow is optimized! Keep using current commands.
```

## Analysis Metrics

### Command Efficiency Score
```
efficiency = (automated_steps / total_steps) * 100
```

### Time Savings Calculation
```
savings = (manual_time - command_time) * frequency
worth_it = savings > 5 minutes
```

### Complexity Score
```
complexity = num_commands + num_parameters
optimal_range = 10-20 commands
```

## Conservative Thresholds

### When to Suggest New Command
- Saves >5 min per use AND
- Used >3 times per week AND
- Automates >3 steps AND
- Reduces errors by >20%

### When NOT to Suggest
- One-time tasks
- Already covered by existing command
- Would add confusion
- Marginal time savings (<2 min)
- Edge cases

## Example Suggestions (When Appropriate)

### Good Suggestion
```markdown
### ✅ Add `/format` command
**Rationale**:
- Used 15 times last week
- Saves 3 min each time
- Total savings: 45 min/week
- Reduces inconsistency errors
```

### Bad Suggestion (Don't Make)
```markdown
### ❌ Add `/create-component-with-tests-and-docs`
**Why not**:
- Too specific
- Only used twice
- Existing commands cover this
- Adds unnecessary complexity
```

## Common Patterns to Detect

### Positive Patterns (Reinforce)
- Using `/next` consistently
- Regular commits
- Following test workflow

### Problem Patterns (Address)
- Skipping tests
- Not syncing docs
- Manual repetitive tasks
- Forgetting environment setup

## Optimization Categories

### Time Savers
- Batch operations
- Parallel execution
- Caching results

### Error Reducers
- Validation commands
- Pre-flight checks
- Automated fixes

### Workflow Smoothers
- State detection
- Auto-progression
- Context preservation

## Final Report Options

### Highly Optimized (Usual Case)
```
"Your workflow is already lean. No improvements needed."
```

### Minor Improvements
```
"Found 1 optimization that could save 10 min/week."
```

### Needs Work (Rare)
```
"Found 3 optimizations that could save 2 hours/week."
```

## Important Note
**Default to "no recommendations"**. The workflow should stay as simple as possible. Only suggest additions when the benefit is overwhelming and obvious.