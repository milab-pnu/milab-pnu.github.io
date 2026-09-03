# 강의 자료 작성 가이드

강의 콘텐츠(강의 소개 + 주차별 노트)를 만들고 사이트에 올리는 방법. **이 문서가
강의 작성 관련 규칙의 정본이다.** 새로 알게 된 규칙·함정은 해당 절에 반영하고 커밋한다
(맨 아래 "이 문서 관리" 참고).

시스템이 어떻게 도는지(sync·CI·배포 메커니즘)는 `../README.md` 의 "강의 페이지" 절 참고.

## 작업 위치

강의 하나 = **독립 GitHub repo**. 각 repo 는 `pnu/lectures/<학기>/<과목>/` 에 클론되어 있고
(`origin` = 그 repo), **강의 자료는 항상 거기서** 수정하고 `git push` 한다.

```
pnu/
├── milab-pnu/                        # 사이트 코드
│   └── lectures/                     # 빌드용 자동 clone — 절대 손대지 않음
└── lectures/                         # ← 작업 공간
    ├── CLAUDE.md                     # 얇은 요약 (이 문서를 가리킴)
    └── 2026-02/
        ├── advanced_deep_learning/   # = github.com/milab-pnu/2026f-advanced-deep-learning
        └── applied_data_science/     # = github.com/milab-pnu/2026f-applied-data-science
```

## 평소 수정 흐름

```sh
cd pnu/lectures/2026-02/advanced_deep_learning
# course.md 또는 weeks/*.md 수정 → 빌드·검사 통과 확인 → 커밋
git add -A && git commit -m "..."
# push 는 사용자에게 "푸쉬할까요?" 물어보고 승인받은 뒤
git push
```

**push 는 매번 확인받는다** (과목 repo·`milab-pnu` 둘 다). 커밋은 자유롭게 쌓고,
push 만 사용자 승인 게이트. 여러 커밋을 모아 한 번에 물어봐도 된다.

push → 그 repo 의 `.github/workflows/notify.yml` 이 사이트 재배포를 트리거 → **1~2분 뒤 반영**.
로컬 미리보기: `cd pnu/milab-pnu && ./dev.ps1` → http://localhost:4321/
(dev 서버는 시작할 때 GitHub 에서 최신 강의 콘텐츠를 당겨온다 → **push 안 한 로컬 커밋은
미리보기에 안 뜬다.** 바로 보려면 push 가 확실).

## 주차 노트: 내용 채우기 절차

주차 노트는 **강의를 대체할 수 있는 읽을거리**를 목표로 한다. 슬라이드 요약이 아니라,
읽는 것만으로 그 주차 내용을 따라갈 수 있어야 한다. 분량 제한은 없다.

1. **사용자가 다룰 내용을 제시한다.** 필요하면 survey 논문·교재의 특정 절·페이지를
   정확히 지정한다. 과목마다 강조점이 다르므로(이론 깊이 / 구현 / 응용 등) 그 지시도
   여기서 받는다 — 이 문서에 과목별 규칙을 적지 않는다.
2. **자료조사를 꼼꼼히 한다.**
   - **1차 출처(원논문)** 로 사실·수식·수치를 확정한다. reference 는
     저자·연도·학회/저널·페이지·arXiv 번호까지 정확하게, 인용한 절·그림 번호를
     `<References>` 항목 안에 명시한다 (`01-transformers.mdx` 참고).
   - **잘 정리된 해설 블로그·튜토리얼·강의를 적극적으로 찾는다.** 원논문만으로는
     설명이 건조하다 — 그 주제를 가장 잘 풀어낸 2차 자료(예: Transformers 라면
     "The Illustrated Transformer", "The Annotated Transformer", Lilian Weng,
     3Blue1Brown)를 찾아 **설명 방식·비유·그림을 참고**하고, 쓸 만하면 출처를 달아
     `<Figure>`·`<Video>` 로 넣거나 `<References>` 에 함께 싣는다.
   - 여러 자료가 엇갈리면 원논문을 따르고, 흔한 오해는 `<Callout type="warning">` 로 짚는다.
3. **작성한다.**
   - 흐름이 끊기지 않게. 이해 안 된 채 넘어가는 문장이 없어야 한다.
   - 구성요소마다 **무엇을 계산하는가 · 왜 그렇게 하는가 · 작은 예시** 순서.
   - 용어는 기본적으로 **영어**(technical term). 한글로 풀어쓰되 핵심 용어는 영어 병기.
   - 수식은 직관과 함께. 유도가 길면 `<Details>` 로 접는다.
   - 그림·영상은 **외부에서 가져와** `<Figure>`·`<Video>` 로 넣는다(출처 표기 필수).
     설명·외부 자료로 부족할 때만 인라인 `<svg>` 개념도를 직접 그린다(최후 수단).
   - 곁가지 설명은 `<Sidenote>`, 강조/직관/주의/예시는 `<Callout>`.
   - 직관 설명이 막히면 `eli5` 스킬을 쓴다.
   - 톤·구성 참고: <https://thinkingmachines.ai/blog/interaction-models/>
4. **검토한다.** 수식 기호 일관성, `<Cite>` ↔ `<References>` 매칭, 용어 통일,
   heading 에 수식 없음, 문단 간 논리 연결을 확인한다. `npm run build` 로
   `check-lecture-notes.mjs` 를 통과시킨다.
5. **push 한다.** 과목 폴더에서 커밋 → push → 1~2분 뒤 라이브.

## 강의 repo 구조

```
<slug>/
├── course.md              # 강의 소개 페이지 (개요 + Schedule 표) — 사이트 네비 있음
├── weeks/
│   ├── 01-intro.md        # 주차 노트 1개 = 웹페이지 1개 — 사이트 네비 없는 독립 문서
│   ├── 01b-setup.md       # 같은 주차에 여러 개 가능 (order 로 정렬)
│   ├── 02-optim.md
│   └── assets/            # 노트에 넣는 이미지 (상대경로 참조)
├── .github/workflows/notify.yml   # 손대지 않음
└── .gitattributes                 # 손대지 않음
```

주차 노트 페이지(`/lecture/<slug>/<노트>`)는 **MI Lab 사이트 크롬(네비·푸터·로고) 없이**
읽기 중심 독립 문서로 렌더된다 (맨 아래 "← 전체 일정" 링크만). `course.md` 페이지는 크롬 있음.

## frontmatter 스키마

실제 강제되는 정의는 `../src/content.config.ts` (`courses`, `lectureNotes` 컬렉션). 아래는 요약.

### `course.md`

| 키 | 필수 | 설명 |
|---|---|---|
| `title` | ✓ | 한글 과목명 |
| `titleEn` |  | 영문명 |
| `term` | ✓ | 표시용 학기 (예: `2026 Fall`) |
| `semester` | ✓ | 정렬용 `YYYY-SS`, 따옴표 필수 (예: `"2026-02"`) |
| `instructor` |  | |
| `schedule` |  | 예: `월/수 15:00–16:15` |
| `location` |  | |
| `credits` |  | 숫자 |
| `summary` |  | 검색엔진용 한 줄. 화면엔 안 보임 |
| `weeks` |  | 계획표. 항목: `{ n: 1, topic: "주제", date?: "2026-09-01" }` |

본문(마크다운)은 Goals / Prerequisites / Grading 등으로 표시된다.

### `weeks/*.md` 또는 `.mdx`

| 키 | 필수 | 설명 |
|---|---|---|
| `title` | ✓ | 노트 제목 |
| `week` | ✓ | 숫자. `course.md` 의 `weeks[].n` 과 매칭 → 계획표 "강의자료" 컬럼에 링크됨 |
| `order` |  | 같은 주차 내 정렬 (기본 0) |

컴포넌트(`<Figure>` 등, 아래 "강의 노트 컴포넌트")를 쓰려면 `.mdx`. 순수 마크다운이면
`.md` 로 둬도 새 레이아웃(3구역·목차)은 그대로 적용된다. `.mdx` 에서는 텍스트의 `{` 가
JS 표현식으로 해석되니 주의 (인라인 `$...$` 수식 안의 `{}` 는 무방).

## 수식

- 인라인: `$...$`
- 디스플레이: `$$` 를 **각각 별도 줄**에 둔다 —

  ```
  $$
  \theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}(\theta)
  $$
  ```

  한 줄로 `$$...$$` 쓰면 인라인 취급된다 (remark-math 규칙).
- 빌드 때 **MathML** 로 렌더 (KaTeX JS·CSS 런타임 불필요). 이유는 아래 "설계 배경".

## 코드블록

` ```python ` 처럼 언어를 붙여도 된다. 단 **syntax highlighting 은 꺼져 있어**
어두운 배경에 단색으로 나온다 (이유는 아래 "설계 배경"). 코드 내용·들여쓰기는 그대로 유지됨.

## 이미지 / 로딩

- **외부 이미지가 기본 수단이다.** `<Figure src="https://…" />` 로 논문·블로그의 그림을
  직접 참조한다. 강의 노트 경로는 완화 CSP(`img-src https:`)라 외부 https 이미지가 뜬다.
  `source` prop 으로 **출처를 반드시 표기**한다.
- 상대경로 로컬 이미지(`./assets/그림.png`, `<Figure src="./assets/…" />`)도 쓸 수 있다.
  Astro 콘텐츠 컬렉션의 상대경로 이미지는 자동 최적화(webp·크기·lazy)를 거친다.
  **외부 URL 이미지는 최적화 없이 그대로 나간다** — 원본을 적당한 해상도로.
- 설명·외부 그림으로 부족하면 **인라인 `<svg>` 다이어그램**을 직접 그린다(최후 수단).
  CSP 상 `style=`·`<style>` 불가 → presentation 속성(`fill=`, `stroke=`, `font-size=`)만.
  `01-transformers.mdx` 에 예시가 있다. **한 노트 안의 SVG 는 viewBox 크기·글자
  크기·박스 규격·색을 서로 맞춘다** — 안 그러면 그림마다 축척이 달라 보인다.
  현재 팔레트: 박스 `#f8fafc`/`#e2e8f0`, 강조 `#0f172a`, 보조 텍스트 `#64748b`,
  연결선 `#0f172a`(강조)·`#94a3b8`(약).
- **그림 폭은 CSS 가 통일한다** — 원본 해상도와 무관하게 hero 40rem, 그 외 모든
  `<Figure>`·`<figure>` 는 32rem 로 고정되고 가운데 정렬된다. 즉 큰 이미지를 넣어도
  본문을 가득 채우지 않는다. `wide` prop 은 현재 일반과 동일하게 취급된다.
- 슬라이드 PDF·데이터셋 등 **큰 파일은 페이지에 심지 말고 링크로**.
- 각 노트는 독립 정적 HTML → 방문할 때만 로드. 페이지 하나가 너무 커지면 주차 노트를 쪼갠다.

## 강의 노트 컴포넌트 (MDX)

`weeks/*.mdx` (`.mdx` 확장자) 에서 **import 없이** 아래 컴포넌트를 태그로 쓴다.
`src/pages/lecture/[course]/[note].astro` 가 `<Content components={…}>` 로 주입한다.
`.mdx` 는 **`milab-pnu` 빌드를 통해서만** 제대로 렌더된다(단독으로 열면 안 됨).
컴포넌트는 전부 `milab-pnu/src/components/lecture/` 에 있다.

| 컴포넌트 | 용법 | 비고 |
|---|---|---|
| `<Sidenote>…</Sidenote>` | 본문 옆 우측 여백 주석 | **문장 끝에 붙여 쓴다**(`…한다.<Sidenote>…</Sidenote>`) — 단독 줄에 두면 본문 위첨자 번호가 허공에 뜬다. 자동 번호. 좁은 화면은 인라인. 설명 전용 — 인용은 `<Cite>` |
| `<Figure src alt caption? source? wide? hero? />` | 그림 + 캡션 + 출처 | `alt` 필수. `source` 로 출처 표기 필수. `wide`=본문보다 넓게, `hero`=최상단 전체 폭 |
| `<Video src caption? />` | YouTube/Vimeo 임베드 | URL 파싱 → nocookie iframe. **그 외 URL 은 빌드 실패** |
| `<Callout type="intuition"\|"warning"\|"example"\|"note">…</Callout>` | 강조 박스 | 라벨: 직관/주의/예시/노트 |
| `<Details summary="…">…</Details>` | 접이식 블록 | 긴 유도·보충. 네이티브 `<details>` |
| `<Cite n={N} />` | 본문 인용 위첨자 `[N]` | 클릭 → 하단 참고문헌. **`items` 에 없는 N 은 빌드 검사 실패** |
| `<References items={[{ id, text }]} />` | 노트 하단 참고문헌 목록 | 서지정보 완전하게. 지정된 절·페이지 명시 |

- 좌측 목차는 `##`/`###` 마크다운 heading 에서 자동 생성된다. **heading 에 `$수식$`
  을 넣지 않는다**(목차 텍스트가 깨짐) — 유니코드로.
- 컴포넌트 목록을 바꾸면 `[note].astro` 의 주입 객체와 이 표를 함께 갱신한다.

## 새 강의 추가

```powershell
cd pnu/milab-pnu
./scripts/new-lecture.ps1 -Slug 2027s-machine-learning `
    -Path ..\lectures\2027-01\machine_learning `
    -Pat github_pat_xxxxx        # milab-pnu.github.io Actions:write PAT — 기존 MILAB_DEPLOY_TOKEN 재사용 가능 (아래 참고)
```

스크립트가: GitHub repo 생성 → 작업 폴더 클론 → 골격 복사(`scripts/lecture-template/`)
→ `MILAB_DEPLOY_TOKEN` secret 등록. 그다음 직접:

1. `course.md` 를 실제 내용으로 채우고 `git push`
2. `../lectures.config.json` 에 스크립트가 출력한 한 줄 추가 → 커밋 · push

`-Pat` 생략 시 secret 만 수동: `gh secret set MILAB_DEPLOY_TOKEN -R milab-pnu/<slug>`
(PAT 발급 방법은 `../README.md` "재배포 트리거용 PAT").

## 주의점

- **`milab-pnu/lectures/` 에서 커밋하지 않는다.** sync 가 매번 덮어쓰는 빌드 입력물이다.
- **GitHub 쓰기 API 를 몰아서 호출하지 않는다** (예: `gh` 를 짧은 시간에 루프로 십수 번,
  더구나 여러 repo 에 걸쳐). 어뷰징 탐지에 걸려 **계정이 정지**된다 (실제로 겪음 — 복구에
  며칠, 그동안 push·Pages·gh 전부 차단). write 작업은 소량씩 간격을 두고.
- 배포가 "성공" 인데 사이트 반영이 안 되면 (드묾): milab → Actions → deploy → "Run workflow".
- `MILAB_DEPLOY_TOKEN` PAT 만료 시 자동 배포가 조용히 멈춘다 → 수동 버튼 or 재발급.
- `slug` 은 소문자·숫자·하이픈만. `lectures.config.json` 의 `slug` = 클론 폴더명 = URL 경로.
- 강의 repo 는 **public**. 비밀정보·비공개 개인정보를 넣지 않는다.
- 언어는 한국어 (커밋 메시지·주석 포함).
- 강의 repo 커밋 트레일러:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

## 이 문서 관리

이 문서가 강의 작성 규칙의 정본이다. 작업하다 새 규칙·함정을 알게 되면 **해당 절에
바로 반영하고 `milab-pnu` 에 커밋한다** — `pnu/lectures/` 는 git repo 가 아니라 거기
적으면 사라진다. 짧은 팁은 "주의점" 절에 한 줄 추가한다. 날짜 붙인 변경 로그는 만들지
않는다 (규칙은 항상 현재형으로 유지).

## 건드리기 전에 알아야 할 설계 배경

사이트 대부분이 **엄격 CSP**(`style-src 'self'`, `script-src 'none'`, `img-src 'self'`)로
돌아서, 인라인 `style=` 이나 런타임 JS·외부 자원을 쓰는 렌더링은 조용히 깨진다. 아래는
그 때문에 내려진 결정이라 되돌리면 안 된다:

- **수식 → MathML** (`astro.config.mjs`, `rehype-katex { output: 'mathml' }`). KaTeX 의
  기본 HTML 출력은 인라인 style 범벅이라 CSP 에 막힌다. HTML 출력으로 되돌리면 수식이 깨짐.
- **코드블록 하이라이팅 꺼짐** (`markdown.syntaxHighlight: false`). Shiki 가 토큰마다
  인라인 `style=` 로 색을 넣어 CSP 에 막힌다 + 사이트는 무채색 방침. 켜지 않는다.
- **강의 노트 페이지(`/lecture/<course>/<note>`)만 완화 CSP.** `NoteLayout` 이
  `HeadMeta` 의 `csp` prop 으로 넘긴다: `script-src 'self'`(번들 아닌 정적 파일
  `public/lecture-nav.js` 목차 추적 스크립트 1개), `img-src https:`(외부 이미지),
  `frame-src` = YouTube-nocookie·Vimeo(영상 임베드). 인라인 `<script>`·CDN 은 여전히
  차단 — Astro 가 작은 모듈 스크립트를 HTML 에 인라인해버리므로 노트용 JS 는 `public/`
  정적 파일로 두고 `<script is:inline src>` 로 부른다. 그 외 모든 페이지는 엄격 CSP.
- **빌드 검사** `scripts/check-lecture-notes.mjs` 가 `postbuild` 로 돌며 산출물에서
  노트 페이지의 CSP·인라인 `style=`/`<script>`·인용 무결성을, 그 외 페이지의 엄격 CSP
  유지를 확인한다. 테스트 프레임워크는 없다.
- **`lectures/_dev-fixture/`** (`.gitignore` 됨, 로컬 전용): 8개 컴포넌트를 전부 쓰는
  회귀 픽스처. 표현 계층을 고칠 때 강의 repo sync 없이 `npm run build` 로 렌더·검사를
  확인하려고 둔다. CI 에는 없으므로 배포에 영향 없다. `sync-lectures.mjs` 가 "미등록
  폴더" 경고를 내지만 무시해도 된다.
