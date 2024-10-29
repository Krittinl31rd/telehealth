@echo off
cd /d D:\nodejs\telehealth\medical_rtc
start cmd /k "npm run dev"

cd /d D:\nodejs\telehealth\frontend
start cmd /k "npm run dev"

cd /d D:\nodejs\telehealth\NodeTelehealth
start cmd /k "npm run dev"
