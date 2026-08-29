@echo off
REM === One-shot: push to GitHub + deploy to Vercel + wire notifications ===
REM Fill tokens below (or set as env vars) then run this script.
set GH_TOKEN=%GH_TOKEN%
set VERCEL_TOKEN=%VERCEL_TOKEN%
set TELEGRAM_BOT_TOKEN=%TELEGRAM_BOT_TOKEN%
set TELEGRAM_CHAT_ID=%TELEGRAM_CHAT_ID%
set LINE_TOKEN=%LINE_TOKEN%

REM 1. GitHub push
gh auth login --with-token < %GH_TOKEN% 2>nul
git remote remove origin 2>nul
git remote add origin https://github.com/%GH_USER%/ai-insurance-network-os.git
git push -u origin main --force

REM 2. Vercel deploy
npx vercel deploy --prod --token %VERCEL_TOKEN% --yes --name ai-insurance-network-os
REM After deploy, Vercel prints the URL.

REM 3. Set env vars on Vercel (so notifications work in prod)
npx vercel env add TELEGRAM_BOT_TOKEN %TELEGRAM_BOT_TOKEN% production --token %VERCEL_TOKEN%
npx vercel env add TELEGRAM_CHAT_ID %TELEGRAM_CHAT_ID% production --token %VERCEL_TOKEN%
npx vercel env add LINE_TOKEN %LINE_TOKEN% production --token %VERCEL_TOKEN%
echo DONE
