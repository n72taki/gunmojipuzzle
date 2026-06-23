$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$python = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if (-not (Test-Path -LiteralPath $python)) {
  $python = "python"
}

$env:RANKING_HOST = "127.0.0.1"
$env:RANKING_PORT = "8787"
$env:RANKING_CONFIG_PATH = "server\ranking-config.json"
$env:RANKING_DB_PATH = "server\ranking.sqlite3"

Set-Location -LiteralPath $projectRoot
& $python server\ranking-server.py
