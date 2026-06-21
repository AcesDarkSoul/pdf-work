# How to Build APK for SkillWork App

This project uses **Capacitor** to build Android APK files. Follow these steps:

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Java JDK 11 or higher** (for Android build)
3. **Android Studio** (optional, but recommended)
4. **Android SDK** (installed via Android Studio or standalone)

## Step-by-Step Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

First, build your React/Vite app:

```bash
npm run build
```

This creates the `dist` folder with your production build.

### 3. Sync with Capacitor

Copy the built files to the Android project:

```bash
npx cap sync android
```

### 4. Build APK

You have two options:

#### Option A: Build Debug APK (for testing)

**Using Gradle (Command Line):**

```bash
cd android
./gradlew assembleDebug
```

**On Windows:**
```bash
cd android
gradlew.bat assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Build Release APK (for production)

**1. Generate a Keystore (first time only):**

```bash
keytool -genkey -v -keystore skillwork-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias skillwork
```

**2. Create `android/key.properties` file:**

```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=skillwork
storeFile=../skillwork-release-key.jks
```

**3. Update `android/app/build.gradle`** to use the keystore (see below)

**4. Build Release APK:**

```bash
cd android
./gradlew assembleRelease
```

**On Windows:**
```bash
cd android
gradlew.bat assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### 5. Build AAB (Android App Bundle) for Google Play Store

For Play Store upload, build AAB instead:

```bash
cd android
./gradlew bundleRelease
```

**On Windows:**
```bash
cd android
gradlew.bat bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## Using Android Studio (Alternative Method)

1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to your project and select the `android` folder
4. Wait for Gradle sync to complete
5. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
6. Wait for build to complete
7. Click "locate" to find your APK

## Quick Build Script

Create a file `build-apk.bat` (Windows) or `build-apk.sh` (Mac/Linux):

**Windows (`build-apk.bat`):**
```batch
@echo off
echo Building web app...
call npm run build
echo Syncing with Capacitor...
call npx cap sync android
echo Building APK...
cd android
call gradlew.bat assembleDebug
cd ..
echo APK built successfully!
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
pause
```

**Mac/Linux (`build-apk.sh`):**
```bash
#!/bin/bash
echo "Building web app..."
npm run build
echo "Syncing with Capacitor..."
npx cap sync android
echo "Building APK..."
cd android
./gradlew assembleDebug
cd ..
echo "APK built successfully!"
echo "Location: android/app/build/outputs/apk/debug/app-debug.apk"
```

Make it executable:
```bash
chmod +x build-apk.sh
```

Then run:
- Windows: `build-apk.bat`
- Mac/Linux: `./build-apk.sh`

## Troubleshooting

### Error: "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```
(Update path to your Android SDK location)

### Error: "Gradle sync failed"
- Make sure Java JDK 11+ is installed
- Check `android/gradle/wrapper/gradle-wrapper.properties` for correct Gradle version
- Try: `cd android && ./gradlew clean`

### Error: "Build failed"
- Clean build: `cd android && ./gradlew clean`
- Rebuild: `cd android && ./gradlew assembleDebug`

## Important Notes

- **Debug APK**: Larger file size, includes debug symbols, not optimized
- **Release APK**: Smaller, optimized, requires signing with keystore
- **AAB**: Required for Google Play Store upload (smaller than APK)

## Testing the APK

1. Enable "Developer Options" on your Android device
2. Enable "USB Debugging"
3. Connect device via USB
4. Install APK:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

Or simply transfer the APK to your device and install it manually.
