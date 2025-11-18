# Commit Guidelines for Claude Code & Git Expert

## Critical Rules

### 1. Single-Line Commits ONLY
- **NEVER** create multi-line commits
- **NEVER** add commit body or footer
- **NEVER** add co-author information
- **NEVER** add "Generated with Claude Code" messages
- **NEVER** use HEREDOC for commit messages

### 2. Commit Message Format

```bash
<type>: [TASK-ID] brief description
```

**Examples:**
```bash
feat: [TASK-184730] add product repository interface
fix: [TASK-184730] handle null pointer in service
docs: [TASK-184730] update architecture documentation
test: [TASK-184730] add use case unit tests
refactor: [TASK-184730] extract validation logic
chore: [TASK-184730] update dependencies
```

### 3. What NOT to Do

❌ **WRONG** - Multi-line with body:
```bash
git commit -m "$(cat <<'EOF'
feat: [TASK-123] add feature

This adds a new feature with validation.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

✅ **CORRECT** - Single line:
```bash
git commit -m "feat: [TASK-123] add feature"
```

### 4. One Commit Per File

When user requests commits, create **one commit per file** unless files are logically grouped:

```bash
# Good - one commit per file
git add src/domain/interface.ts
git commit -m "feat: [TASK-123] add domain interface"

git add src/application/use-case.ts
git commit -m "feat: [TASK-123] add use case implementation"

git add test/use-case.spec.ts
git commit -m "test: [TASK-123] add use case tests"
```

### 5. Always Ask for Confirmation

Before executing any commit:
1. Show the file(s) to be committed
2. Show the proposed commit message
3. Wait for user approval
4. Execute the commit only after approval

### 6. Commit Types

| Type | Use Case |
|------|----------|
| `feat` | New features or enhancements |
| `fix` | Bug fixes |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `refactor` | Code refactoring (no behavior change) |
| `chore` | Maintenance, dependencies, tooling |
| `style` | Code style/formatting |
| `perf` | Performance improvements |
| `build` | Build system changes |
| `ci` | CI/CD configuration |

### 7. Task ID Format

Always use the exact task ID provided by the user:
- Format: `[TASK-{number}]`
- Example: `[TASK-184730]`

### 8. Message Length

- Maximum 72 characters
- Use imperative mood ("add" not "added")
- No period at the end
- Be descriptive but concise

---

## Implementation for Git Expert Agent

When acting as git-expert:

1. **Review staged and unstaged files**
2. **Group files logically** (e.g., interface + implementation, or test + test fixture)
3. **Propose one commit at a time**
4. **Wait for user confirmation**
5. **Execute commit with simple -m flag**
6. **Move to next file/group**

### Example Workflow

```bash
# 1. Check status
git status

# 2. Propose first commit
"Ready to commit: src/domain/interface.ts
Message: feat: [TASK-123] add domain interface
Approve? (yes/no)"

# 3. After approval, execute
git add src/domain/interface.ts
git commit -m "feat: [TASK-123] add domain interface"

# 4. Repeat for next file
"Ready to commit: src/application/use-case.ts
Message: feat: [TASK-123] add use case implementation
Approve? (yes/no)"
```

---

## Summary

**Remember:**
- ✅ Single line only
- ✅ No co-author
- ✅ No "Generated with" messages
- ✅ Simple `git commit -m "message"`
- ✅ One commit per file (or logical group)
- ✅ Always ask for confirmation
- ✅ Use correct task ID format

**Never:**
- ❌ Multi-line commits
- ❌ HEREDOC syntax
- ❌ Body or footer
- ❌ Co-author lines
- ❌ Marketing messages
