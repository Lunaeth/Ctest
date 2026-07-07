# Android APK

This folder wraps the local A+ practice app in a native Android WebView.

- Default screen orientation: portrait.
- Start page: `#/practice`.
- Web assets are copied from the repository root during Gradle build.

Build from the repository root:

```powershell
.\scripts\build-android-apk.ps1
```

Requirements:

- JDK 17+
- Android SDK with platform 35 and build tools
- Gradle 8.x

Output:

```text
dist\CompTIA-APlus-Ctest-debug.apk
```
