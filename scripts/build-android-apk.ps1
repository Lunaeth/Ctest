$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$AndroidProject = Join-Path $RepoRoot 'android-app'
$OutputDir = Join-Path $RepoRoot 'dist'
$BuiltApk = Join-Path $AndroidProject 'app\build\outputs\apk\debug\app-debug.apk'
$FinalApk = Join-Path $OutputDir 'CompTIA-APlus-Ctest-debug.apk'
$LocalToolRoot = Join-Path $RepoRoot '.codex-runtime\android-toolchain'
$LocalJdk = Join-Path $LocalToolRoot 'jdk-17'
$LocalGradle = Join-Path $LocalToolRoot 'gradle-8.10.2'
$LocalSdk = Join-Path $LocalToolRoot 'android-sdk'

function Assert-Command($Name, $InstallHint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name not found. $InstallHint"
  }
}

if (Test-Path (Join-Path $LocalJdk 'bin\java.exe')) {
  $env:JAVA_HOME = $LocalJdk
  $env:PATH = "$LocalJdk\bin;$env:PATH"
}

if (Test-Path (Join-Path $LocalGradle 'bin\gradle.bat')) {
  $env:PATH = "$LocalGradle\bin;$env:PATH"
}

if (Test-Path $LocalSdk) {
  $sdkRoot = $LocalSdk
} else {
  $sdkRoot = $env:ANDROID_HOME
  if (-not $sdkRoot) {
    $sdkRoot = $env:ANDROID_SDK_ROOT
  }
}

if (-not $sdkRoot -or -not (Test-Path $sdkRoot)) {
  throw 'Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT to your Android SDK directory.'
}

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:PATH = "$sdkRoot\cmdline-tools\latest\bin;$sdkRoot\platform-tools;$env:PATH"

Assert-Command 'java' 'Install JDK 17 or newer and put java on PATH.'
Assert-Command 'gradle' 'Install Gradle 8.x or run this project with a Gradle wrapper.'

gradle -p $AndroidProject :app:assembleDebug
if ($LASTEXITCODE -ne 0) {
  throw "Gradle build failed with exit code $LASTEXITCODE."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
Copy-Item -LiteralPath $BuiltApk -Destination $FinalApk -Force

Write-Output "APK built: $FinalApk"
