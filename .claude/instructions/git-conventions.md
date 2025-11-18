# Git Conventions & Workflow

## Overview

This document outlines the Git workflow, branch naming conventions, commit message format, and pull request guidelines for this NestJS hexagonal architecture project.

---

## Branch Strategy

### Main Branch
- **Name**: `develop`
- **Purpose**: Main development branch
- **Protection**: Should be protected with PR requirements
- **Deployment**: Represents the latest development state

### Branch Types

#### Feature Branches
- **Format**: `feature/{task-id}-{brief-description}`
- **Purpose**: New features or enhancements
- **Examples**:
  - `feature/TASK-123-add-product-crud`
  - `feature/TASK-124-implement-authentication`
  - `feature/TASK-125-user-registration`

#### Bug Fix Branches
- **Format**: `fix/{task-id}-{brief-description}`
- **Purpose**: Bug fixes and corrections
- **Examples**:
  - `fix/TASK-126-null-pointer-in-controller`
  - `fix/TASK-127-validation-error-message`
  - `fix/TASK-128-database-connection-leak`

#### Refactoring Branches
- **Format**: `refactor/{task-id}-{brief-description}`
- **Purpose**: Code refactoring without changing behavior
- **Examples**:
  - `refactor/TASK-129-extract-use-case-logic`
  - `refactor/TASK-130-simplify-repository-interface`
  - `refactor/TASK-131-improve-error-handling`

#### Documentation Branches
- **Format**: `docs/{task-id}-{brief-description}`
- **Purpose**: Documentation updates
- **Examples**:
  - `docs/TASK-132-update-readme`
  - `docs/TASK-133-add-api-documentation`
  - `docs/TASK-134-architecture-diagrams`

#### Test Branches
- **Format**: `test/{task-id}-{brief-description}`
- **Purpose**: Adding or improving tests
- **Examples**:
  - `test/TASK-135-add-use-case-tests`
  - `test/TASK-136-improve-coverage`
  - `test/TASK-137-e2e-test-suite`

#### Chore Branches
- **Format**: `chore/{task-id}-{brief-description}`
- **Purpose**: Maintenance tasks, dependency updates
- **Examples**:
  - `chore/TASK-138-update-dependencies`
  - `chore/TASK-139-configure-ci-pipeline`
  - `chore/TASK-140-setup-docker-compose`

---

## Commit Message Format

### Structure

```
<type>: [taskId] brief description (single line only, max 72 characters)
```

**IMPORTANT**:
- Commit messages must be **single line only**
- No body, no footer, no co-author information
- No "Generated with Claude Code" or similar messages
- Keep it concise and descriptive

### Type Categories

| Type       | Purpose                                      | Example                                    |
|------------|----------------------------------------------|--------------------------------------------|
| `feat`     | New feature or enhancement                   | `feat: [TASK-123] add product list endpoint` |
| `fix`      | Bug fix                                      | `fix: [TASK-124] handle null in price calculation` |
| `refactor` | Code refactoring (no behavior change)        | `refactor: [TASK-125] extract validation to value object` |
| `test`     | Adding or updating tests                     | `test: [TASK-126] add missing controller tests` |
| `docs`     | Documentation changes                        | `docs: [TASK-127] update architecture guide` |
| `chore`    | Maintenance, dependencies, tooling           | `chore: [TASK-128] update eslint configuration` |
| `style`    | Code style changes (formatting, semicolons)  | `style: [TASK-129] apply prettier formatting` |
| `perf`     | Performance improvements                     | `perf: [TASK-130] optimize database queries` |
| `build`    | Build system or dependencies                 | `build: [TASK-131] upgrade to NestJS 11` |
| `ci`       | CI/CD configuration changes                  | `ci: [TASK-132] add github actions workflow` |

### Commit Message Rules

1. **Single line format**:
   - Maximum 72 characters
   - Start with type and task ID
   - Use imperative mood ("add" not "added" or "adds")
   - No period at the end
   - Be concise but descriptive
   - **No body, footer, or co-author lines**

### Good Commit Examples

```bash
# Feature commit
feat: [TASK-123] add product creation endpoint

# Fix commit
fix: [TASK-124] handle null pointer in price calculation

# Refactor commit
refactor: [TASK-125] extract validation to value object

# Test commit
test: [TASK-126] add missing use case tests

# Documentation commit
docs: [TASK-127] update architecture guide

# Chore commit
chore: [TASK-128] update eslint configuration
```

### Bad Commit Examples (Avoid)

```bash
# ❌ Too vague
fix: bug fix

# ❌ Missing task ID
feat: add products

# ❌ Past tense
feat: [TASK-123] added product endpoint

# ❌ Too long subject line
feat: [TASK-123] implemented the complete product CRUD functionality with all validations and error handling

# ❌ Multiple unrelated changes
feat: [TASK-123] add products, fix user bug, update docs

# ❌ Multi-line commit (NEVER DO THIS)
feat: [TASK-123] add product endpoint

Implements POST /products endpoint with validation.
Includes comprehensive tests.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Pull Request Guidelines

### PR Title Format

```
<type>: [taskId] brief description
```

Examples:
- `feat: [TASK-123] add product CRUD endpoints`
- `fix: [TASK-124] resolve null pointer in controller`
- `refactor: [TASK-125] improve use case structure`

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Changes
- List of specific changes
- Organized by layer (domain, application, infrastructure)
- Include test additions/modifications

## Related Issues
Closes #123
Related to #456

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests passing
- [ ] Coverage threshold met (95% lines, 90% branches)

## Architecture Compliance
- [ ] Layer boundaries respected
- [ ] No forbidden imports (infrastructure → domain/application)
- [ ] Business logic only in domain layer
- [ ] Use cases have ≤ 3 dependencies
- [ ] Interfaces use I-prefix
- [ ] DTOs use DTO-suffix
- [ ] Custom domain errors used appropriately

## Code Quality
- [ ] ESLint passing (no errors)
- [ ] Files < 300 lines
- [ ] Clear naming conventions followed
- [ ] No magic numbers (used constants/enums)
- [ ] No commented-out code

## Documentation
- [ ] README updated (if needed)
- [ ] Inline comments for complex logic
- [ ] API documentation updated (if applicable)
```

### PR Review Checklist

Reviewers should verify:

#### Architecture
- [ ] Hexagonal architecture principles followed
- [ ] Domain layer has no framework dependencies
- [ ] Application layer has no business logic
- [ ] Infrastructure layer properly implements domain contracts
- [ ] Dependency flow is correct (inward)

#### Code Quality
- [ ] Test coverage ≥ 95% (lines), 90% (branches)
- [ ] All tests passing
- [ ] ESLint passing
- [ ] TypeScript strict mode passing
- [ ] No code smells or anti-patterns

#### Naming & Organization
- [ ] File names follow kebab-case convention
- [ ] Interfaces have I-prefix
- [ ] DTOs have DTO-suffix
- [ ] Classes use PascalCase
- [ ] Functions use camelCase

#### Testing
- [ ] Controller tests use NestJS testing utilities
- [ ] Use case tests mock dependencies
- [ ] Domain tests have no mocks
- [ ] E2E tests cover critical paths

#### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] Public APIs documented
- [ ] Breaking changes noted

---

## Workflow Example

### 1. Create Feature Branch

```bash
# Ensure you're on develop and up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/TASK-123-add-product-crud
```

### 2. Make Changes

Follow TDD approach:
1. Write tests
2. Implement code
3. Refactor
4. Commit

### 3. Commit Changes

```bash
# Stage changes
git add src/domain/contracts/product-repository.interface.ts
git commit -m "feat: [TASK-123] add product repository interface"

git add src/application/use-cases/create-product.use-case.ts
git commit -m "feat: [TASK-123] add create product use case"

git add test/application/use-cases/create-product.use-case.spec.ts
git commit -m "test: [TASK-123] add create product use case tests"

# Stage more changes
git add src/infrastructure/controllers/product.controller.ts
git commit -m "feat: [TASK-123] add product controller endpoint"

git add test/infrastructure/controllers/product.controller.spec.ts
git commit -m "test: [TASK-123] add product controller tests"
```

### 4. Keep Branch Updated

```bash
# Regularly sync with develop
git fetch origin
git rebase origin/develop

# Or merge if preferred
git merge origin/develop
```

### 5. Push and Create PR

```bash
# Push feature branch
git push origin feature/TASK-123-add-product-crud

# Create PR via GitHub, GitLab, etc.
# Fill out PR template completely
```

### 6. Address Review Comments

```bash
# Make changes based on feedback
git add .
git commit -m "refactor: [TASK-123] address PR review comments"

git push origin feature/TASK-123-add-product-crud
```

### 7. Merge PR

```bash
# After approval, merge via UI
# Delete feature branch after merge
git branch -d feature/TASK-123-add-product-crud
```

---

## Common Scenarios

### Amending Last Commit

```bash
# Add forgotten changes to last commit
git add forgotten-file.ts
git commit --amend --no-edit

# Or update commit message
git commit --amend -m "feat: [TASK-123] improved commit message"

# Force push (only if not reviewed yet)
git push origin feature/TASK-123-add-product-crud --force
```

### Squashing Commits

```bash
# Interactive rebase to squash multiple commits
git rebase -i HEAD~3

# In editor, mark commits to squash:
# pick abc1234 feat: [TASK-123] add interface
# squash def5678 feat: [TASK-123] add use case
# squash ghi9012 feat: [TASK-123] add tests

# Force push
git push origin feature/TASK-123-add-product-crud --force
```

### Resolving Conflicts

```bash
# Pull latest from develop
git fetch origin
git rebase origin/develop

# Resolve conflicts in files
# After resolving:
git add resolved-file.ts
git rebase --continue

# Force push
git push origin feature/TASK-123-add-product-crud --force
```

### Cherry-Picking Commits

```bash
# Apply specific commit from another branch
git cherry-pick abc1234

# Resolve conflicts if any
git add .
git cherry-pick --continue
```

---

## Git Configuration

### Recommended Git Config

```bash
# Set user information
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Enable color output
git config --global color.ui auto

# Set default editor
git config --global core.editor "code --wait"

# Rebase by default when pulling
git config --global pull.rebase true

# Enable auto-correction
git config --global help.autocorrect 1
```

### Useful Git Aliases

```bash
# Add aliases to ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --decorate --all
    amend = commit --amend --no-edit
```

---

## Best Practices

### Do's ✅

1. **Commit Often**: Small, focused commits are better than large ones
2. **Write Clear Messages**: Future you will thank present you
3. **Test Before Committing**: Ensure tests pass before committing
4. **Keep Commits Atomic**: One logical change per commit
5. **Review Your Own PR**: Review diff before requesting reviews
6. **Update Branch Regularly**: Keep feature branch in sync with develop
7. **Delete Merged Branches**: Clean up after merging

### Don'ts ❌

1. **Don't Commit Secrets**: Never commit .env files or credentials
2. **Don't Force Push Shared Branches**: Only force push feature branches
3. **Don't Commit Debug Code**: Remove console.logs and debug statements
4. **Don't Commit Commented Code**: Delete it (git history preserves it)
5. **Don't Commit Generated Files**: Add them to .gitignore
6. **Don't Mix Concerns**: Keep refactoring separate from features
7. **Don't Skip Tests**: Always ensure tests pass

---

## Git Ignore Best Practices

The project's `.gitignore` should include:

```gitignore
# Dependencies
node_modules/
package-lock.json (if using yarn)

# Build output
dist/
build/

# Test coverage
coverage/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## Summary

Following these Git conventions ensures:
- **Consistent history**: Easy to understand project evolution
- **Clear communication**: Commit messages explain changes
- **Easy debugging**: Find when and why changes were made
- **Smooth collaboration**: Team follows same standards
- **Quality code**: PR checklist enforces best practices
- **Traceability**: Task IDs link code to requirements

Always remember: **Good Git practices are as important as good code practices.**
