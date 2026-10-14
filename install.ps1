$ErrorActionPreference = "Stop"

if ($env:OS -ne "Windows_NT") {
    throw "This installer is for Windows. Use install.sh on Mac or Linux."
}

$nativeArch = $env:PROCESSOR_ARCHITEW6432
if (-not $nativeArch) {
    $nativeArch = $env:PROCESSOR_ARCHITECTURE
}
switch ($nativeArch) {
    "ARM64" { $arch = "arm64" }
    "AMD64" { $arch = "x64" }
    default { throw "Unsupported processor: $nativeArch" }
}

$archive = "stay-sharp-bun-windows-$arch.zip"
$releaseUrl = "https://github.com/zhinit/stay-sharp/releases/latest/download"
$tempDir = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid().ToString())
$installDir = Join-Path $env:LOCALAPPDATA "StaySharp\bin"

try {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    $archivePath = Join-Path $tempDir $archive
    $checksumsPath = Join-Path $tempDir "checksums.txt"

    Write-Host "Downloading StaySharp for Windows ($arch)..."
    Invoke-WebRequest -UseBasicParsing -Uri "$releaseUrl/$archive" -OutFile $archivePath
    Invoke-WebRequest -UseBasicParsing -Uri "$releaseUrl/checksums.txt" -OutFile $checksumsPath

    $expected = $null
    foreach ($line in Get-Content -LiteralPath $checksumsPath) {
        $fields = $line.Trim() -split '\s+', 2
        if ($fields.Count -eq 2 -and $fields[1] -eq $archive) {
            $expected = $fields[0]
            break
        }
    }
    $actual = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
    if (-not $expected -or $actual -ne $expected) {
        throw "Download checksum verification failed."
    }

    $extractDir = Join-Path $tempDir "extracted"
    Expand-Archive -LiteralPath $archivePath -DestinationPath $extractDir
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $extractDir "stay-sharp.exe") -Destination (Join-Path $installDir "stay-sharp.exe") -Force

    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (($userPath -split ';') -notcontains $installDir) {
        $newPath = (@($userPath, $installDir) | Where-Object { $_ }) -join ';'
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    }
    if (($env:Path -split ';') -notcontains $installDir) {
        $env:Path = "$installDir;$env:Path"
    }

    Write-Host "Installed StaySharp to $installDir\stay-sharp.exe"
    Write-Host "Run stay-sharp to get started."
}
finally {
    if (Test-Path -LiteralPath $tempDir) {
        Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
}
