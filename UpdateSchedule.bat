@echo off
python "C:\Users\clark\OneDrive\Desktop\Master_Schedule\Schedule_V3.py"
@echo off
:: Add all changes to the staging area
git add .

:: Get the current date and time
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set datetime=%%i
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%
set hour=%datetime:~8,2%
set minute=%datetime:~10,2%
set second=%datetime:~12,2%
set current_time=%year%-%month%-%day% %hour%:%minute%:%second%

:: Commit changes with a message that includes the current date and time
git commit -m "Automated commit. Updated: %current_time%"

:: Push changes to the 'main' branch of the 'origin' remote repository
git push origin main

pause
