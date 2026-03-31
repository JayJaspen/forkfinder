@echo off
C:
cd \Users\info\Desktop\Forkfinder
git init
git add .
git commit -m "Initial commit: ForkFinder.se – Sveriges bästa restaurangguide"
git branch -M main
git remote add origin https://github.com/jaspen/forkfinder.git
git push -u origin main
echo.
echo === Git setup klar! ===
