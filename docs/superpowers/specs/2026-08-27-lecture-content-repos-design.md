# 강의 콘텐츠 저장소 시스템 (Phase 2 – 1차: 강의 첫 페이지)

작성: 2026-08-27 · 관련: `~/.claude/plans/wise-roaming-stroustrup.md` (원래 계획, 서브모듈안 → 폐기)

## 목표

강의 자료를 웹사이트 코드와 분리해 관리한다. **강의 하나 = 독립 GitHub repo (콘텐츠 전용).**
메인 repo(`milab-pnu`)는 "어떤 강의를 포함할지" 목록만 갖고, 빌드 시 각 repo를 `git clone`
해서 한 번에 빌드·배포한다. **git submodule 은 쓰지 않는다** (편집마다 포인터 갱신 커밋이
필요한 마찰을 피하기 위함).

이번 범위: 강의 **첫 페이지**(소개 / 목표 / 스케줄)만. MIT hanlab 코스 페이지 형태.

## 비목표 (이번엔 안 함)

- 주차별 강의노트 라우트 (`/lecture/<slug>/<week>`)
- MDX 인터랙티브 컴포넌트 주입 / React 재도입
- 에셋(PDF·이미지) 동기화 — 첫 페이지엔 불필요, 후속에서
- 비공개 강의 repo — 전부 public 전제
- 오래된 강의를 사이트에서 내리는 기능 — 계속 공개 예정
- 강의 repo 템플릿(`gh repo create --template`) — 지금은 강의 2개뿐, 후속에서

## 저장소 구성

### 강의 repo (신규, 콘텐츠 전용 — 빌드 도구 없음, 이름에 `milab-` 접두 없음)

```
2026f-advanced-deep-learning/     (GitHub: jaehoonoh-pnu/…, public)
├── course.md
└── .github/workflows/notify.yml  # push 시 milab repo 배포 트리거

2026f-applied-data-science/       (GitHub: jaehoonoh-pnu/…, public)
├── course.md
└── .github/workflows/notify.yml
```

### 메인 repo 추가/변경분

```
milab-pnu/
├── lectures.config.json          # [{ slug, repo, ref }] — 유일한 연결고리(커밋됨)
├── lectures/                      # sync 스크립트가 clone 하는 곳 — .gitignore
├── scripts/sync-lectures.mjs      # 신규
├── dev.ps1                        # 시작 전 sync 호출 추가
├── package.json                   # lectures:sync / predev / prebuild 스크립트
├── .gitignore                     # + /lectures/
├── .github/workflows/deploy.yml   # sync 단계 추가, workflow_dispatch 트리거
└── src/
    ├── content.config.ts          # + courses 컬렉션
    └── pages/lecture/
        ├── index.astro            # 하드코딩 목록 → courses 컬렉션 그룹핑으로 교체
        └── [course].astro         # 신규 — 강의 첫 페이지 (BaseLayout 재사용, 전용 레이아웃 불필요)
```

## `lectures.config.json`

```json
[
  {
    "slug": "2026f-advanced-deep-learning",
    "repo": "https://github.com/jaehoonoh-pnu/2026f-advanced-deep-learning.git",
    "ref": "main"
  },
  {
    "slug": "2026f-applied-data-science",
    "repo": "https://github.com/jaehoonoh-pnu/2026f-applied-data-science.git",
    "ref": "main"
  }
]
```

- `slug` — 라우트(`/lecture/<slug>`)이자 `lectures/<slug>/` 폴더명. 학기 접두(`2026f-`).
- `ref` — 보통 `"main"`. 오래된 강의는 태그/SHA 로 바꿔 고정(freeze).
- 사이트에서 내리려면 항목 삭제.

## `scripts/sync-lectures.mjs`

Node 내장 모듈만 사용(`node:child_process`, `node:fs`). 각 항목에 대해:

- `lectures/<slug>/.git` 없음 → `git clone --depth 1 --branch <ref> <repo> lectures/<slug>`
- 있음 → `git -C lectures/<slug> fetch --depth 1 origin <ref>` 후 `checkout -B <ref> FETCH_HEAD`
- 실패 시 명확한 메시지와 함께 `process.exit(1)` — **조용히 강의가 누락되는 것 방지**
- `lectures.config.json` 에 없는 기존 `lectures/*` 폴더는 삭제하지 않고 경고만
- `lectures/` 자체가 없으면 생성

package.json:

```json
"lectures:sync": "node scripts/sync-lectures.mjs",
"predev": "node scripts/sync-lectures.mjs",
"prebuild": "node scripts/sync-lectures.mjs"
```

`dev.ps1` 은 `npx astro dev` 를 직접 부르므로 npm predev 훅을 안 탄다 →
`start`/`restart` 에서 `node scripts/sync-lectures.mjs` 를 먼저 실행하도록 수정.

## 강의 자료 업데이트 / 재배포 흐름

강의 repo에서 `git push` → 메인 사이트 재빌드. 트리거 2가지 (cron 안 씀):

1. **`notify.yml` (강의 repo, 주 경로)** — push 트리거로 `milab` repo 배포 워크플로 호출.
   push 후 약 1~2분 내 라이브. 웹 UI·폰·다른 PC 어디서 push하든 동작.
   ```yaml
   name: notify milab
   on: { push: { branches: [main] } }
   jobs:
     notify:
       runs-on: ubuntu-latest
       steps:
         - run: gh workflow run deploy.yml -R jaehoonoh-pnu/milab
           env:
             GH_TOKEN: ${{ secrets.MILAB_DEPLOY_TOKEN }}
   ```
   - `MILAB_DEPLOY_TOKEN` = fine-grained PAT.
     - Resource owner: `jaehoonoh-pnu`, Repository access: **`milab` 하나만**
     - Permissions: **Actions → Read and write** 하나만 (그 외 전부 No access)
     - 만료: 1년 권장(달력에 갱신 알림) 또는 무기한. 유출 시 피해 = "정적 사이트 재빌드 실행"뿐.
     - 두 강의 repo 각각에 `MILAB_DEPLOY_TOKEN` 이름으로 secret 등록 (`gh secret set`).
   - `deploy.yml` 의 `prebuild` 훅이 `sync-lectures` 를 돌리므로 최신 강의 콘텐츠가 반영됨.
2. **수동 버튼 (fallback)** — GitHub → milab → Actions → deploy → "Run workflow".
   설정 불필요. notify 가 실패했거나 즉시 재배포하고 싶을 때.

## 콘텐츠 스키마 (`courses` 컬렉션, `src/content.config.ts`)

```ts
const courses = defineCollection({
  loader: glob({ pattern: "*/course.md", base: "./lectures" }),
  schema: z.object({
    title: z.string(),                 // 고급딥러닝
    titleEn: z.string().optional(),    // Advanced Deep Learning
    term: z.string(),                  // "2026 Fall" (표시용)
    semester: z.string(),              // "2026-02" (정렬·그룹핑용, YYYY-SS)
    instructor: z.string().optional(),
    schedule: z.string().optional(),   // "월/수 15:00–16:15"
    location: z.string().optional(),
    credits: z.number().optional(),
    summary: z.string(),               // 목록 페이지 한 줄 소개
    weeks: z
      .array(
        z.object({
          n: z.number(),
          topic: z.string(),
          date: z.string().optional(),
        }),
      )
      .default([]),
  }),
});
```

- 엔트리 id = `<slug>/course` → `slug = id.split("/")[0]`.
- `course.md` 본문(마크다운) = Goals / 다루는 내용 / 평가 등. 수식(`$…$`) 지원(기존 파이프라인).

## 라우트 동작

### `/lecture` (`index.astro` 재작성)

`getCollection("courses")` → `semester` 내림차순 그룹핑 → 학기별 섹션.
각 강의: `title` + `titleEn` + `summary`, `→ /lecture/<slug>` (withBase). 현 하드코딩 `semesters` 제거.
강의가 하나도 없으면 "준비 중" 문구.

### `/lecture/[course].astro` (신규)

`getStaticPaths` — courses 각 항목 → `{ params: { course: slug }, props: { entry } }`.

렌더 (hanlab 스타일, 위→아래):

1. 헤더 — `titleEn` 큰 제목 + `title` 부제 (titleEn 없으면 title 만)
2. 정보 줄 — `term` · `{credits}학점` · `instructor` / `schedule` / `location` (있는 항목만)
3. 본문 — `<Content />` (`.prose` 계열 스타일, 교수 소개 본문 렌더 방식 참고)
4. Schedule — `weeks[]` 있으면 `주차 | (날짜) | 주제` 표. 링크 없음.

BaseLayout + PageHeader 재사용. 인라인 JS/스타일 0 유지, CSP 그대로.

## CI (`.github/workflows/deploy.yml`)

```yaml
on:
  push: { branches: [main] }
  workflow_dispatch:            # notify.yml / 수동 버튼이 이걸 호출
# …
      - run: npm ci
      - run: npm run lectures:sync
      - run: npm run build
```

- `on.schedule` (cron) 없음 — 트리거는 push + workflow_dispatch 뿐.
- `actions/checkout` 의 `submodules` 주석 줄 삭제(안 씀).
- 공개 repo clone → 토큰 불필요. (강의 repo → milab 트리거용 PAT 는 위 "재배포 흐름" 참고)

## 부트스트랩 순서 (구현)

1. **메인 repo 스캐폴딩** — `sync-lectures.mjs`, `lectures.config.json`(빈 `[]` 로 시작),
   `.gitignore`(`/lectures/`), package.json 스크립트, `content.config.ts` courses,
   `/lecture` 재작성, `[course].astro`, `deploy.yml`, `dev.ps1`.
   임시로 로컬에 `lectures/2026f-advanced-deep-learning/course.md` 등을 직접 만들어 빌드 스모크
   (매니페스트에 없는 로컬 폴더 → sync 가 건드리지 않음). 확인 후 삭제.
2. **강의 repo 2개 생성** — `gh repo create … --public`, 각각 `course.md` 초안 +
   `.github/workflows/notify.yml` 커밋·push.
3. **PAT 발급** — fine-grained, repo = `jaehoonoh-pnu/milab`, 권한 = Actions: write.
   두 강의 repo 에 `MILAB_DEPLOY_TOKEN` secret 으로 등록. (교수님이 발급 → 값 전달, 또는
   `gh secret set` 로 등록만 대행)
4. **연결** — 로컬 `lectures/` 비우고 `npm run lectures:sync` → clone 확인 → `npm run build`.
5. **배포** — 메인 커밋·push → Actions → `/milab/lecture/2026f-advanced-deep-learning` 확인.
6. **트리거 확인** — 강의 repo `course.md` 한 줄 고쳐 push → milab 배포 자동 실행 → 반영 확인.

## 검증

- `npm run lectures:sync`: 두 repo clone, 재실행 시 갱신, 잘못된 repo URL 이면 exit 1.
- `/lecture`: "2026 Fall" 그룹에 두 강의, summary 표시, 링크 정상.
- 각 첫 페이지: 헤더/정보줄/Goals 본문/Schedule 표 렌더, 링크 안 깨짐.
- `npm run build` 경고 0, `astro check` 0/0/0.
- 배포 후 실제 URL 접속.
- 강의 repo `course.md` 수정·push → milab 배포 자동 실행(`notify.yml`) → 1~2분 내 사이트 반영.

## 후속 (이번 스펙 밖)

- 주차 노트: `weeks/NN-*.md(x)` → `lectureNotes` 컬렉션 → `/lecture/<slug>/<week>`,
  `weeks[]` 표 행에 `slug` 필드로 링크. 이전/다음 네비.
- 인터랙티브 위젯: 메인 repo에 컴포넌트 구현 + `<Content components={…} />` 주입, React 재도입.
- 에셋 동기화 스크립트(`lectures/<slug>/public/**` → `public/lectures/<slug>/**`).
- 강의 repo 템플릿(`notify.yml` + `course.md` 골격 포함, `gh repo create --template`).
