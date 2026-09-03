#!/usr/bin/env pwsh
# new-lecture.ps1 - 새 강의: GitHub repo 생성 + 작업 폴더 클론 + 스캐폴드 + Discussions + secret
#
#   .\scripts\new-lecture.ps1 -Slug 2027s-machine-learning `
#       -Path ..\lectures\2027-01\machine_learning
#
#   -Pat 을 주면 MILAB_DEPLOY_TOKEN secret 까지 등록:
#   .\scripts\new-lecture.ps1 -Slug ... -Path ... -Pat github_pat_xxxxx
#
# 스크립트가 끝나면 (1) course.md 내용 채우기 (2) lectures.config.json 에 한 줄 추가
# 만 하면 된다 (마지막에 정확한 줄을 출력해 줌).

[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$Slug,
  [Parameter(Mandatory)][string]$Path,        # 작업 클론 폴더 (milab-pnu 기준 상대 or 절대)
  [string]$Pat,
  [string]$Description = ""
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$owner = 'milab-pnu'
$repo = "$owner/$Slug"
$root = Split-Path $PSScriptRoot -Parent            # milab-pnu/
$tpl = Join-Path $PSScriptRoot 'lecture-template'

if ($Slug -notmatch '^[a-z0-9][a-z0-9-]*$') {
  throw "Slug 은 소문자·숫자·하이픈만 가능: '$Slug'"
}

$work = if ([System.IO.Path]::IsPathRooted($Path)) { $Path }
        else { Join-Path $root $Path }
if (Test-Path $work) { throw "이미 존재하는 경로: $work" }

Write-Host "1) GitHub repo 생성  $repo" -ForegroundColor Cyan
gh repo create $repo --public --description $Description

Write-Host "2) 클론  ->  $work" -ForegroundColor Cyan
git clone "https://github.com/$repo.git" $work

Write-Host "3) 스캐폴드 파일 복사" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path `
  (Join-Path $work '.github\workflows'), (Join-Path $work 'weeks') | Out-Null
Copy-Item (Join-Path $tpl 'notify.yml')     (Join-Path $work '.github\workflows\notify.yml')
Copy-Item (Join-Path $tpl '.gitattributes') (Join-Path $work '.gitattributes')
Copy-Item (Join-Path $tpl 'course.md')      (Join-Path $work 'course.md')
Copy-Item (Join-Path $tpl 'week-note.md')   (Join-Path $work 'weeks\01-intro.md')
"# $Slug`n`nMI Lab 강의 콘텐츠. course.md / weeks/*.md 수정 후 ``git push`` 하면 사이트 자동 반영.`nhttps://milab-pnu.github.io/lecture/$Slug`n" |
  Set-Content -Encoding utf8 (Join-Path $work 'README.md')

Push-Location $work
git add -A
git commit -q -m "초기 스캐폴드 (new-lecture.ps1)"
git push -q origin main
Pop-Location

Write-Host "4) Discussions 활성화" -ForegroundColor Cyan
gh repo edit $repo --enable-discussions

Write-Host "5) MILAB_DEPLOY_TOKEN secret" -ForegroundColor Cyan
if ($Pat) {
  $Pat | gh secret set MILAB_DEPLOY_TOKEN -R $repo
  Write-Host "   등록 완료" -ForegroundColor Green
} else {
  Write-Host "   -Pat 미지정. 수동으로:" -ForegroundColor Yellow
  Write-Host "     gh secret set MILAB_DEPLOY_TOKEN -R $repo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "== 남은 일 2가지 ==" -ForegroundColor Green
Write-Host "  (1) $work\course.md 를 실제 내용으로 수정 -> git push"
Write-Host "  (2) milab-pnu\lectures.config.json 에 아래 항목 추가 후 커밋/푸시:"
Write-Host ""
Write-Host "  { `"slug`": `"$Slug`", `"repo`": `"https://github.com/$repo.git`", `"ref`": `"main`" }" -ForegroundColor White
Write-Host ""
