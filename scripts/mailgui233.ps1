param(
  [ValidateSet("install", "uninstall", "use", "status")]
  [string]$Command = "install",
  [string]$Version = "latest",
  [string]$InstallerPath = "",
  [switch]$Source
)

$ErrorActionPreference = "Stop"
$Repo = "neko233-com/MailGUI233"
$AppName = "MailGUI233"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

function Get-InstalledPath {
  $candidates = @(
    "$env:LOCALAPPDATA\Programs\MailGUI233\MailGUI233.exe",
    "$env:ProgramFiles\MailGUI233\MailGUI233.exe",
    "$Root\src-tauri\target\release\mailgui233.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return $candidate
    }
  }

  return $null
}

function Install-FromSource {
  Push-Location $Root
  try {
    npm ci --prefer-offline
    npm run build
  } finally {
    Pop-Location
  }
}

function Get-LatestInstaller {
  $api = if ($Version -eq "latest") {
    "https://api.github.com/repos/$Repo/releases/latest"
  } else {
    "https://api.github.com/repos/$Repo/releases/tags/$Version"
  }
  $release = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "MailGUI233-Agent" }
  $asset = $release.assets | Where-Object { $_.name -match "setup\.exe$" } | Select-Object -First 1

  if (-not $asset) {
    throw "No Windows setup.exe asset found for $($release.tag_name)."
  }

  $target = Join-Path $env:TEMP $asset.name
  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $target -Headers @{ "User-Agent" = "MailGUI233-Agent" }
  return $target
}

switch ($Command) {
  "install" {
    if ($Source) {
      Install-FromSource
      Write-Host "$AppName source dependencies are ready."
      break
    }

    $installer = if ($InstallerPath) { $InstallerPath } else { Get-LatestInstaller }
    Write-Host "Installing $AppName from $installer"
    Start-Process -FilePath $installer -ArgumentList "/S" -Wait
    Write-Host "$AppName install command completed."
  }
  "uninstall" {
    $keys = @(
      "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
      "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )
    $entry = Get-ItemProperty $keys -ErrorAction SilentlyContinue |
      Where-Object { $_.DisplayName -like "*MailGUI233*" } |
      Select-Object -First 1

    if ($entry) {
      $command = if ($entry.QuietUninstallString) { $entry.QuietUninstallString } else { $entry.UninstallString }
      Start-Process -FilePath "powershell" -ArgumentList "-NoProfile", "-Command", $command -Wait
      Write-Host "$AppName uninstall command completed."
    } else {
      Write-Host "$AppName is not registered as installed."
    }
  }
  "use" {
    $path = Get-InstalledPath

    if ($path) {
      Start-Process -FilePath $path
      Write-Host "Launched $path"
    } else {
      Push-Location $Root
      try {
        npm run dev
      } finally {
        Pop-Location
      }
    }
  }
  "status" {
    $path = Get-InstalledPath
    Write-Host "$AppName root: $Root"
    Write-Host "$AppName installed path: $(if ($path) { $path } else { 'not found' })"
    Push-Location $Root
    try {
      npm run package:size
    } finally {
      Pop-Location
    }
  }
}
