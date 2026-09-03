#!/usr/bin/env pwsh
# dev.ps1 - 로컬 개발 서버 제어 (Astro 백그라운드 모드 래퍼)
#
#   .\dev.ps1            서버 시작 (= start)
#   .\dev.ps1 start      서버 시작 (백그라운드)
#   .\dev.ps1 stop       서버 종료
#   .\dev.ps1 status     실행 여부 확인
#   .\dev.ps1 logs       로그 보기
#   .\dev.ps1 logs -Follow   로그 실시간 보기
#   .\dev.ps1 restart    재시작

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet('start', 'stop', 'status', 'logs', 'restart')]
  [string]$Command = 'start',

  [switch]$Follow
)

# 이 스크립트 위치를 기준으로 실행 (어디서 호출하든 동작)
Set-Location -LiteralPath $PSScriptRoot

$url = 'http://localhost:4321/'

switch ($Command) {
  'start' {
    node scripts/sync-lectures.mjs
    npx astro dev --background
    Write-Host ""
    Write-Host "  개발 서버: $url" -ForegroundColor Green
    Write-Host ""
  }
  'stop' {
    npx astro dev stop
  }
  'status' {
    npx astro dev status
  }
  'logs' {
    if ($Follow) { npx astro dev logs --follow } else { npx astro dev logs }
  }
  'restart' {
    npx astro dev stop
    node scripts/sync-lectures.mjs
    npx astro dev --background
    Write-Host ""
    Write-Host "  개발 서버 재시작: $url" -ForegroundColor Green
    Write-Host ""
  }
}
