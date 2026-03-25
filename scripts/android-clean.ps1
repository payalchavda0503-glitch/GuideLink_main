# Windows: Gradle clean sometimes fails on node_modules/*/android/build because lint JARs stay locked.
# 1) Stop daemons  2) Remove stuck build folder  3) Run gradlew clean
$ErrorActionPreference = "Continue"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$androidDir = Join-Path $repoRoot "android"

Set-Location $androidDir
Write-Host "Stopping Gradle daemons..."
& .\gradlew.bat --stop 2>$null
Start-Sleep -Seconds 2

# Common offender after lintVital (file locks under lint-cache)
$paths = @(
    (Join-Path $repoRoot "node_modules\@zoom\react-native-videosdk\android\build")
)
foreach ($p in $paths) {
    if (Test-Path -LiteralPath $p) {
        Write-Host "Removing locked folder: $p"
        Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Running gradlew clean..."
& .\gradlew.bat clean
exit $LASTEXITCODE
