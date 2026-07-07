$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$AndroidProject = Join-Path $RepoRoot 'android-app'
$OutputDir = Join-Path $RepoRoot 'dist'
$BuiltApk = Join-Path $AndroidProject 'app\build\outputs\apk\debug\app-debug.apk'
$FinalApk = Join-Path $OutputDir 'CompTIA-APlus-Ctest-debug.apk'

function Assert-Command($Name, $InstallHint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name not found. $InstallHint"
  }
}

$sdkRoot = $env:ANDROID_HOME
if (-not $sdkRoot) {
  $sdkRoot = $env:ANDROID_SDK_ROOT
}

if (-not $sdkRoot -or -not (Test-Path $sdkRoot)) {
  throw 'Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT to your Android SDK directory.'
}

Assert-Command 'java' 'Install JDK 17 or newer and put java on PATH.'
Assert-Command 'gradle' 'Install Gradle 8.x or run this project with a Gradle wrapper.'

gradle -p $AndroidProject :app:assembleDebug

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
Copy-Item -LiteralPath $BuiltApk -Destination $FinalApk -Force

Write-Output "APK built: $FinalApk"
