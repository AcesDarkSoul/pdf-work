@echo off
echo ========================================
echo   Building SkillWork Release APK
echo ========================================
echo.
echo NOTE: This requires a keystore file for signing.
echo If you don't have one, use build-apk.bat for debug APK.
echo.

set /p continue="Continue? (Y/N): "
if /i not "%continue%"=="Y" exit /b 0

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

echo [3/3] Building Release APK...
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo ERROR: Release APK build failed!
    echo Make sure you have configured signing in android/app/build.gradle
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo   ✓ Release APK Built Successfully!
echo ========================================
echo.
echo APK Location:
echo   android\app\build\outputs\apk\release\app-release.apk
echo.
echo This APK is signed and ready for distribution.
echo.
pause
