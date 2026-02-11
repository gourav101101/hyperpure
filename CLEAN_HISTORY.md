# Clean Git History - Simple Steps

## Option 1: Run the Script (Easiest)

```bash
# Just run this:
clean-git-history.bat
```

## Option 2: Manual Commands

```bash
# 1. Remove files from history
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.local functions/.env debug-api.js test-compass-format.js try-alternatives.js QUICK_FIX.md VERCEL_DEPLOYMENT_FIX.md" --prune-empty --tag-name-filter cat -- --all

# 2. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Force push
git push origin --force --all
```

## That's It!

After this, the credentials will be removed from git history.

⚠️ **Warning**: This rewrites git history. If others are working on this repo, coordinate with them first.
