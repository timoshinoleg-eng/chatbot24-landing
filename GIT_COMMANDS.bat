@echo off
chcp 65001 >nul
echo === Git Push Commands for ChatBot24 ===
echo.

REM Remove lock file if exists
del /f ".git\index.lock" 2>nul

REM Add all files
git add .

REM Create commit
git commit -m "Initial commit: Next.js 14 + Blog + Telegram automation"

echo.
echo === Next steps ===
echo 1. Create repository on GitHub: https://github.com/new
echo 2. Copy repository URL (e.g., https://github.com/username/chatbot24.git)
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git branch -M main
echo 5. Run: git push -u origin main
echo.
pause
