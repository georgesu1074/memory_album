# Memory Album Project Commands

## /start-feature
Start development on a new feature/epic from the development plan.

Usage: `/start-feature [feature-name]`

Example: `/start-feature memory-submission`

This command will:
1. Create `/development-docs/[feature-name]/` directory
2. Extract relevant tasks from development-plan.md
3. Create tasks.md with the feature's checklist
4. Create plan.md template for implementation details
5. Mark tasks as "in-progress" in development-plan.md
6. Set up TodoWrite tracking for the feature

## /test-feature
Prepare and execute manual QA testing for a completed feature (no unit/integration tests).

Usage: `/test-feature [feature-name]`

Example: `/test-feature memory-submission`

This command will:
1. Generate test-plan.md with manual QA test scenarios
2. Create test-results.md template
3. Guide through manual testing steps (terminal commands, API calls, UI checks)
4. Document any bugs found
5. Verify all acceptance criteria

## /complete-feature
Finalize a feature after development and testing.

Usage: `/complete-feature [feature-name]`

Example: `/complete-feature memory-submission`

This command will:
1. Generate pr-summary.md with all changes
2. Mark all tasks as complete in tasks.md
3. Update development-plan.md progress
4. Archive any temporary files
5. Prepare for next feature

## /sprint-status
Show current sprint progress and statistics.

Usage: `/sprint-status`

This command will:
1. Display current sprint number and goal
2. Show completed vs remaining tasks
3. List in-progress features
4. Estimate completion percentage
5. Identify blockers or dependencies

## /next-task
Automatically identify and begin the next task.

Usage: `/next-task`

This command will:
1. Find the next uncompleted task in development-plan.md
2. Determine which feature/epic it belongs to
3. Start the feature if not already started
4. Update TodoWrite with the new task
5. Provide context and implementation guidance

## /dev-setup
Initialize the entire development environment.

Usage: `/dev-setup`

This command will:
1. Run npm/yarn install
2. Set up .env.local with template values
3. Verify all dependencies
4. Create necessary directories
5. Run initial health checks

## /manual-help
Request manual assistance for external setup tasks.

Usage: `/manual-help [service]`

Examples: 
- `/manual-help supabase`
- `/manual-help qdrant`
- `/manual-help gemini`

This command will:
1. Provide step-by-step setup instructions
2. List required configuration values
3. Show where to add credentials
4. Provide testing commands
5. Verify successful setup

## /deploy-check
Verify the app is ready for production deployment.

Usage: `/deploy-check`

This command will:
1. Check all environment variables
2. Verify API endpoints
3. Test database connections
4. Validate build process
5. Generate deployment checklist

## /quick-test
Run a quick smoke test of core functionality.

Usage: `/quick-test [feature]`

Examples:
- `/quick-test submission`
- `/quick-test album`
- `/quick-test all`

This command will:
1. Test the specified feature's main flow
2. Verify data persistence
3. Check error handling
4. Validate UI responsiveness
5. Report any issues found

## /commit-feature
Create a git commit for the current feature.

Usage: `/commit-feature [feature-name] "[message]"`

Example: `/commit-feature memory-submission "Add memory submission form with photo upload"`

This command will:
1. Stage relevant files for the feature
2. Create descriptive commit message
3. Include PR summary as commit body
4. Tag with feature name
5. Push to feature branch (if desired)

## /commit-smart
Create a git commit with smart detection of changes and workflow state updates.

Usage: `/commit-smart "[message]"` or just `/commit-smart` for auto-generated message

Examples:
- `/commit-smart "Add photo upload validation"`
- `/commit-smart` (generates message from staged changes)

This command will:
1. Run git status to see changes
2. Auto-generate commit message if not provided
3. Follow conventional commit format
4. Include file change summary
5. Create commit with proper attribution

## /debug
Debug and troubleshoot issues with detailed analysis.

Usage: `/debug [context]`

Examples:
- `/debug "Memory submission returns 500 error"`
- `/debug "Photos not uploading on mobile Safari"`
- `/debug "AI categorization grouping unrelated memories"`

This command will:
1. Analyze the provided error context
2. Check relevant logs and error states
3. Review recent code changes
4. Identify potential causes
5. Provide step-by-step debugging plan
6. Suggest fixes with code examples

## /project-init
Initialize project context for new Claude session (project-specific version of /prime).

Usage: `/project-init`

This command will:
1. Read CLAUDE.md for project context
2. Load development-plan.md to understand progress
3. Check current sprint and active features
4. Scan codebase for project structure
5. Set up TodoWrite with current tasks
6. Verify environment and dependencies
7. Provide status summary

Note: This is more comprehensive than the global /prime command as it loads Memory Album specific context, development progress, and sets up the workflow state.

## /warmup
Refresh your memory about the current project state and what we're working on.

Usage: `/warmup`

This command will:
1. Show current sprint and its goal
2. List active features in progress
3. Display recent completed tasks
4. Show next 3-5 upcoming tasks
5. Highlight any blockers or decisions needed
6. Summarize last session's work
7. Provide quick context without overwhelming detail

## /next
Automatically determine and execute the next action in the workflow.

Usage: `/next`

This command will:
1. Check current workflow state from development-plan.md
2. Identify any in-progress features
3. Determine the appropriate next action:
   - If no feature active: Suggest `/start-feature [next-feature]`
   - If developing: Continue with next task
   - If tasks complete: Suggest `/test-feature [current]`
   - If tested: Suggest `/complete-feature [current]`
   - If feature done: Move to next feature
4. Execute or suggest the appropriate command
5. Provide context for why this is the next step

## /optimize-workflow
Analyze current workflow and conservatively suggest improvements.

Usage: `/optimize-workflow`

This command will:
1. Review chat history for repetitive patterns
2. Analyze time spent on different workflow phases
3. Identify any friction points or delays
4. Check for missing automation opportunities
5. Suggest new slash commands ONLY if they would:
   - Save significant time (>5 min per use)
   - Reduce errors or mistakes
   - Automate repetitive multi-step processes
6. Provide rationale for each suggestion
7. Show where it fits in the workflow

Note: This command is intentionally conservative. No suggestions is a valid outcome if the workflow is already optimal.

## /sync-dev-docs
Synchronize development documentation based on current progress.

Usage: `/sync-dev-docs [context]`

Examples:
- `/sync-dev-docs` (auto-detect what needs syncing)
- `/sync-dev-docs feature-start` (when starting a feature)
- `/sync-dev-docs task-complete` (after completing tasks)
- `/sync-dev-docs test-results` (after testing)

This command will:
1. **When starting feature:**
   - Extract tasks from development-plan.md for the epic
   - Create tasks.md in feature folder
   - Create plan.md template with implementation notes
   - Cross out moved tasks in development-plan.md (~~task~~)

2. **During development:**
   - Update task checkboxes in tasks.md
   - Sync task status with development-plan.md
   - Update plan.md with design decisions
   - Track completed vs remaining work

3. **During testing:**
   - Generate test-plan.md if not exists
   - Update test-results.md with outcomes
   - Document any bugs or issues found

4. **At completion:**
   - Generate pr-summary.md with all changes
   - Mark all tasks as complete in both locations
   - Update development-plan.md with completion status
   - Archive completed documentation

Note: This command ONLY updates `/development-docs/`. The `/docs/` folder contains high-level planning and is never auto-updated.