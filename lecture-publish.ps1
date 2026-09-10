# 과목별 공개 주차를 독립적으로 저장하고 재배포한다. 콘텐츠 커밋은 필요 없다.
[CmdletBinding()]
param([string]$Course, [string]$Weeks)
$ErrorActionPreference = 'Stop'
$repo = 'milab-pnu/milab-pnu.github.io'
$courses = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'lectures.config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $Course) {
  Write-Host '과목 목록:'
  $courses | ForEach-Object { Write-Host "  $($_.slug)" }
  $Course = Read-Host '과목 slug (예: 2026f-applied-data-science)'
}
$selected = @($courses | Where-Object {
  $_.slug -ceq $Course
})
if ($selected.Count -ne 1) { throw '과목이 없거나 이름이 중복됩니다. 목록의 전체 slug를 입력하세요.' }
$variable = 'LECTURE_' + $selected[0].slug.Replace('-', '_').ToUpperInvariant() + '_PUBLIC_WEEKS'
if (-not $Weeks) { $Weeks = Read-Host '공개할 주차 (예: 1,2 / all / none)' }
$Weeks = $Weeks.Trim().ToLowerInvariant()
if ($Weeks -notmatch '^(all|none|[1-9]\d*(\s*,\s*[1-9]\d*)*)$') {
  throw 'all, none 또는 1,2 같은 주차 목록을 입력하세요.'
}
gh variable set $variable --repo $repo --body $Weeks
if ($LASTEXITCODE -ne 0) { throw '공개 설정 저장 실패. gh auth login을 확인하세요.' }
gh workflow run deploy.yml --repo $repo --ref main
if ($LASTEXITCODE -ne 0) { throw '설정은 저장되었지만 재배포 시작에 실패했습니다. Actions에서 Deploy를 실행하세요.' }
Write-Host "과목: $($selected[0].slug) · 공개 주차: $Weeks · 재배포를 요청했습니다. 반영까지 잠시 걸립니다."
