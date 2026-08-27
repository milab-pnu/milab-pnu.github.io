# milab

부산대학교 **Multimodal Intelligence Lab (MI Lab)** 웹사이트.

- 프레임워크: [Astro](https://astro.build) (정적 빌드)
- 스타일: Tailwind CSS v4
- 수식: remark-math + rehype-katex (빌드 타임 렌더, 런타임 JS 불필요)
- 언어: 한국어

## 개발

```sh
npm install
npm run dev       # 개발 서버 (포그라운드) — http://localhost:4321/milab
npm run build     # dist/ 로 정적 빌드
npm run preview   # 빌드 결과 미리보기
```

### 개발 서버 켜고 끄기 (백그라운드)

`npm run dev` 는 터미널을 물고 있어서, 서버를 백그라운드로 띄우고
다른 작업을 하려면 `dev.ps1` 스크립트를 쓴다.

```powershell
.\dev.ps1            # 시작 (= start)
.\dev.ps1 stop       # 종료
.\dev.ps1 status     # 실행 여부
.\dev.ps1 logs       # 로그 (-Follow 로 실시간)
.\dev.ps1 restart    # 재시작
```

PowerShell 이 아니거나 스크립트 실행이 막혀 있으면 npm 스크립트로도 동일하게:

```sh
npm run dev:bg       # 시작 (백그라운드)
npm run dev:stop     # 종료
npm run dev:status   # 실행 여부
npm run dev:logs     # 로그
```

> 처음 한 번 스크립트 실행이 막히면(실행 정책):
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 또는
> `powershell -ExecutionPolicy Bypass -File .\dev.ps1 start`

### 로컬 개발 서버 vs 공개 사이트

이 둘은 완전히 별개다.

| | 주소 | 누가 보나 | 언제 갱신 | 켜고 끄기 |
|---|---|---|---|---|
| **로컬 개발 서버** | `http://localhost:4321/milab` | 내 컴퓨터에서만 | 파일 저장 즉시 | 내가 `dev.ps1` 로 |
| **공개 사이트** | `https://jaehoonoh-pnu.github.io/milab/` | 누구나 | `main` 에 push 시 자동 (~1분) | 안 함 — GitHub 가 계속 호스팅 |

- 로컬 개발 서버는 **수정하면서 미리 보는 용도**다. 외부에서는 접속 못 한다.
  안 켜도 공개 사이트는 정상 동작한다.
- 공개 사이트는 GitHub Pages 가 **항상 켜 둔다**(무료, 관리 불필요). `git push` 하면
  서버를 껐다 켜는 게 아니라 `.github/workflows/deploy.yml` 이 새로 빌드해 **파일만 교체**한다.
- 나중에 학교 서버로 옮기면 그때는 그 서버가 항상 떠 있어야 한다(아래 "학교/연구실 서버로 이전").

## 구조

```
src/
├── consts.ts              # 사이트 정보(SITE), 네비게이션, withBase()/iconFor() 헬퍼
├── content.config.ts      # 콘텐츠 컬렉션 스키마 (news / members / courses / lectureNotes)
├── content/
│   ├── news/              # 메인 "최신 뉴스" — md 1개 = 항목 1개
│   └── members/           # 구성원 — md 1개 = 1명 (frontmatter)
├── data/                  # publications.bib / preprints.bib (Paper 페이지 소스)
├── lib/bibtex.ts          # .bib 파서 (파싱 실패 시 빌드를 세움)
├── layouts/               # BaseLayout(사이트 크롬) · NoteLayout(강의 노트, 크롬 없음)
├── components/            # HeadMeta, Nav, Footer, PageHeader, MemberCard,
│                          #   MemberLinks, ProfileList, PaperList, Icon
└── pages/
    ├── index / members / alumni / project / paper / 404
    └── lecture/           # index(목록) · [course]/index(강의) · [course]/[note](주차 노트)

lectures.config.json       # 강의 repo 목록 [{ slug, repo, ref }]  (아래 "강의 페이지")
scripts/
├── sync-lectures.mjs      # 위 목록의 repo 를 lectures/<slug>/ 로 clone (빌드 전 자동)
├── new-lecture.ps1        # 새 강의 repo 생성·클론·스캐폴드 자동화
└── lecture-template/      # 새 강의 골격 파일
lectures/                  # sync-lectures 가 clone 하는 곳 (.gitignore — 커밋 안 됨)
docs/superpowers/specs/    # 설계 문서
```

### 콘텐츠 수정 방법

- **뉴스 추가**: `src/content/news/2026-09-01-something.md` 생성, frontmatter에 `title`, `date`.
- **구성원 추가**: `src/content/members/NN-name.md` 생성.
  - `role`: professor / postdoc / phd / ms / undergrad
  - `title`: 입학 시기 등 (예: `"2026.09 ~"`)
  - `email`: 카드에 텍스트로 표시됨
  - `order`: 정렬 (작을수록 위)
  - `photo`: 사진을 `public/members/` 에 두고 `photo: "/members/파일명.jpg"` (jpg/png/webp, 정사각형 권장)
  - `alumni: true`: Members 에서 빠지고 **Alumni** 페이지(Ph.D./M.S. 구분)로 이동. role 은 phd/ms 유지.
  - professor 는 `education` / `workHistory` 배열(한 줄 = 한 항목)과 본문(소개글)이 크게 표시됨.
- **논문 추가/수정**: `src/data/publications.bib` (학회·워크샵) 또는 `src/data/preprints.bib` 에
  BibTeX 항목 추가. 저자는 `\underline{Jaehoon Oh}` 로 감싸면 굵게, `*` 는 동등 기여로 표시됨.
  venue 는 `booktitle`(publication) / `journal`(preprint, `arXiv:xxxx` 또는 URL) 사용.
  - **링크**: 항목에 `url = {https://...}` 필드를 추가하면 제목이 그 주소로 링크됨
    (모든 항목 공통). 없으면 preprint 는 arXiv/OpenReview 주소를 자동 인식.
- **강의**: 이 repo 가 아니라 `pnu/lectures/<학기>/<과목>/` 에서 고친다 (아래 "강의 페이지").
- 페이지 본문(과제 소개 문구 등)은 해당 `src/pages/*.astro` 파일에서 직접 편집.
- 사이트 이름·이메일·연구실 정보는 `src/consts.ts` 의 `SITE` 객체.

## 배포 (GitHub Pages)

1. 이 저장소를 GitHub 에 push (`main` 브랜치).
2. 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.
3. `astro.config.mjs` 의 `site` 를 실제 값으로 수정:
   - project pages: `site: 'https://<GitHub사용자명>.github.io'`, `base: '/milab'` (현재 기본값)
   - 사용자/조직 pages 또는 커스텀 도메인: `base` 를 `'/'` 로.
4. `main` 에 push 하면 `.github/workflows/deploy.yml` 이 자동 빌드·배포.

## 학교/연구실 서버로 이전

정적 사이트라 이전이 단순하다. 서버에는 **Node 런타임이 필요 없다** (빌드는 CI 또는 로컬에서).

1. `astro.config.mjs` 수정: `site` 를 새 도메인(예: `https://milab.pusan.ac.kr`),
   루트 서빙이면 `base: '/'`.
2. 빌드: `npm ci && npm run build` → `dist/` 생성.
3. 웹서버(nginx 예시)에서 `dist/` 를 정적 서빙:
   ```nginx
   server {
     server_name milab.pusan.ac.kr;
     root /var/www/milab/dist;
     index index.html;
     location / { try_files $uri $uri/ $uri.html =404; }
   }
   ```
4. HTTPS: Let's Encrypt `certbot --nginx` (또는 학교 제공 인증서).
5. 배포 자동화(선택): GitHub Actions 에서
   `rsync -az --delete dist/ user@milab.pusan.ac.kr:/var/www/milab/dist/` (SSH 키 등록).

필요한 것 요약: **① 서브도메인/DNS (학교 전산팀), ② nginx/Apache, ③ HTTPS 인증서,
④ (자동배포 시) 서버 SSH 접근**.

## 강의 페이지

강의 하나 = **독립 GitHub repo** (콘텐츠 전용, 빌드 도구 없음). 메인 repo 는
`lectures.config.json` 목록만 갖고, 빌드 전에 `scripts/sync-lectures.mjs` 가 각 repo 를
`lectures/<slug>/` 로 `git clone` 한다. **git submodule 이 아니다** (편집마다 포인터
커밋이 필요한 마찰을 피함). 상세: `docs/superpowers/specs/2026-08-27-lecture-content-repos-design.md`.

### 작업 위치 — `pnu/lectures/<학기>/<과목>/`

각 강의는 그 폴더에 **미리 클론**되어 있다 (`origin` = 해당 GitHub repo).
강의 자료는 **항상 여기서** 만지고 `git push` 한다. `milab-pnu` 안의 `lectures/` 폴더는
자동 빌드용이라 건드리지 않는다.

```
pnu/
├── milab-pnu/                        # 사이트 코드 (이 repo)
│   └── lectures/                     # 자동 clone (건드리지 말 것)
└── lectures/                         # ← 여기서 작업
    └── 2026-02/
        ├── advanced_deep_learning/   # = github.com/jaehoonoh-pnu/2026f-advanced-deep-learning
        └── applied_data_science/     # = github.com/jaehoonoh-pnu/2026f-applied-data-science
```

### 강의 자료 수정 (평소)

`pnu/lectures/2026-02/advanced_deep_learning/` 에서 `course.md` 나 `weeks/*.md` 를 고치고
`git push`. 그 repo 의 `.github/workflows/notify.yml` 이 메인 사이트 재배포를 트리거
→ 1~2분 뒤 반영. 로컬 미리보기는 `milab-pnu` 에서 `.\dev.ps1`.

강의 repo 구조:

```
<slug>/
├── course.md          # 강의 첫 페이지 (개요 + Schedule 표) — MI Lab 사이트 크롬 있음
└── weeks/             # 주차별 강의노트 — 파일 1개 = 웹페이지 1개
    ├── 01-intro.md
    ├── 01b-setup.md   # 같은 주차에 여러 개 가능
    ├── 02-optim.md
    └── assets/        # 노트에 넣을 이미지 (상대경로로 참조)
        └── diagram.png
```

강의 노트 페이지(`/lecture/<slug>/<노트>`)는 **사이트 네비/푸터 없는 독립 문서**로 렌더된다
(읽기 중심, 맨 아래에 "← 전체 일정" 링크만). 강의 첫 페이지(`course.md`)는 사이트 크롬 있음.

`course.md` frontmatter: `title`, `titleEn?`, `term`("2026 Fall"), `semester`("2026-02",
정렬용), `instructor?`, `schedule?`, `location?`, `credits?`, `summary?`(검색엔진용 메타
설명, 화면엔 안 보임), `weeks?` — 강의 계획 표. 각 항목:
`{ n: 주차번호, topic: "주제", date?: "2026-09-01", discussion?: 3 }`.
`discussion` = 그 강의 repo 의 GitHub Discussion 번호(주차별 토론 스레드).
본문(마크다운)은 Goals 등으로 표시, 수식 `$…$` 가능.

`weeks/*.md` (또는 `.mdx`) frontmatter: `title`, `week`(숫자 — `course.md` 의 `n` 과 매칭),
`order?`(같은 주차 내 정렬). 본문은 그 노트 페이지가 되고 Schedule 표 "강의자료" 컬럼에
링크된다. 수식·코드블록 됨.

**이미지 / 로딩**: `weeks/assets/` 에 이미지를 두고 `![설명](./assets/그림.png)` 로 참조하면
빌드 때 자동으로 **WebP 변환 + 크기 지정 + `loading="lazy"`** 처리된다 (원본은 적당한
해상도로, 수천 px 짜리는 미리 줄여서). 각 노트는 독립 정적 HTML 이라 방문할 때만 로드된다.
슬라이드 PDF·데이터셋처럼 큰 파일은 페이지에 심지 말고 링크로.
**인터랙티브 위젯(JS)** 은 아직 안 됨 — 필요하면 `.mdx` + React 재도입 + CSP 수정.

주차별 토론: 강의 repo 의 **Discussions** 탭을 쓴다. 스레드를 하나 만들고
(`gh discussion create -R jaehoonoh-pnu/<slug> --category "Q&A" --title "N주차 토론"`)
그 번호를 `course.md` `weeks[].discussion` 에 적으면 표에 "토론 ↗" 링크가 생긴다.

#### 주의점

- **`milab-pnu/lectures/` 폴더에서 직접 커밋하지 말 것.** sync 스크립트가 매번
  덮어쓰는(detached HEAD) 빌드 입력물이다. 편집은 `pnu/lectures/<학기>/<과목>/` 에서.
- `MILAB_DEPLOY_TOKEN` PAT 이 **만료되면 자동 재배포가 조용히 멈춘다.** 그럴 땐
  milab → Actions → deploy → "Run workflow" 로 수동 배포하거나 PAT 재발급(아래).
- `slug` 은 소문자·숫자·하이픈만. `lectures.config.json` 의 `slug` = 클론될 폴더명 = URL
  경로(`/lecture/<slug>`) 로 그대로 쓰인다.
- 강의 repo 는 **public** 이어야 한다(빌드 시 토큰 없이 clone). private 로 하려면 sync
  단계에 토큰이 추가로 필요하다.

### 새 강의 추가

스크립트 하나로 repo 생성 · 작업 폴더 클론 · 스캐폴드 · Discussions · secret 을 처리한다:

```powershell
# milab-pnu 에서 실행
.\scripts\new-lecture.ps1 -Slug 2027s-machine-learning `
    -Path ..\lectures\2027-01\machine_learning `
    -Pat github_pat_xxxxx          # 생략하면 secret 만 수동
```

그다음 스크립트가 안내하는 2가지만:

1. `pnu/lectures/2027-01/machine_learning/course.md` 를 실제 내용으로 채우고 `git push`
2. `milab-pnu/lectures.config.json` 에 스크립트가 출력한 한 줄 추가 → 커밋 · push

수동으로 하려면: repo 생성(`gh repo create … --public`) → `scripts/lecture-template/` 파일
복사(`notify.yml`, `.gitattributes`, `course.md`) → 커밋·push → `gh repo edit … --enable-discussions`
→ `gh secret set MILAB_DEPLOY_TOKEN -R …` → `lectures.config.json` 에 항목 추가.

### 재배포 트리거용 PAT (`MILAB_DEPLOY_TOKEN`)

강의 repo 의 Action 이 이 repo 의 배포를 실행하려면 토큰이 필요하다.
GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate:

- Repository access: **`milab` 만**
- Permissions: **Actions → Read and write** (그 외 전부 No access)
- 만료되면 트리거가 조용히 멈추므로 갱신 필요 (또는 무기한). 유출 시 피해 = 사이트 재빌드 실행뿐.

발급한 `github_pat_…` 을 각 강의 repo 의 `MILAB_DEPLOY_TOKEN` secret 으로 등록
(`gh secret set MILAB_DEPLOY_TOKEN -R jaehoonoh-pnu/<slug>`).

### 오래된 강의

`lectures.config.json` 항목은 그대로 두면 페이지도 유지된다. 콘텐츠를 고정하려면
`"ref"` 를 `"main"` 대신 태그나 커밋 SHA 로 바꾼다. 목록에서 빼면 사이트에서 사라진다
(repo 와 히스토리는 남음).
