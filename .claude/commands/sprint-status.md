# /sprint-status

Show current sprint progress and remaining tasks.

## Usage
```
/sprint-status
```

## Implementation

### 1. Read development-plan.md
```
1. Identify current sprint (first with incomplete tasks)
2. Count completed vs total tasks per epic
3. Calculate sprint percentage
4. Identify blockers or dependencies
```

### 2. Scan /development-docs/
```
1. Check for active feature folders
2. Read .sync-status files
3. Count in-progress work
4. Check for .completed flags
```

### 3. Generate Metrics
```
- Tasks completed today
- Tasks completed this sprint
- Average task completion time
- Estimated completion date
```

## Output Format

```markdown
# 📊 Sprint Status Report

## Current Sprint: [X] - [Name]
**Goal**: [Sprint goal]
**Started**: [Date]
**Target**: [Date]

## Overall Progress
██████████░░░░░░░░░░ 50% Complete (25/50 tasks)

## Epic Breakdown

### ✅ Completed Epics
- Initial Setup (12/12 tasks)
- Supabase Setup (8/8 tasks)

### 🚧 In Progress
- **Memory Submission UI** (6/10 tasks)
  ██████░░░░ 60%
  - [x] Form component
  - [x] Type selector
  - [x] Name input
  - [ ] Character counter ← Current
  - [ ] Photo upload
  
### 📋 Not Started
- Memory Submission API (0/8 tasks)
- AI Categorization (0/12 tasks)

## Active Work

### Current Feature: memory-submission-ui
- **Status**: 6/10 tasks complete
- **Last Update**: 10 minutes ago
- **Current Task**: Build character counter
- **Blockers**: None

## Velocity

### This Sprint
- **Completed Today**: 3 tasks
- **Completed This Week**: 15 tasks
- **Average/Day**: 5 tasks

### Projections
- **Sprint Completion**: 3 days remaining
- **Est. Completion**: March 20, 2024
- **On Track**: ✅ Yes

## Recent Activity
- ✅ 10:30 AM - Created form component
- ✅ 09:45 AM - Added type selector
- ✅ 09:00 AM - Set up project structure

## Upcoming Work
1. Complete character counter
2. Implement photo upload
3. Add form validation
4. Start API development

## Risk Assessment
🟢 **Low Risk** - On track for completion

### Potential Issues
- Photo upload complexity (may need 2 extra hours)
- Supabase setup pending (waiting on manual config)

## Quick Actions
- Continue current task: `/next`
- Check detailed progress: `/warmup`
- Start testing: `/test-feature memory-submission-ui`

---
💪 Keep up the great pace! You're 50% through this sprint.
```

## Sprint Indicators

### Progress Bar Styles
```
██████████ 100% - Complete
████████░░ 80%  - Nearly done
██████░░░░ 60%  - Good progress
████░░░░░░ 40%  - Keep going
██░░░░░░░░ 20%  - Just started
░░░░░░░░░░ 0%   - Not started
```

### Status Emojis
- ✅ Complete
- 🚧 In Progress
- 📋 Not Started
- ⚠️ Blocked
- 🔥 Critical Path
- 🎯 Current Focus

## Sprint Velocity Calculation
```
velocity = completed_tasks / days_elapsed
projected_completion = remaining_tasks / velocity
on_track = projected_completion <= days_remaining
```

## Risk Levels
- 🟢 **Low Risk**: On track, no blockers
- 🟡 **Medium Risk**: Minor delays, some concerns
- 🔴 **High Risk**: Behind schedule, blockers exist

## Sprint Goals by Number

### Sprint 0: Project Setup
Get development environment ready

### Sprint 1: Database & Services
Connect all external services

### Sprint 2: Memory Submission
Core submission functionality

### Sprint 3: AI Integration
Smart categorization working

### Sprint 4: Memory Display
Beautiful album viewing

### Sprint 5: Wedding Config
Setup flow for couples

### Sprint 6: Background Jobs
Automated processing

### Sprint 7: Polish & Launch
Production ready

## Detailed Metrics Template
```json
{
  "sprint": 2,
  "name": "Core Memory Submission",
  "progress": {
    "completed": 25,
    "total": 50,
    "percentage": 50
  },
  "epics": {
    "completed": 2,
    "in_progress": 1,
    "not_started": 2
  },
  "velocity": {
    "daily_average": 5,
    "weekly_total": 25
  },
  "projection": {
    "completion_date": "2024-03-20",
    "days_remaining": 3,
    "on_track": true
  }
}
```