# 데이터사이언스 공개 주차를 저장하고 재배포한다. 콘텐츠 커밋은 필요 없다.
[CmdletBinding()]
param([string]$Weeks)
$ErrorActionPreference = 'Stop'
$repo = 'milab-pnu/milab-pnu.github.io'
if (-not $Weeks) { $Weeks = Read-Host '공개할 주차 (예: 1,2 / all / none)' }
$Weeks = $Weeks.Trim().ToLowerInvariant()
if ($Weeks -notmatch '^(all|none|[1-9]\d*(\s*,\s*[1-9]\d*)*)$') {
  throw 'all, none 또는 1,2 같은 주차 목록을 입력하세요.'
}
gh variable set ADS_PUBLIC_WEEKS --repo $repo --body $Weeks
if ($LASTEXITCODE -ne 0) { throw '공개 설정 저장 실패. gh auth login을 확인하세요.' }
gh workflow run deploy.yml --repo $repo --ref main
if ($LASTEXITCODE -ne 0) { throw '설정은 저장되었지만 재배포 시작에 실패했습니다. Actions에서 Deploy를 실행하세요.' }
Write-Host "공개 주차: $Weeks · 재배포를 요청했습니다. 반영까지 잠시 걸립니다."
