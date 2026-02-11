@echo off
echo Cleaning sensitive files from git history...
echo.

echo Step 1: Removing files from git history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.local functions/.env debug-api.js test-compass-format.js try-alternatives.js QUICK_FIX.md VERCEL_DEPLOYMENT_FIX.md" --prune-empty --tag-name-filter cat -- --all

echo.
echo Step 2: Cleaning up...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Step 3: Force pushing to GitHub...
git push origin --force --all

echo.
echo Done! Git history cleaned.
echo.
pause
