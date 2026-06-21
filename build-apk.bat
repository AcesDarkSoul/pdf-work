@echo off
echo ========================================
echo   Building SkillWork APK
echo ========================================
echo.

echo [1/3] Building web app...
call npm run build
if errorlevel 1 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)
echo ✓ Web app built successfully
echo.

echo [2/3] Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo ✓ Capacitor sync completed
echo.

echo [3/3] Building Android APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: APK build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo   ✓ APK Built Successfully!
echo ========================================
echo.
echo APK Location:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now install this APK on your Android device.
echo.
pause
