# Extract Workflow System to Standalone Repository

Use this prompt when you're ready to extract the workflow system into a shareable template repository.

---

## PROMPT TO EXTRACT WORKFLOW

I want to extract my development workflow system from this project into a standalone Git repository that can be shared and reused as a template. Please help me create a new repository with just the workflow components.

### 1. Create New Repository Structure

Create a new directory at `/Users/georgesu/projects/claude-workflow-template/` with this structure:

```
claude-workflow-template/
├── .claude/
│   ├── commands/           # All command definitions
│   │   ├── project-init.md
│   │   ├── start-feature.md
│   │   ├── test-feature.md
│   │   ├── complete-feature.md
│   │   ├── sync-dev-docs.md
│   │   ├── next.md
│   │   ├── warmup.md
│   │   ├── sprint-status.md
│   │   ├── commit-smart.md
│   │   ├── debug.md
│   │   ├── workflow-state.md
│   │   └── optimize-workflow.md
│   ├── workflow-state-guide.md
│   └── commands.json
├── templates/
│   ├── CLAUDE.md.template
│   ├── development-plan.md.template
│   ├── .workflow-state.json.template
│   └── feature-templates/
│       ├── plan.md.template
│       ├── tasks.md.template
│       ├── test-plan.md.template
│       ├── test-results.md.template
│       └── pr-summary.md.template
├── docs/
│   ├── SETUP.md
│   ├── USAGE.md
│   ├── CUSTOMIZATION.md
│   └── COMMANDS.md
├── scripts/
│   ├── install.sh
│   ├── install.ps1
│   └── install.js
├── examples/
│   ├── example-sprint-plan.md
│   ├── example-feature/
│   └── example-workflow-state.json
├── .gitignore
├── README.md
├── LICENSE
└── package.json (optional for npm distribution)
```

### 2. Extract and Generalize Files

**From current project, copy these files:**

1. Copy all files from `/Users/georgesu/projects/memory_album/.claude/commands/` to the new repo's `.claude/commands/`

2. Copy workflow documentation:
   - `.claude/workflow-state-guide.md`
   - `.claude/state-management-summary.md`
   - `.claude/WORKFLOW_SETUP_PROMPT.md`

3. **Generalize the files** by:
   - Removing project-specific references (Memory Album, wedding, etc.)
   - Replacing with placeholders like `[PROJECT_NAME]`, `[TECH_STACK]`
   - Making feature names generic (feature-1, feature-2 instead of memory-submission)

### 3. Create Template Files

**Create templates/CLAUDE.md.template:**
```markdown
# [PROJECT_NAME] Context

## Project Overview
[PROJECT_DESCRIPTION]

## Tech Stack
[TECH_STACK_LIST]

## Development Workflow
- Use `/project-init` to start new sessions
- Use `/next` to continue work
- Use `/warmup` for quick status checks
- Complete features atomically before starting new ones

## Current Status
Check `.workflow-state.json` for current position

## Slash Commands Available
See `.claude/commands/` for all commands
```

**Create templates/development-plan.md.template:**
```markdown
# [PROJECT_NAME] Development Plan

## Sprint 0: Initial Setup
### Epic: Project Setup
- [ ] Initialize [FRAMEWORK]
- [ ] Set up development environment
- [ ] Configure dependencies
- [ ] Create initial project structure

## Sprint 1: [SPRINT_NAME]
### Epic: [FEATURE_NAME]
- [ ] [TASK_1]
- [ ] [TASK_2]
```

### 4. Create Installation Scripts

**Create scripts/install.sh:**
```bash
#!/bin/bash
# Claude Workflow Installer

echo "🚀 Installing Claude Workflow System..."

# Create directories
mkdir -p .claude/commands
mkdir -p development-docs
mkdir -p docs

# Copy workflow files
cp -r .claude/* ./.claude/
cp templates/CLAUDE.md.template ./CLAUDE.md
cp templates/development-plan.md.template ./development-plan.md
cp templates/.workflow-state.json.template ./.workflow-state.json

# Add to .gitignore
echo ".workflow-state.json" >> .gitignore
echo ".claude/projects/" >> .gitignore

# Initialize git if needed
if [ ! -d .git ]; then
    git init
fi

echo "✅ Claude Workflow installed successfully!"
echo "📝 Next steps:"
echo "  1. Edit CLAUDE.md with your project details"
echo "  2. Customize development-plan.md with your sprints"
echo "  3. Run /project-init in Claude Code to begin"
```

### 5. Create README.md

```markdown
# Claude Workflow System

A comprehensive development workflow system for Claude Code with automated state tracking and intelligent navigation.

## Features
- 🎯 Sprint-based development planning
- 📁 Organized feature documentation
- 🤖 Intelligent next-action suggestions
- 📊 Automatic progress tracking
- 🔄 State recovery and validation
- 📝 Smart git commits

## Quick Start

### Option 1: Clone and Copy
\`\`\`bash
git clone https://github.com/[USERNAME]/claude-workflow-template.git
cp -r claude-workflow-template/.claude your-project/
cp claude-workflow-template/templates/* your-project/
\`\`\`

### Option 2: Use Install Script
\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/[USERNAME]/claude-workflow-template/main/scripts/install.sh | bash
\`\`\`

### Option 3: Manual Setup
1. Copy `.claude/` directory to your project
2. Copy template files and customize
3. Add `.workflow-state.json` to `.gitignore`

## Usage

In Claude Code:
1. Run `/project-init` to initialize
2. Run `/next` to start development
3. Follow the workflow suggestions

## Customization

See [CUSTOMIZATION.md](docs/CUSTOMIZATION.md) for:
- Adding custom commands
- Modifying state structure
- Adapting to your tech stack

## License
MIT
```

### 6. Create package.json (for npm distribution)

```json
{
  "name": "create-claude-workflow",
  "version": "1.0.0",
  "description": "Development workflow system for Claude Code",
  "bin": {
    "create-claude-workflow": "./scripts/install.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/[USERNAME]/claude-workflow-template.git"
  },
  "keywords": ["claude", "ai", "workflow", "development"],
  "author": "[YOUR_NAME]",
  "license": "MIT"
}
```

### 7. Actions to Perform

1. **Extract files** from current project to new repo
2. **Generalize content** by removing project-specific details
3. **Create templates** with placeholders
4. **Write documentation** for setup and usage
5. **Create install scripts** for easy adoption
6. **Add examples** from current project (sanitized)
7. **Initialize git repo** and make initial commit
8. **Tag version** (v1.0.0)

### 8. Final Steps

After creating the repository:
1. Test installation in a fresh project
2. Create GitHub repository
3. Push to GitHub
4. Optional: Publish to npm
5. Share with team or community

### 9. Future Enhancements

Consider adding:
- GitHub template repository feature
- GitHub Actions for testing
- Version management
- Migration scripts for updates
- VS Code extension
- Web-based configurator

Please extract the workflow system from `/Users/georgesu/projects/memory_album/` and create a new standalone repository at `/Users/georgesu/projects/claude-workflow-template/` following this structure. Generalize all content to be project-agnostic and create proper documentation for others to use.

---

## NOTES FOR LATER

When you run this prompt, Claude will:
1. Create a new directory for the template repo
2. Copy and generalize all workflow files
3. Remove Memory Album specific content
4. Create installation scripts
5. Set up proper documentation
6. Make it ready to share

You can then:
- Push to GitHub as a template repository
- Share the link with others
- Use GitHub's "Use this template" feature
- Or distribute via npm with `npx create-claude-workflow`