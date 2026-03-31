@echo off
C:
cd \Users\info\Desktop\Forkfinder
git add .
git commit -m "fix: upgrade Next.js to 16.2.1, add proxy.ts (CVE patch)"
git push origin main
echo.
echo === Klar! ===
