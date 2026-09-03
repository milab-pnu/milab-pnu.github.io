# GitHub 개인계정 → organization 이전 설계

**날짜:** 2026-09-03
**상태:** 설계 승인 대기

## 배경

개인 계정 `jaehoonoh-pnu` 가 GitHub 어뷰징 탐지로 **완전 정지**되었다 (로그인·push·Pages·gh
전부 차단, 복구 시점 불명). 원인은 `gh discussion create` 를 짧은 시간에 여러 repo에 걸쳐
몰아친 것. 이 계정 아래 세 repo 가 서로 얽혀 사이트가 돌아간다:

| repo | 로컬 클론 | 역할 |
|---|---|---|
| `jaehoonoh-pnu/milab` | `pnu/milab-pnu/` | Astro 사이트. GitHub Pages `https://jaehoonoh-pnu.github.io/milab/` |
| `jaehoonoh-pnu/2026f-advanced-deep-learning` | `pnu/lectures/2026-02/advanced_deep_learning/` | 강의 콘텐츠 (public) |
| `jaehoonoh-pnu/2026f-applied-data-science` | `pnu/lectures/2026-02/applied_data_science/` | 강의 콘텐츠 (public) |

**목표:** 세 repo를 새 organization `milab-pnu` 아래로 이전하고, 그 과정에서
GitHub Discussions 관련 코드·문서·설정을 전부 제거한다. 실수 시 피해가 크므로
(콘텐츠 유실·사이트 다운·계정 재정지) 단계별 검증 게이트를 둔다.

## 확정 사항

- **새 개인 계정:** `jaehoon-oh` (Google 로그인으로 이미 생성). org owner가 됨.
- **org 이름:** `milab-pnu` (생성 시 가용성 확인, 안 되면 `pnu-milab`).
- **정지 계정 `jaehoonoh-pnu`:** 이번 작업에서 **안 건드림**. 복구되면 org에 2번째 owner로 추가.
- **기존 3개 repo:** 그대로 방치 (정지라 손 못 댐). 복구 후 archive/삭제는 별도 작업.
- **커밋 신원:** `jaehoon-oh` 의 GitHub noreply 이메일
  (`<numeric-id>+jaehoon-oh@users.noreply.github.com`, id는 실행 중 확인). 개인 메일 0 노출.
  과거 커밋의 옛 noreply(`321630286+jaehoonoh-pnu@users.noreply.github.com`)는 PII가 아니라 그대로 둠.
- **히스토리:** 보존 (squash 안 함). milab 81커밋은 보안리뷰가 `git log -p` 스캔 완료, 강의 repo에도 secret 없음.
- **Pages 주소:** 루트로. 사이트 repo 이름을 **`milab-pnu.github.io`** 로 하여
  `https://milab-pnu.github.io/` 에 서빙. `astro.config.mjs` 의 `base: '/milab'` 제거.
- **강의 repo 이름:** `2026f-advanced-deep-learning`, `2026f-applied-data-science` 유지 (소유자만 변경).

## 전략: transfer가 아니라 fresh push

정지된 계정에서는 GitHub "Transfer repository" 를 못 쓴다 (원본 계정이 정상이어야 함).
세 repo 모두 **로컬에 전체 히스토리 클론**이 있고(shallow 아님, dirty 없음, `main` 단일 브랜치,
태그·stash 없음) 원본이 안전하므로, **org에 빈 repo를 만들고 로컬을 push** 한다.

미푸시 로컬 커밋(정지 때문에 못 올린 것): milab 1개 · advanced-deep-learning 4개 ·
applied-data-science 16개 → 전부 새 repo로 간다.

## base 제거 안전성 (검증 완료)

`dist/` 빌드 산출물을 실제로 확인: 파일이 `dist/lecture/…`, `dist/_astro/…` 에 있고
`dist/milab/` 로 **중첩되지 않는다**. `base` 는 HTML 안 링크 문자열에만 `/milab` 을 붙일 뿐.
따라서 `base` 를 제거하면:

- `dist/` 구조 불변 → `scripts/check-lecture-notes.mjs` 의 `^lecture/…` 정규식 그대로 통과.
- 코드가 이미 `withBase()` / `import.meta.env.BASE_URL` 로 base를 추상화 (`src/consts.ts`).
  `BASE_URL` 이 `/` 가 되면 `withBase("/foo")` → `/foo`.
- `HeadMeta.astro` 의 canonical = `new URL(Astro.url.pathname, Astro.site)` →
  `https://milab-pnu.github.io/members/` 로 정상.
- `check-lecture-notes.mjs` 에 "노트 0개면 실패" 가드(line 89)가 있어 사고 시 조용히 통과 안 됨.

## 절차

### Phase 0 — 백업 (되돌림 보장)

세 repo 각각 전체 히스토리 번들 생성 (scratchpad에), `git bundle verify` 로 검증.

```
git -C <repo> bundle create <scratchpad>/<name>-2026-09-03.bundle --all
git bundle verify <scratchpad>/<name>-2026-09-03.bundle
```

이 시점 이후 무슨 일이 있어도 `git clone <bundle>` 로 완전 복원 가능.

### Phase 1 — 계정 인증 + org·repo 생성 + 원본 히스토리 push

**사용자 (브라우저):**

1. `jaehoon-oh` 로 로그인. Settings → Emails → **Keep my email addresses private** +
   **Block command line pushes that expose my email** 체크. noreply 이메일 문자열 기록.
2. Settings → Emails 하단 또는 `https://api.github.com/users/jaehoon-oh` 의 `id` 로
   numeric id 확인 → `<id>+jaehoon-oh@users.noreply.github.com`.
3. organization 생성: 이름 `milab-pnu`, Free 플랜, contact email = 연구실 메일 (공개 안 됨).
4. org 안에 **완전히 빈** repo 3개 생성 (Add README / .gitignore / license 전부 해제):
   - `milab-pnu.github.io` — **Public**
   - `2026f-advanced-deep-learning` — **Public**
   - `2026f-applied-data-science` — **Public**

> ⚠️ 새 계정이 짧은 시간에 API를 몰아치면 또 정지된다. repo는 웹 UI로 하나씩,
> push는 정상 횟수로. `gh` 루프 금지.

**사용자 (세션에서):** `jaehoon-oh` 로 git/gh 인증.
`! gh auth login` (git credential helper까지 설정됨) 또는 PAT를 credential manager에 등록.

**Claude (로컬):** 각 클론에서 origin을 교체하고 현재 히스토리를 그대로 push.

```
# pnu/milab-pnu
git remote rename origin jaehoonoh-pnu-old
git remote add origin https://github.com/milab-pnu/milab-pnu.github.io.git
git push -u origin main

# pnu/lectures/2026-02/advanced_deep_learning
git remote rename origin jaehoonoh-pnu-old
git remote add origin https://github.com/milab-pnu/2026f-advanced-deep-learning.git
git push -u origin main

# pnu/lectures/2026-02/applied_data_science
git remote rename origin jaehoonoh-pnu-old
git remote add origin https://github.com/milab-pnu/2026f-applied-data-science.git
git push -u origin main
```

`jaehoonoh-pnu-old` 원격은 동작하지 않지만 참조용 라벨로 남긴다.
검증: 각 repo GitHub 페이지에서 커밋 수·최신 커밋 SHA가 로컬과 일치하는지 확인.

### Phase 2 — milab 사이트 코드 수정 (커밋 여러 개, push 전 로컬 빌드)

작업 브랜치 `chore/migrate-to-org` 권장 (한 diff로 검토 후 main 머지).

**2a. base 제거 + site 변경 — `astro.config.mjs`**

```
site: 'https://milab-pnu.github.io',
```
- `base: '/milab',` 줄 **삭제** (Astro 기본 base = `/`).
- line 27~28 주석을 org site 기준으로 갱신.

**2b. 주소 문자열 치환 (`jaehoonoh-pnu` → `milab-pnu`, `/milab` base 흔적 제거)**

| 파일 | 변경 |
|---|---|
| `lectures.config.json` | 두 repo URL → `https://github.com/milab-pnu/2026f-*.git` |
| `dev.ps1` | `$url = 'http://localhost:4321/'` |
| `README.md` | dev URL `http://localhost:4321/`, 공개 URL `https://milab-pnu.github.io/`, `-R milab-pnu/milab-pnu.github.io`, PAT repo access `milab-pnu.github.io`, `gh secret set … -R milab-pnu/<slug>`, "배포(GitHub Pages)" 절을 org pages 기준으로 |
| `package.json` | `"name": "milab-pnu"` (선택, 저위험) |
| `scripts/lecture-template/notify.yml` | 주석 `repo=milab-pnu/milab-pnu.github.io`, `-R milab-pnu/milab-pnu.github.io` |
| `scripts/new-lecture.ps1` | `$owner = 'milab-pnu'`, 생성 README URL `https://milab-pnu.github.io/lecture/$Slug` |
| `src/consts.ts` | line 26·30 주석을 루트 서빙 기준으로 (코드 변경 없음) |
| `CLAUDE.md`, `AGENTS.md` | dev URL `http://localhost:4321/` |
| `docs/lecture-authoring.md` | line 22~23 `= github.com/milab-pnu/…`, line 40 dev URL |
| `docs/superpowers/specs/2026-08-27-*.md` | `jaehoonoh-pnu` 8군데 → `milab-pnu` / `milab-pnu/milab-pnu.github.io`, 라이브 경로 `/lecture/…` (prose·날짜 불변) |
| `docs/superpowers/specs/2026-08-28-*.md` | `jaehoonoh-pnu/<slug>` → `milab-pnu/<slug>` |

**2c. Discussions 제거**

| 파일 | 변경 |
|---|---|
| `src/content.config.ts` | `discussion: z.number().optional(),` (line 63) 삭제, line 56 주석 삭제 |
| `src/pages/lecture/[course]/index.astro` | line 5 `lecturesConfig` import 삭제 (미사용화됨), line 45~49 (`repoUrl`·`discussionsBase`) 삭제, line 50 → `const showLinks = notes.length > 0;`, line 110~112 (`토론` `<th>`) 삭제, line 149~164 (`토론` `<td>` 블록) 삭제 |
| `scripts/lecture-template/course.md` | line 13 예시 주석에서 `, discussion: 1` 삭제 |
| `docs/lecture-authoring.md` | line 111 `weeks` 행에서 `, discussion?: 3` 삭제; "## 주차별 토론" 절(약 line 187~202) 삭제; line 214 "→ Discussions 활성화" 문구 삭제; line 225~226 "GitHub 쓰기 API 몰아치기 금지" 경고는 **유지**하되 없어진 절 참조 대신 계정 정지 사례 요약을 그 자리에 흡수 |

새 org의 강의 repo는 Discussions 기능을 **켜지 않는다**. `jaehoonoh-pnu` 옛 repo의
기존 토론 스레드(1~16)는 방치 (정지 계정이라 접근 불가, 복구 후 정리 대상).

**2d. 검증 후 push**

```
npm run build      # prebuild sync(공개 repo clone) + astro build + check-lecture-notes
```
`[check] 강의 노트 산출물 검사 통과` 확인 → 커밋 → **사용자에게 "push?" 승인** → push → main 머지.

### Phase 3 — 강의 repo 2개 수정

각 repo (`advanced_deep_learning`, `applied_data_science`) 에서:

| 파일 | 변경 |
|---|---|
| `.github/workflows/notify.yml` | 주석 `repo=milab-pnu/milab-pnu.github.io`, `run: gh workflow run deploy.yml -R milab-pnu/milab-pnu.github.io` |
| `README.md` | 사이트 URL `https://milab-pnu.github.io/lecture/<slug>`, 메인 repo `https://github.com/milab-pnu/milab-pnu.github.io` |
| `course.md` | 16개 weeks 줄에서 `, discussion: N` 전부 삭제 |

커밋 → **사용자 승인** → push. (아직 secret 없어 notify job은 실패하지만 무해 — Phase 4에서 해결)

### Phase 4 — 배포 토큰 + secret

**사용자:** `jaehoon-oh` 로 PAT 발급. 둘 중 하나:

- **Fine-grained** (선호): resource owner `milab-pnu`, repository access = `milab-pnu.github.io` 하나,
  permissions = **Actions: Read and write** (그 외 No access).
  → org가 fine-grained PAT을 차단하면 org Settings → Personal access tokens 에서 허용
  (또는 토큰이 "pending approval" 로 뜨면 owner가 승인).
- **Classic** (즉시 동작): scopes `repo` + `workflow`. 범위가 넓으니 만료를 짧게.

**Claude/사용자:** 두 강의 repo에 secret 등록 (stdin 파이프, 파일로 안 남김):

```
printf %s "<PAT>" | gh secret set MILAB_DEPLOY_TOKEN -R milab-pnu/2026f-advanced-deep-learning
printf %s "<PAT>" | gh secret set MILAB_DEPLOY_TOKEN -R milab-pnu/2026f-applied-data-science
gh secret list -R milab-pnu/2026f-advanced-deep-learning   # 확인
```

gh가 안 되면 각 repo Settings → Secrets and variables → Actions → New repository secret.

### Phase 5 — Pages 켜고 전 구간 검증

**base 제거 커밋이 Phase 2에서 push된 뒤에만** 진행 (안 그러면 첫 배포가 `/milab/*` 링크로 깨짐).

1. `milab-pnu/milab-pnu.github.io` → Settings → Pages → Source = **GitHub Actions**.
2. deploy 워크플로 실행 (push로 이미 트리거됐거나 Actions → Deploy → Run workflow). 성공 확인.
3. 라이브 확인:
   - `https://milab-pnu.github.io/` → 200, 네비·CSS·로고
   - `/members` (사진 로드), `/paper`, `/project`, `/alumni`, 존재하지 않는 경로 → 404 페이지
   - `/lecture` (목록), `/lecture/2026f-advanced-deep-learning` (Schedule 표에 **토론 컬럼 없음** 확인)
   - `/lecture/2026f-advanced-deep-learning/01-transformers` (노트 렌더, MathML 수식, 좌측 목차)
   - `/_astro/*.css` 200, favicon 200
4. notify 체인 검증: 강의 repo에 빈 커밋 push →
   그 repo Actions에서 `notify milab` 성공 →
   `milab-pnu.github.io` Actions에서 `Deploy` 가 새로 트리거됨 → 사이트 재빌드.
5. 재하드닝 (3개 repo 전부):
   - branch ruleset `protect-main`: 삭제 차단 + non-fast-forward(force-push) 차단, repo-admin bypass만.
   - Settings → Actions → General → Workflow permissions = **Read repository contents and packages permissions** (read-only).
   - `milab-pnu.github.io` 는 이미 Public. 나머지 둘도 Public 확인.

### Phase 6 — 로컬 작업공간 정리

- `pnu/lectures/CLAUDE.md`: `= github.com/jaehoonoh-pnu/…` 두 줄 → `milab-pnu`, dev URL, 경로 참조.
- 세 로컬 클론의 `git config user.name` / `user.email` 을 `jaehoon-oh` + noreply로 설정.
  글로벌 config도 동일하게 (다른 프로젝트 영향 없으면).
- Phase 0 번들은 마이그레이션·검증 완료 후 일정 기간 보관하다 삭제.

## 안 바뀌는 것

강의 repo 이름 2개, 강의 콘텐츠 전체, 강의 노트 컴포넌트, CSP 정책, MathML 수식 파이프라인,
코드블록 하이라이팅 끔, `sync-lectures.mjs` 메커니즘, `content.config.ts` 의 loader `base`
(파일시스템 경로 — 사이트 base와 무관).

## 위험과 완화

| 위험 | 완화 |
|---|---|
| 콘텐츠 유실 | Phase 0 번들 백업 + 히스토리 그대로 push + 옛 repo 방치(삭제 안 함) |
| 새 계정 재정지 | repo 웹 UI 수동 생성, push 정상 횟수, API 루프 금지 |
| 첫 배포가 깨진 링크 | base 제거 커밋 push 후에만 Pages 활성화 |
| `check-lecture-notes` 오탐/미탐 | 빌드가 게이트, "노트 0개면 실패" 가드 존재 |
| fine-grained PAT 조용한 실패 | org 정책 먼저 확인, 안 되면 classic PAT |
| 커밋에 개인 메일 노출 | noreply + "Block command line pushes that expose my email" |
| `milab-pnu` org 이름 선점됨 | 생성 시 확인, fallback `pnu-milab` (그 경우 문자열 치환값만 교체) |

## 실행 중 확정할 값

- `jaehoon-oh` 의 numeric id → noreply 이메일
- `milab-pnu` org 이름 가용 여부
- PAT 방식 (fine-grained vs classic) — org 정책에 따라
