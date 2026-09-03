# GitHub organization 이전 — 실행 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 이 플랜은 코드 기능이 아니라 **운영 마이그레이션 런북**이다. "테스트" 자리에 `npm run build` 통과 / GitHub 상태 확인 / 라이브 URL 확인이 들어간다. push·브라우저 작업은 **사용자 승인 게이트**.

**Goal:** `jaehoonoh-pnu` 개인 계정의 세 repo(`milab`, `2026f-advanced-deep-learning`, `2026f-applied-data-science`)를 새 org `milab-pnu` 로 이전하고, 그 과정에서 GitHub Discussions 관련 코드·문서·설정을 전부 제거하며, 사이트 Pages 를 루트(`https://milab-pnu.github.io/`)로 전환한다.

**Architecture:** transfer 불가(정지 계정)이므로 org에 빈 repo 3개를 만들고 로컬 전체 히스토리를 push한다. 코드가 이미 `withBase()` / `import.meta.env.BASE_URL` 로 base를 추상화해 두어 `base: '/milab'` 제거는 `astro.config.mjs` 한 곳 + 문자열/주석 정리로 끝난다. Discussions 제거는 스키마(`content.config.ts`)와 렌더(`[course]/index.astro`의 토론 컬럼) 두 지점이 핵심.

**Tech Stack:** Astro 7.2.8 (정적 빌드), Tailwind v4, GitHub Pages (Source=Actions), `gh` CLI, git bundle.

**Spec:** `docs/superpowers/specs/2026-09-03-github-org-migration-design.md`

## Global Constraints

- **org 이름:** `milab-pnu` (생성 시 선점 확인, 안 되면 `pnu-milab` — 그 경우 이 플랜의 모든 `milab-pnu` 를 그 값으로 교체).
- **사이트 repo 이름:** `milab-pnu.github.io` (루트 Pages). 강의 repo 이름은 `2026f-advanced-deep-learning`, `2026f-applied-data-science` 그대로.
- **org owner 계정:** `jaehoon-oh` (신규, Google 로그인 생성 완료). 정지된 `jaehoonoh-pnu` 는 **건드리지 않음**.
- **커밋 신원:** `jaehoon-oh` + GitHub noreply 이메일 `<numeric-id>+jaehoon-oh@users.noreply.github.com` (id는 Task 3에서 확인).
- **히스토리 보존** (squash 금지).
- **언어 한국어** (커밋 메시지·주석 포함).
- **커밋 트레일러:**
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```
  (강의 repo도 동일. milab repo 는 여기에 더해 `Claude-Session:` 줄 — 기존 관례.)
- **push 는 매번 "push 할까요?" 승인 후.** 커밋은 자유.
- **새 계정 어뷰징 방지:** repo 생성은 웹 UI 로 하나씩. push 는 정상 횟수. `gh` 를 루프로 돌리지 않는다.
- **scratchpad:** `C:\Users\USER\AppData\Local\Temp\claude\C--Users-USER-Desktop-pnu-milab-pnu\de6fef3b-32b7-4fc8-a6eb-769ed49057d3\scratchpad`
- **로컬 클론 경로:**
  - milab: `C:\Users\USER\Desktop\pnu\milab-pnu`
  - adv-dl: `C:\Users\USER\Desktop\pnu\lectures\2026-02\advanced_deep_learning`
  - applied-ds: `C:\Users\USER\Desktop\pnu\lectures\2026-02\applied_data_science`

---

## Task 1: Phase 0 — 로컬 백업 번들

**Files:** 없음 (scratchpad 산출물만). 커밋 없음.

**Interfaces:**
- Produces: 3개 `.bundle` 파일 — 이후 어떤 단계에서 실수해도 `git clone <bundle> <dir>` 로 완전 복원.

- [ ] **Step 1: scratchpad에 번들 3개 생성**

```bash
SP="C:/Users/USER/AppData/Local/Temp/claude/C--Users-USER-Desktop-pnu-milab-pnu/de6fef3b-32b7-4fc8-a6eb-769ed49057d3/scratchpad"
git -C "C:/Users/USER/Desktop/pnu/milab-pnu" bundle create "$SP/milab-2026-09-03.bundle" --all
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning" bundle create "$SP/advanced-deep-learning-2026-09-03.bundle" --all
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science" bundle create "$SP/applied-data-science-2026-09-03.bundle" --all
```

- [ ] **Step 2: 세 번들 검증**

```bash
for b in milab advanced-deep-learning applied-data-science; do
  echo "=== $b ==="
  git bundle verify "$SP/$b-2026-09-03.bundle"
done
```

Expected: 각 번들에 대해 `The bundle is okay` + `refs/heads/main` 이 나열됨.

- [ ] **Step 3: 커밋 SHA 기록 (복원 대조용)**

```bash
git -C "C:/Users/USER/Desktop/pnu/milab-pnu" rev-parse HEAD
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning" rev-parse HEAD
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science" rev-parse HEAD
```

세 SHA 를 이 플랜 실행 로그에 적어둔다. (참고 시작값: milab `baf9c25`, adv-dl `89e5218`, applied-ds `28e1a4f` — Task 4~7에서 새 커밋이 쌓이면 바뀜.)

---

## Task 2: Phase 1a — 사용자: 계정 설정 · org · 빈 repo 생성

**Files:** 없음. 브라우저 작업만. **이 태스크는 사용자가 수행한다. Claude 는 체크리스트를 제시하고 결과값을 받는다.**

**Interfaces:**
- Produces:
  - `milab-pnu` org 존재 (또는 fallback 이름)
  - 빈 repo 3개: `milab-pnu/milab-pnu.github.io`, `milab-pnu/2026f-advanced-deep-learning`, `milab-pnu/2026f-applied-data-science` — 모두 Public, 커밋 0개
  - `jaehoon-oh` numeric id (Task 3에서 noreply 이메일 조립에 사용)

- [ ] **Step 1: `jaehoon-oh` 계정 이메일 프라이버시 설정**

`jaehoon-oh` 로 로그인 → Settings → Emails:
- [x] Keep my email addresses private
- [x] Block command line pushes that expose my email

- [ ] **Step 2: numeric id 확인**

브라우저에서 `https://api.github.com/users/jaehoon-oh` 열기 → `"id": NNNNNNNN` 값을 Claude 에게 알려준다. (또는 Claude 가 Step에서 `curl` 로 확인 — Task 3 Step 1.)

- [ ] **Step 3: organization 생성**

`https://github.com/organizations/plan` → **Free** → Organization name `milab-pnu`, contact email = 연구실 메일 (공개 안 됨), "My personal account" 선택. 이름이 선점됐으면 `pnu-milab` 로 하고 Claude 에게 알린다.

- [ ] **Step 4: 빈 repo 3개 생성 (하나씩)**

`https://github.com/organizations/milab-pnu/repositories/new` 에서 3번 반복:

| Repository name | Visibility | Initialize |
|---|---|---|
| `milab-pnu.github.io` | Public | **아무것도 체크 안 함** (README·.gitignore·license 전부 off) |
| `2026f-advanced-deep-learning` | Public | 아무것도 체크 안 함 |
| `2026f-applied-data-science` | Public | 아무것도 체크 안 함 |

각 생성 사이에 몇 초 간격. 생성 후 "Quick setup" 화면(빈 repo)이 보이면 정상.

- [ ] **Step 5: Claude 에게 확정값 전달**

- org 이름: `milab-pnu` (또는 fallback)
- numeric id: `________`
- 세 repo 다 비어 있고 Public 임 확인: (y/n)

---

## Task 3: Phase 1b — 인증 + 원본 히스토리 push

**Files:**
- Modify: 세 로컬 클론의 `.git/config` (remote + user 신원) — `git` 명령으로.

**Interfaces:**
- Consumes: Task 2의 org 이름, numeric id, 빈 repo 3개
- Produces: 세 org repo 에 로컬과 동일한 `main` 히스토리. 세 클론의 `origin` = org, `jaehoonoh-pnu-old` = 옛 URL(비활성). 세 클론 커밋 신원 = `jaehoon-oh`.

- [ ] **Step 1: numeric id 재확인 + noreply 이메일 조립**

```bash
curl -s https://api.github.com/users/jaehoon-oh | grep -E '"(id|login)"'
```

Expected: `"login": "jaehoon-oh"`, `"id": NNNNNNNN`. → 이메일 = `NNNNNNNN+jaehoon-oh@users.noreply.github.com`.

- [ ] **Step 2: 사용자: `jaehoon-oh` 로 git/gh 인증**

세션에서 사용자가 실행 (`!` 접두):

```
! gh auth login
```

GitHub.com → HTTPS → "Login with a web browser" → `jaehoon-oh` 로 인증. 이러면 git credential helper 도 `jaehoon-oh` 로 설정됨. 완료 후:

```
! gh auth status
```

Expected: `Logged in to github.com account jaehoon-oh`.

- [ ] **Step 3: 세 클론에 커밋 신원 설정**

`<EMAIL>` = Step 1에서 조립한 noreply.

```bash
for d in "C:/Users/USER/Desktop/pnu/milab-pnu" \
         "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning" \
         "C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science"; do
  git -C "$d" config user.name "jaehoon-oh"
  git -C "$d" config user.email "<EMAIL>"
done
git config --global user.name "jaehoon-oh"
git config --global user.email "<EMAIL>"
```

- [ ] **Step 4: milab — origin 교체 + push**

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
git remote rename origin jaehoonoh-pnu-old
git remote add origin https://github.com/milab-pnu/milab-pnu.github.io.git
git push -u origin main
```

Expected: `main -> main` 정상. 에러 시 STOP — 인증(Step 2) 재확인.

- [ ] **Step 5: adv-dl — origin 교체 + push**

```bash
cd "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning"
git remote rename origin jaehoonoh-pnu-old
git remote add origin https://github.com/milab-pnu/2026f-advanced-deep-learning.git
git push -u origin main
```

- [ ] **Step 6: applied-ds — origin 교체 + push**

```bash
cd "C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science"
git remote rename origin jaehoonoh-pnu-old
git remote add origin https://github.com/milab-pnu/2026f-applied-data-science.git
git push -u origin main
```

- [ ] **Step 7: 검증 — 원격 커밋 수 = 로컬**

```bash
for r in milab-pnu.github.io 2026f-advanced-deep-learning 2026f-applied-data-science; do
  echo "=== $r ==="
  gh api "repos/milab-pnu/$r/commits?per_page=1" -q '.[0].sha'
done
git -C "C:/Users/USER/Desktop/pnu/milab-pnu" rev-parse HEAD
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning" rev-parse HEAD
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science" rev-parse HEAD
```

Expected: 각 repo 의 최신 원격 SHA == 해당 로컬 HEAD SHA.

---

## Task 4: Phase 2a/2b — milab: base 제거 + 주소 문자열 치환

**Files:**
- Create: `C:/Users/USER/Desktop/pnu/milab-pnu` 에 브랜치 `chore/migrate-to-org`
- Modify: `astro.config.mjs`, `src/consts.ts`, `lectures.config.json`, `dev.ps1`, `package.json`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/lecture-authoring.md`, `scripts/new-lecture.ps1`, `scripts/lecture-template/notify.yml`, `docs/superpowers/specs/2026-08-27-lecture-content-repos-design.md`, `docs/superpowers/specs/2026-08-28-lecture-note-presentation-layer-design.md`
- Test: `npm run build` (프레임워크 없음 — postbuild `check-lecture-notes.mjs` 가 게이트)

**Interfaces:**
- Consumes: Task 3의 push 완료 상태
- Produces: `main` 대비 base 없는 빌드. `withBase()` 출력이 `/foo` (prefix 없음). 이후 Task 5가 같은 브랜치에서 이어감.

- [ ] **Step 1: 작업 브랜치 생성**

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
git checkout -b chore/migrate-to-org
```

- [ ] **Step 2: `astro.config.mjs` — site 변경 + base 제거**

`C:/Users/USER/Desktop/pnu/milab-pnu/astro.config.mjs` 26~30번째 줄:

```
  // GitHub Pages project site: https://jaehoonoh-pnu.github.io/milab
  // 커스텀 도메인/학교 서버로 옮기면 site 를 그 도메인으로, base 는 '/' 로.
  site: 'https://jaehoonoh-pnu.github.io',
  base: '/milab',
```

→

```
  // GitHub Pages organization site: https://milab-pnu.github.io/ (루트 서빙, base 없음)
  // 커스텀 도메인/학교 서버로 옮기면 site 만 그 도메인으로 바꾼다.
  site: 'https://milab-pnu.github.io',
```

(`base:` 줄 완전 삭제 — Astro 기본값이 `/`.)

- [ ] **Step 3: `src/consts.ts` — 주석만 갱신**

라인 26: `/** 뒤 슬래시 없는 base ("/milab" 또는 "") */` → `/** 뒤 슬래시 없는 base (루트 서빙이면 "") */`
라인 30: `* base 경로(예: "/milab")를 앞에 붙여 내부 링크를 만든다.` → `* base 경로(있으면)를 앞에 붙여 내부 링크를 만든다.`

(코드 `const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");` 및 `withBase` 로직은 그대로 — base 가 `/` 면 `BASE` 가 `""` 가 됨.)

- [ ] **Step 4: `lectures.config.json` — 강의 repo URL**

```
"repo": "https://github.com/jaehoonoh-pnu/2026f-advanced-deep-learning.git",
"repo": "https://github.com/jaehoonoh-pnu/2026f-applied-data-science.git",
```
→ 두 줄 다 `jaehoonoh-pnu` → `milab-pnu`.

- [ ] **Step 5: `dev.ps1` — dev URL**

라인 24: `$url = 'http://localhost:4321/milab'` → `$url = 'http://localhost:4321/'`

- [ ] **Step 6: `package.json` — name**

라인 2: `"name": "milab",` → `"name": "milab-pnu",`

- [ ] **Step 7: `CLAUDE.md` 와 `AGENTS.md` — dev URL**

두 파일 모두 라인 12의 `Dev server: http://localhost:4321/milab` → `http://localhost:4321/`

- [ ] **Step 8: `README.md` — URL·배포 절**

- 라인 1: `# milab` → `# milab-pnu.github.io`
- 라인 14: `http://localhost:4321/milab` → `http://localhost:4321/`
- 라인 51: `\`http://localhost:4321/milab\`` → `\`http://localhost:4321/\``
- 라인 52: `\`https://jaehoonoh-pnu.github.io/milab/\`` → `\`https://milab-pnu.github.io/\``
- "## 배포 (GitHub Pages)" 절 (라인 109~116) 전체를:

```
## 배포 (GitHub Pages)

organization pages (`milab-pnu/milab-pnu.github.io`) 로 루트 서빙 중.

1. 저장소 **Settings → Pages → Build and deployment → Source** = **GitHub Actions**.
2. `astro.config.mjs`: `site: 'https://milab-pnu.github.io'`, `base` 없음 (루트).
3. `main` 에 push 하면 `.github/workflows/deploy.yml` 이 자동 빌드·배포.
4. 커스텀 도메인/학교 서버로 옮기면 `site` 만 그 도메인으로 (base 는 계속 없음).
```

- 라인 156: `gh workflow run deploy.yml -R jaehoonoh-pnu/milab` → `-R milab-pnu/milab-pnu.github.io`
- 라인 168: `- Repository access: **\`milab\` 만**` → `- Repository access: **\`milab-pnu.github.io\` 만**`
- 라인 173: `gh secret set MILAB_DEPLOY_TOKEN -R jaehoonoh-pnu/<slug>` → `-R milab-pnu/<slug>`

- [ ] **Step 9: `scripts/new-lecture.ps1` — owner + 생성 URL**

- 라인 23: `$owner = 'jaehoonoh-pnu'` → `$owner = 'milab-pnu'`
- 라인 49: `https://jaehoonoh-pnu.github.io/milab/lecture/$Slug` → `https://milab-pnu.github.io/lecture/$Slug`

(라인 2 주석의 `+ Discussions` 및 라인 58~59는 Task 5에서 처리 — 이 태스크에선 건드리지 않음.)

- [ ] **Step 10: `scripts/lecture-template/notify.yml` — repo 참조**

```
# 필요한 secret: MILAB_DEPLOY_TOKEN (fine-grained PAT, repo=jaehoonoh-pnu/milab, Actions: read+write)
...
      - run: gh workflow run deploy.yml -R jaehoonoh-pnu/milab
```
→ `jaehoonoh-pnu/milab` 두 곳 다 `milab-pnu/milab-pnu.github.io`.

- [ ] **Step 11: spec 문서 2개 — 문자열 치환**

`docs/superpowers/specs/2026-08-27-lecture-content-repos-design.md` 와
`docs/superpowers/specs/2026-08-28-lecture-note-presentation-layer-design.md` 에서 **순서대로**:

1. `jaehoonoh-pnu/milab` → `milab-pnu/milab-pnu.github.io` (가장 긴 매치 먼저)
2. 남은 `jaehoonoh-pnu` → `milab-pnu`
3. (2026-08-27 라인 7) `/milab/lecture/` → `/lecture/`
4. (2026-08-27 라인 142) `Repository access: **\`milab\` 하나만**` → `Repository access: **\`milab-pnu.github.io\` 하나만**`
5. (2026-08-27 라인 230) `repo = \`milab-pnu/milab-pnu.github.io\`` 로 되어 있는지 확인 (1번에서 처리됨)

prose·날짜·설계 논리는 건드리지 않는다.

- [ ] **Step 12: 빌드 검증**

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
npm run build
```

Expected 마지막 줄 근처: `[check] 강의 노트 산출물 검사 통과 (노트 N개)` (N ≥ 2) + `[build] Complete!`. 
`[lectures] ...` sync 는 이제 `milab-pnu` URL 에서 clone 시도 — Task 3에서 push 됐으므로 성공해야 함.
만약 sync 가 실패하면(예: repo 아직 비공개) STOP — repo Public 확인.

- [ ] **Step 13: 빌드 산출물에 `/milab` prefix 가 사라졌는지 확인**

```bash
grep -o 'href="/milab' "C:/Users/USER/Desktop/pnu/milab-pnu/dist/index.html" | head || echo "OK: /milab prefix 없음"
grep -o 'href="/_astro\|href="/favicon\|src="/_astro' "C:/Users/USER/Desktop/pnu/milab-pnu/dist/index.html" | sort -u | head
```

Expected: `href="/milab` 은 **0건** ("OK: ..." 출력). asset 링크는 `/_astro/…`, `/favicon…` (prefix 없음).

- [ ] **Step 14: 커밋 (push 아님)**

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
git add -A
git commit -m "$(cat <<'EOF'
migrate: 사이트를 milab-pnu org 루트 Pages 로

- astro.config: site=milab-pnu.github.io, base '/milab' 제거 (루트 서빙)
- jaehoonoh-pnu → milab-pnu 문자열 전량 치환 (config·문서·스크립트·spec)
- dev/공개 URL 갱신

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ENyogvv9rpS6RWyH395sfp
EOF
)"
```

---

## Task 5: Phase 2c — milab: Discussions 제거

**Files:**
- Modify: `src/content.config.ts`, `src/pages/lecture/[course]/index.astro`, `scripts/lecture-template/course.md`, `scripts/new-lecture.ps1`, `docs/lecture-authoring.md`
- Test: `npm run build` + 렌더된 Schedule 표에 "토론" 컬럼 없음 확인

**Interfaces:**
- Consumes: Task 4의 `chore/migrate-to-org` 브랜치 (이어서 커밋)
- Produces: `weeks[].discussion` 스키마 제거, `[course]/index.astro` 에서 `lecturesConfig` import 및 토론 컬럼 제거. `showLinks` = `notes.length > 0`.

- [ ] **Step 1: `src/content.config.ts` — 스키마에서 discussion 제거**

라인 55~56:
```
    // 강의 계획 표. 강의자료(웹 노트)는 weeks/*.md 가 각자 week 번호로 연결됨.
    // discussion 은 그 강의 repo 의 GitHub Discussion 번호 (주차별 토론 스레드).
```
→ 둘째 줄(`// discussion 은 ...`) 삭제, 첫째 줄 유지.

라인 63: `          discussion: z.number().optional(),` → 삭제.

결과 `weeks` 스키마:
```
    weeks: z
      .array(
        z.object({
          n: z.number(),
          topic: z.string(),
          date: z.string().optional(),
        }),
      )
      .default([]),
```

- [ ] **Step 2: `src/pages/lecture/[course]/index.astro` — import + 토론 컬럼 제거**

라인 5 삭제:
```
import lecturesConfig from "../../../../lectures.config.json";
```

라인 45~50 (`// 토론 링크 베이스 …` 부터 `const showLinks …` 까지):
```
// 토론 링크 베이스 = 강의 repo 의 GitHub Discussions
const repoUrl = lecturesConfig.find((c) => c.slug === slug)?.repo ?? "";
const discussionsBase = repoUrl
  ? `${repoUrl.replace(/\.git$/, "")}/discussions`
  : null;
const showLinks = notes.length > 0 || weeks.some((w) => w.discussion != null);
```
→
```
const showLinks = notes.length > 0;
```

라인 110~112 (강의자료 `<th>` 바로 뒤):
```
                {showLinks && discussionsBase && (
                  <th class="py-2.5 font-semibold">토론</th>
                )}
```
→ 삭제.

라인 149~164 (강의자료 `<td>` 바로 뒤, `{showLinks && discussionsBase && ( <td …토론… </td> )}` 블록 전체):
```
                    {showLinks && discussionsBase && (
                      <td class="py-2.5">
                        {w.discussion != null ? (
                          <a
                            class="text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                            href={`${discussionsBase}/${w.discussion}`}
                            target="_blank"
                            rel="noopener"
                          >
                            토론 ↗
                          </a>
                        ) : (
                          <span class="text-slate-300">—</span>
                        )}
                      </td>
                    )}
```
→ 삭제.

- [ ] **Step 3: `scripts/lecture-template/course.md` — 예시 주석**

라인 13: `  # - { n: 2, topic: "...", date: "2027-03-10", discussion: 1 }` → `  # - { n: 2, topic: "...", date: "2027-03-10" }`

- [ ] **Step 4: `scripts/new-lecture.ps1` — Discussions 단계 제거**

라인 2 주석: `# new-lecture.ps1 - 새 강의: GitHub repo 생성 + 작업 폴더 클론 + 스캐폴드 + Discussions + secret`
→ `# new-lecture.ps1 - 새 강의: GitHub repo 생성 + 작업 폴더 클론 + 스캐폴드 + secret`

라인 58~60:
```
Write-Host "4) Discussions 활성화" -ForegroundColor Cyan
gh repo edit $repo --enable-discussions

```
→ 3줄(빈 줄 포함) 삭제.

라인 61: `Write-Host "5) MILAB_DEPLOY_TOKEN secret" -ForegroundColor Cyan` → `Write-Host "4) MILAB_DEPLOY_TOKEN secret" -ForegroundColor Cyan`

- [ ] **Step 5: `docs/lecture-authoring.md` — 토론 관련 전량 제거**

(a) 라인 111 (frontmatter 스키마 표 `weeks` 행):
```
| `weeks` |  | 계획표. 항목: `{ n: 1, topic: "주제", date?: "2026-09-01", discussion?: 3 }` |
```
→
```
| `weeks` |  | 계획표. 항목: `{ n: 1, topic: "주제", date?: "2026-09-01" }` |
```

(b) "## 주차별 토론" 절 전체 삭제 (라인 187~202, `## 주차별 토론` 헤딩부터 `> **한 번에 몰아서 만들지 않는다.**` 인용 블록 끝까지 + 다음 빈 줄).

(c) "## 새 강의 추가" 절, `스크립트가:` 문장 (약 라인 213~214):
```
스크립트가: GitHub repo 생성 → 작업 폴더 클론 → 골격 복사(`scripts/lecture-template/`)
→ Discussions 활성화 → `MILAB_DEPLOY_TOKEN` secret 등록. 그다음 직접:
```
→
```
스크립트가: GitHub repo 생성 → 작업 폴더 클론 → 골격 복사(`scripts/lecture-template/`)
→ `MILAB_DEPLOY_TOKEN` secret 등록. 그다음 직접:
```

(d) "## 주의점" 절, GitHub 쓰기 API 항목 (약 라인 225~226):
```
- **GitHub 쓰기 API 를 몰아서 호출하지 않는다** (예: `gh discussion create` 루프). 계정
  정지로 이어진다 — "주차별 토론" 절 참고.
```
→
```
- **GitHub 쓰기 API 를 몰아서 호출하지 않는다** (예: `gh` 를 짧은 시간에 루프로 십수 번,
  더구나 여러 repo 에 걸쳐). 어뷰징 탐지에 걸려 **계정이 정지**된다 (실제로 겪음 — 복구에
  며칠, 그동안 push·Pages·gh 전부 차단). write 작업은 소량씩 간격을 두고.
```

(e) 라인 22~23 (경로 다이어그램):
```
        ├── advanced_deep_learning/   # = github.com/jaehoonoh-pnu/2026f-advanced-deep-learning
        └── applied_data_science/     # = github.com/jaehoonoh-pnu/2026f-applied-data-science
```
→ `jaehoonoh-pnu` → `milab-pnu` (두 줄).

(f) 라인 40:
```
로컬 미리보기: `cd pnu/milab-pnu && ./dev.ps1` → http://localhost:4321/milab
```
→ `http://localhost:4321/`

- [ ] **Step 6: 빌드 검증**

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
npm run build
```

Expected: `[check] 강의 노트 산출물 검사 통과` + `[build] Complete!`. TypeScript 에러 없음 (특히 `w.discussion` 잔여 참조 → 있으면 컴파일 실패).

- [ ] **Step 7: 렌더 결과에 "토론" 컬럼이 없는지 확인**

```bash
grep -c "토론" "C:/Users/USER/Desktop/pnu/milab-pnu/dist/lecture/2026f-advanced-deep-learning/index.html" || echo "0 — 토론 없음"
grep -o '<th[^>]*>[^<]*</th>' "C:/Users/USER/Desktop/pnu/milab-pnu/dist/lecture/2026f-advanced-deep-learning/index.html"
```

Expected: "토론" 0건. `<th>` 목록 = `주차`, (`날짜`), `주제`, `강의자료` — "토론" 없음.

- [ ] **Step 8: 커밋**

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
git add -A
git commit -m "$(cat <<'EOF'
migrate: GitHub Discussions 관련 전량 제거

- content.config: weeks[].discussion 스키마 삭제
- [course]/index.astro: 토론 컬럼·discussionsBase·lecturesConfig import 제거
- lecture-authoring: "주차별 토론" 절 삭제, 쓰기 API 경고는 유지
- new-lecture.ps1: Discussions 활성화 단계 삭제
- 템플릿 course.md 예시에서 discussion 제거

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ENyogvv9rpS6RWyH395sfp
EOF
)"
```

---

## Task 6: Phase 2d — milab: 브랜치 머지 + push

**Files:** `C:/Users/USER/Desktop/pnu/milab-pnu` — 브랜치 머지.

**Interfaces:**
- Consumes: Task 4~5의 커밋들 (`chore/migrate-to-org`)
- Produces: org `milab-pnu/milab-pnu.github.io` 의 `main` 에 base 없는·Discussions 없는 코드.

- [ ] **Step 1: 최종 빌드 재확인**

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
git checkout main
git merge --no-ff chore/migrate-to-org -m "$(cat <<'EOF'
migrate: milab-pnu org 이전 (base 제거 + Discussions 제거)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ENyogvv9rpS6RWyH395sfp
EOF
)"
npm run build
```

Expected: `[check] ... 통과` + `[build] Complete!`.

- [ ] **Step 2: 사용자 승인 게이트 — "milab push 할까요?"**

diff 요약 제시 후 대기. 승인 시:

```bash
cd "C:/Users/USER/Desktop/pnu/milab-pnu"
git push origin main
git branch -d chore/migrate-to-org
```

- [ ] **Step 3: 검증**

```bash
gh api repos/milab-pnu/milab-pnu.github.io/commits?per_page=1 -q '.[0].commit.message'
git -C "C:/Users/USER/Desktop/pnu/milab-pnu" log --oneline -1 origin/main
```

Expected: 원격 최신 커밋 = 방금 머지 커밋.

---

## Task 7: Phase 3 — 강의 repo 2개 수정 + push

**Files (각 repo 동일):**
- Modify: `.github/workflows/notify.yml`, `README.md`, `course.md`
- 대상 1: `C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning`
- 대상 2: `C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science`

**Interfaces:**
- Consumes: Task 3의 origin 재설정 (이미 `milab-pnu` 가리킴)
- Produces: 두 강의 repo 가 `milab-pnu/milab-pnu.github.io` 배포를 트리거하도록 갱신, discussion 필드 제거.

- [ ] **Step 1: adv-dl — `.github/workflows/notify.yml`**

`C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning/.github/workflows/notify.yml`:
- `# 필요한 secret: MILAB_DEPLOY_TOKEN (fine-grained PAT, repo=jaehoonoh-pnu/milab, Actions: read+write)` → `repo=milab-pnu/milab-pnu.github.io`
- `      - run: gh workflow run deploy.yml -R jaehoonoh-pnu/milab` → `-R milab-pnu/milab-pnu.github.io`

- [ ] **Step 2: adv-dl — `README.md`**

- `- 사이트: https://jaehoonoh-pnu.github.io/milab/lecture/2026f-advanced-deep-learning` → `https://milab-pnu.github.io/lecture/2026f-advanced-deep-learning`
- `메인 사이트 저장소: https://github.com/jaehoonoh-pnu/milab` → `https://github.com/milab-pnu/milab-pnu.github.io`

- [ ] **Step 3: adv-dl — `course.md` 에서 discussion 필드 제거**

`weeks:` 목록 16줄에서 `, discussion: N` 부분만 제거 (n·topic 은 유지). 예:
```
  - { n: 1, topic: "Introduction, Transformer, LLM, LLM Inference", discussion: 1 }
```
→
```
  - { n: 1, topic: "Introduction, Transformer, LLM, LLM Inference" }
```

sed 로 일괄:
```bash
cd "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning"
sed -i -E 's/, discussion: [0-9]+ \}/ }/' course.md
grep -n discussion course.md || echo "OK: discussion 없음"
```

- [ ] **Step 4: adv-dl — 커밋 + 사용자 승인 후 push**

```bash
cd "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning"
git add -A
git commit -m "$(cat <<'EOF'
migrate: milab-pnu org 이전

- notify.yml: 배포 트리거 대상 milab-pnu/milab-pnu.github.io
- README·course.md: URL 갱신, 주차별 discussion 필드 제거

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
→ "adv-dl push 할까요?" 승인 후 `git push origin main`.
(secret 아직 없음 → notify job 은 실패하지만 무해. Task 8에서 해결.)

- [ ] **Step 5: applied-ds — 같은 변경 반복**

`C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science` 에서 Step 1~4 동일하게:
- notify.yml: `jaehoonoh-pnu/milab` → `milab-pnu/milab-pnu.github.io` (2곳)
- README.md: `https://milab-pnu.github.io/lecture/2026f-applied-data-science`, `https://github.com/milab-pnu/milab-pnu.github.io`
- course.md: `sed -i -E 's/, discussion: [0-9]+ \}/ }/' course.md`
- 커밋 (같은 메시지) → "applied-ds push 할까요?" 승인 후 push.

- [ ] **Step 6: 검증**

```bash
for r in 2026f-advanced-deep-learning 2026f-applied-data-science; do
  echo "=== $r ==="
  gh api "repos/milab-pnu/$r/contents/.github/workflows/notify.yml" -q '.content' | base64 -d | grep -E 'deploy.yml -R'
done
```

Expected: 두 repo 다 `-R milab-pnu/milab-pnu.github.io`.

---

## Task 8: Phase 4 — 배포 PAT + secret

**Files:** 없음 (GitHub 설정). PAT 값은 파일·로그에 남기지 않는다.

**Interfaces:**
- Consumes: Task 7의 강의 repo push
- Produces: 두 강의 repo 에 `MILAB_DEPLOY_TOKEN` secret. notify → deploy 체인 동작 가능.

- [ ] **Step 1: 사용자: PAT 발급**

`jaehoon-oh` 로 로그인. **둘 중 하나:**

**(A) Fine-grained (권장)** — `https://github.com/settings/personal-access-tokens/new`:
- Token name: `milab-deploy`
- Resource owner: **`milab-pnu`**
- Repository access: Only select repositories → **`milab-pnu.github.io`**
- Permissions → Repository permissions → **Actions: Read and write** (나머지 No access)
- Generate. org 가 승인 요구하면 org owner(=본인)가 `https://github.com/organizations/milab-pnu/settings/personal-access-token-requests` 에서 승인.
- org 가 fine-grained PAT 자체를 차단하면 `https://github.com/organizations/milab-pnu/settings/personal-access-tokens` → "Allow access via fine-grained personal access tokens" 활성화.

**(B) Classic (즉시 동작, 범위 넓음)** — `https://github.com/settings/tokens/new`:
- scopes: `repo`, `workflow`. 만료 90일.

발급한 `github_pat_…` / `ghp_…` 을 **다음 스텝에서 stdin 으로만** 넘긴다.

- [ ] **Step 2: 두 강의 repo 에 secret 등록**

사용자가 세션에서 (`!` 접두, 토큰이 히스토리에 남지 않게 주의 — 가능하면 붙여넣기 프롬프트):

```
! read -rs PAT && printf %s "$PAT" | gh secret set MILAB_DEPLOY_TOKEN -R milab-pnu/2026f-advanced-deep-learning && printf %s "$PAT" | gh secret set MILAB_DEPLOY_TOKEN -R milab-pnu/2026f-applied-data-science && unset PAT
```

(`read -rs` 가 안 되는 환경이면 각 repo Settings → Secrets and variables → Actions → New repository secret, 이름 `MILAB_DEPLOY_TOKEN`.)

- [ ] **Step 3: 검증**

```bash
gh secret list -R milab-pnu/2026f-advanced-deep-learning
gh secret list -R milab-pnu/2026f-applied-data-science
```

Expected: 둘 다 `MILAB_DEPLOY_TOKEN` 나열.

---

## Task 9: Phase 5 — Pages 활성화 + 전 구간 검증

**Files:** 없음 (GitHub 설정 + 라이브 확인).

**Interfaces:**
- Consumes: Task 6 (사이트 코드 push), Task 8 (secret)
- Produces: `https://milab-pnu.github.io/` 라이브. notify→deploy 체인 검증됨.

- [ ] **Step 1: 사용자: Pages Source 설정**

`https://github.com/milab-pnu/milab-pnu.github.io/settings/pages` → Build and deployment → Source = **GitHub Actions**.

- [ ] **Step 2: deploy 워크플로 확인/실행**

```bash
gh run list -R milab-pnu/milab-pnu.github.io --workflow deploy.yml -L 3
```

실행 이력이 없거나 실패면:
```bash
gh workflow run deploy.yml -R milab-pnu/milab-pnu.github.io
gh run watch -R milab-pnu/milab-pnu.github.io $(gh run list -R milab-pnu/milab-pnu.github.io --workflow deploy.yml -L 1 --json databaseId -q '.[0].databaseId')
```

Expected: `deploy` job `completed  success`.

- [ ] **Step 3: 라이브 URL 검증**

```bash
for p in "" members paper project alumni lecture "lecture/2026f-advanced-deep-learning" "lecture/2026f-applied-data-science" "lecture/2026f-advanced-deep-learning/01-transformers"; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" "https://milab-pnu.github.io/$p")
  echo "$code  /$p"
done
code=$(curl -sS -o /dev/null -w "%{http_code}" "https://milab-pnu.github.io/nonexistent-xyz")
echo "$code  /nonexistent (404 기대)"
```

Expected: 실제 페이지 전부 `200`, 없는 경로 `404`.

- [ ] **Step 4: asset·링크 경로 확인 (prefix 없음)**

```bash
curl -sS "https://milab-pnu.github.io/" | grep -oE 'href="/[a-z_-]+|src="/_astro' | sort -u | head
curl -sS "https://milab-pnu.github.io/lecture/2026f-advanced-deep-learning/" | grep -c "토론" || echo "0 — 토론 컬럼 없음"
```

Expected: 링크가 `/members`, `/_astro/…` 등 (`/milab/…` 아님). 강의 페이지에 "토론" 0건.

- [ ] **Step 5: 강의 노트 CSP 확인 (완화 CSP 유지)**

```bash
curl -sS "https://milab-pnu.github.io/lecture/2026f-advanced-deep-learning/01-transformers/" | grep -o 'Content-Security-Policy[^>]*' | head -c 400
```

Expected: `img-src 'self' https: data:` 와 `frame-src ...youtube-nocookie...` 포함 (노트용 완화 CSP). 홈페이지는 `script-src 'none'` (엄격).

- [ ] **Step 6: notify → deploy 체인 검증**

```bash
cd "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning"
git commit --allow-empty -m "chore: notify 체인 검증 (빈 커밋)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
→ "이 빈 커밋 push 할까요?" 승인 후:
```bash
git push origin main
sleep 15
gh run list -R milab-pnu/2026f-advanced-deep-learning --workflow notify.yml -L 1
```

Expected: `notify milab` job `success`. 이어서:
```bash
gh run list -R milab-pnu/milab-pnu.github.io --workflow deploy.yml -L 1
```

Expected: 방금(수 초 전) 새 `deploy` 실행이 트리거됨.

- [ ] **Step 7: 재하드닝 — branch ruleset (3개 repo)**

각 repo Settings → Rules → Rulesets → New branch ruleset:
- Name `protect-main`, Enforcement: Active
- Target branches: `main` (default)
- Rules: **Restrict deletions** ✓, **Block force pushes** ✓
- Bypass list: Repository admin

또는 gh:
```bash
for r in milab-pnu.github.io 2026f-advanced-deep-learning 2026f-applied-data-science; do
  gh api -X POST "repos/milab-pnu/$r/rulesets" -f name=protect-main -f target=branch -f enforcement=active \
    -F 'conditions[ref_name][include][]=~DEFAULT_BRANCH' \
    -F 'rules[][type]=deletion' -F 'rules[][type]=non_fast_forward'
done
```

- [ ] **Step 8: 재하드닝 — workflow 권한 read-only (3개 repo)**

각 repo Settings → Actions → General → Workflow permissions → **Read repository contents and packages permissions**. 또는:
```bash
for r in milab-pnu.github.io 2026f-advanced-deep-learning 2026f-applied-data-science; do
  gh api -X PUT "repos/milab-pnu/$r/actions/permissions/workflow" -f default_workflow_permissions=read
done
```

- [ ] **Step 9: 3개 repo Public 확인**

```bash
for r in milab-pnu.github.io 2026f-advanced-deep-learning 2026f-applied-data-science; do
  gh api "repos/milab-pnu/$r" -q '.name + " visibility=" + .visibility'
done
```

Expected: 셋 다 `visibility=public`.

---

## Task 10: Phase 6 — 로컬 작업공간 정리

**Files:**
- Modify: `C:/Users/USER/Desktop/pnu/lectures/CLAUDE.md` (git repo 아님 — 커밋 안 됨)

**Interfaces:**
- Consumes: 마이그레이션 완료 상태
- Produces: 로컬 안내 문서가 `milab-pnu` 기준. 번들 백업 처리 결정.

- [ ] **Step 1: `pnu/lectures/CLAUDE.md` 갱신**

`C:/Users/USER/Desktop/pnu/lectures/CLAUDE.md` 에서:
- `advanced_deep_learning/   # = github.com/jaehoonoh-pnu/2026f-advanced-deep-learning` → `milab-pnu`
- `applied_data_science/     # = github.com/jaehoonoh-pnu/2026f-applied-data-science` → `milab-pnu`
- `https://jaehoonoh-pnu.github.io/milab/lecture/<slug>/` (규칙 6 부근) → `https://milab-pnu.github.io/lecture/<slug>/`
- 그 외 `jaehoonoh-pnu` / `localhost:4321/milab` 잔여 검색 후 치환:
  ```bash
  grep -n "jaehoonoh-pnu\|4321/milab" "C:/Users/USER/Desktop/pnu/lectures/CLAUDE.md"
  ```

- [ ] **Step 2: git 신원 최종 확인 (3개 클론 + 글로벌)**

```bash
for d in "C:/Users/USER/Desktop/pnu/milab-pnu" \
         "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning" \
         "C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science"; do
  echo "$d -> $(git -C "$d" config user.name) / $(git -C "$d" config user.email)"
done
git config --global user.email
```

Expected: 전부 `jaehoon-oh` + noreply 이메일 (Task 3 Step 3 결과).

- [ ] **Step 3: 잔여 `jaehoonoh-pnu` 전수 검사**

```bash
git -C "C:/Users/USER/Desktop/pnu/milab-pnu" grep -n "jaehoonoh-pnu" || echo "milab: 없음"
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/advanced_deep_learning" grep -n "jaehoonoh-pnu" || echo "adv-dl: 없음"
git -C "C:/Users/USER/Desktop/pnu/lectures/2026-02/applied_data_science" grep -n "jaehoonoh-pnu" || echo "applied-ds: 없음"
```

Expected: 세 repo 다 "없음". (남으면 해당 파일 마저 치환 후 커밋·push.)

- [ ] **Step 4: 이 플랜·스펙 문서를 milab main 에 반영**

플랜/스펙 파일이 `chore/migrate-to-org` 밖(main)에서 생성됐다면 이미 Task 6에 포함됨. 확인:
```bash
git -C "C:/Users/USER/Desktop/pnu/milab-pnu" log --oneline -- docs/superpowers/plans/2026-09-03-github-org-migration.md docs/superpowers/specs/2026-09-03-github-org-migration-design.md
```
push 안 됐으면 커밋 후 "push 할까요?" 승인 게이트.

- [ ] **Step 5: 번들 백업 처리 결정**

사용자에게: 마이그레이션·검증 완료. scratchpad 의 3개 `.bundle` 을 (a) 안전한 곳으로 복사 후 보관, (b) 그대로 두기(세션 종료 시 정리됨), (c) 지금 삭제 — 중 선택 요청. 기본 권장: **(a) 며칠 보관 후 삭제.**

- [ ] **Step 6: 정지 계정 복구 시 할 일 메모**

사용자에게 안내 (실행 아님):
- `jaehoonoh-pnu` 복구되면 → org `milab-pnu` Settings → Members → `jaehoonoh-pnu` 를 Owner 로 초대.
- 옛 3개 repo (`jaehoonoh-pnu/milab` 등) → Settings → Danger Zone → Archive 또는 Delete.
- 옛 repo 의 Discussions 스레드는 repo 삭제 시 함께 사라짐.

---

## Self-Review (작성자 점검 결과)

**1. Spec coverage:**
- Phase 0 백업 → Task 1 ✓
- Phase 1 계정·org·repo·push → Task 2, 3 ✓
- Phase 2a/2b base 제거+문자열 → Task 4 ✓
- Phase 2c Discussions 제거 → Task 5 ✓
- Phase 2d 머지+push → Task 6 ✓
- Phase 3 강의 repo → Task 7 ✓
- Phase 4 PAT+secret → Task 8 ✓
- Phase 5 Pages+검증+재하드닝 → Task 9 ✓
- Phase 6 로컬 정리 → Task 10 ✓
- 스펙 "안 바뀌는 것" (강의 repo 이름, CSP, MathML, sync 메커니즘, loader base) — 플랜에서 건드리지 않음 ✓
- 스펙 위험표 항목별 완화 — Task 1(번들), Task 2 Step 4(수동 생성), Task 6 전 Task 4(base 커밋 먼저), Task 9 Step 2(check 가드), Task 8(PAT 정책), Task 3 Step 1(noreply), Global Constraints(org 이름 fallback) ✓

**2. Placeholder scan:** `<EMAIL>`, `<numeric-id>`, `NNNNNNNN`, PAT 값 — 모두 "실행 중 확정" 으로 스펙에 명시된 값이며 확인 명령(Task 3 Step 1, Task 2 Step 2)을 제공함. 그 외 TBD/TODO 없음.

**3. Type consistency:** `showLinks` 는 Task 5에서 `notes.length > 0` 로 통일 (Task 4는 이 변수 안 건드림). `discussion` 은 스키마(content.config.ts)와 사용처([course]/index.astro) 양쪽에서 같은 Task 5에 제거 → 잔여 참조 없음. `MILAB_DEPLOY_TOKEN` secret 이름 일관 (Task 7 notify.yml, Task 8). repo 이름 `milab-pnu/milab-pnu.github.io` 일관.

---

## 실행 방식

이 플랜은 **Inline Execution** (superpowers:executing-plans) 로 진행한다 — 브라우저 작업·`gh auth`·순차 의존성·여러 repo 공유 상태가 얽혀 있어 subagent 분리가 부적합. 체크포인트: 각 push 전, Pages 활성화 전, 재하드닝 전.
