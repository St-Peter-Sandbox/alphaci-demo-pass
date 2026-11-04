[CmdletBinding(SupportsShouldProcess)]
param(
    [string] $FrontendRepository,
    [string] $BackendRepository,
    [switch] $ReplaceStarter
)
$ErrorActionPreference = 'Stop'

function Copy-App([string] $Kind, [string] $Destination) {
    if (-not $Destination) { return }
    $source = Join-Path $PSScriptRoot $Kind
    if (-not (Test-Path -LiteralPath $source -PathType Container)) {
        throw "Run the Copy-Demo.ps1 shipped at the root of a cloned sample repository."
    }
    $target = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Destination).Path).TrimEnd('\', '/')
    $gitRoot = & git -C $target rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -ne 0 -or [IO.Path]::GetFullPath($gitRoot).TrimEnd('\', '/') -ne $target) {
        throw "Destination must be the root of an existing Git clone: $target"
    }
    if ($target -eq [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\', '/')) {
        throw 'The destination must not be this sample repository.'
    }
    $dirty = & git -C $target status --porcelain
    if ($dirty) { throw "Commit or preserve existing changes before copying into $target" }
    if (-not $ReplaceStarter) {
        throw 'Use -ReplaceStarter to replace the generated src/tests and matching build configuration. Use -WhatIf to preview.'
    }

    $cleanup = @('src', 'tests')
    if ($Kind -eq 'frontend') {
        $cleanup += @(Get-ChildItem -LiteralPath $target -File | Where-Object {
            $_.Name -match '^(jest|vite|eslint)\.config\.' -or $_.Name -match '^tsconfig(\..+)?\.json$'
        } | Select-Object -ExpandProperty Name)
    } else {
        $cleanup += @(Get-ChildItem -LiteralPath $target -File | Where-Object { $_.Extension -in @('.sln', '.slnx') } | Select-Object -ExpandProperty Name)
    }
    foreach ($relative in $cleanup) {
        $path = [IO.Path]::GetFullPath((Join-Path $target $relative))
        if (-not $path.StartsWith($target + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Cleanup escaped the destination: $path"
        }
        if ((Test-Path -LiteralPath $path) -and $PSCmdlet.ShouldProcess($path, 'Replace starter files')) {
            Remove-Item -LiteralPath $path -Recurse -Force
        }
    }

    $sourceRoot = [IO.Path]::GetFullPath($source).TrimEnd('\', '/')
    Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Force | Where-Object {
        $_.FullName -notmatch '[\\/](node_modules|bin|obj|coverage|dist|TestResults[^\\/]*|test-results|playwright-report|\.git|\.github)[\\/]' -and
        $_.Name -ne 'test-results.json' -and
        ($_.Name -notmatch '^\.env($|\.)' -or $_.Name -eq '.env.example')
    } | ForEach-Object {
        $relative = $_.FullName.Substring($sourceRoot.Length).TrimStart('\', '/')
        if ($relative -in @('sonar-project.properties', '.editorconfig') -and (Test-Path -LiteralPath (Join-Path $target $relative))) { return }
        $to = Join-Path $target $relative
        if ($PSCmdlet.ShouldProcess($to, "Copy $Kind demo file")) {
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $to) | Out-Null
            Copy-Item -LiteralPath $_.FullName -Destination $to -Force
        }
    }
    if ($WhatIfPreference) { Write-Host "$Kind copy preview complete." }
    else { Write-Host "$Kind files copied to $target. Review git diff before committing." }
}

if (-not $FrontendRepository -and -not $BackendRepository) {
    throw 'Supply -FrontendRepository, -BackendRepository, or both.'
}
Copy-App 'frontend' $FrontendRepository
Copy-App 'backend' $BackendRepository
