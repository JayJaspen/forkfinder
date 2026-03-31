@echo off
cd /d "C:\Users\info\Desktop\Forkfinder"
"C:\Program Files\nodejs\npx.cmd" create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias @/* --no-turbopack --yes
