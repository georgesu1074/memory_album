# /start-feature

Initialize development on a new feature/epic from the development plan.

## Usage
```
/start-feature [feature-name]
```

## Examples
```
/start-feature project-setup
/start-feature memory-submission
/start-feature ai-categorization
```

## Implementation

1. **Validate feature name** against feature_mapping in commands.json
2. **Create feature directory**: `/development-docs/[feature-name]/`
3. **Extract tasks** from development-plan.md for the matching epic
4. **Create tasks.md** with extracted tasks as checkboxes
5. **Create plan.md** with implementation template:
   ```markdown
   # [Feature Name] Implementation Plan
   
   ## Overview
   [Auto-filled from epic description]
   
   ## Technical Approach
   [To be filled during development]
   
   ## Key Decisions
   - 
   
   ## Dependencies
   - 
   
   ## Notes
   - 
   ```
6. **Cross out tasks** in development-plan.md using ~~strikethrough~~
7. **Set up TodoWrite** with the feature's tasks
8. **Run `/sync-dev-docs feature-start`** to ensure consistency
9. **Output** confirmation with next steps

## Feature Mapping
- `project-setup` → Sprint 0: Initial Setup
- `supabase-setup` → Sprint 1: Supabase Setup
- `external-services` → Sprint 1: External Services Integration
- `memory-submission-ui` → Sprint 2: Memory Submission UI
- `memory-submission-api` → Sprint 2: Memory Submission API
- `ai-categorization` → Sprint 3: AI Categorization
- `embedding-storage` → Sprint 3: Embedding Storage
- `memory-album-ui` → Sprint 4: Memory Album UI
- `memory-detail` → Sprint 4: Memory Detail View
- `wedding-setup` → Sprint 5: Wedding Setup Flow
- `landing-pages` → Sprint 5: Landing Pages
- `background-processing` → Sprint 6: Background Processing
- `data-export` → Sprint 6: Data Export
- `performance` → Sprint 7: Performance Optimization
- `production-setup` → Sprint 7: Production Setup
- `final-testing` → Sprint 7: Final Testing & Launch