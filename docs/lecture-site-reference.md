# 강의 사이트 참조

노트를 쓸 때 필요할 때 찾아보는 사이트 동작·설정 정리. 쓰고 검토하는 규칙은
`lecture-authoring.md`, 시스템(sync·CI·배포) 메커니즘은 `../README.md`의 "강의 페이지" 절,
도구 협업은 `agent-workflow.md`.

## 작업 위치와 미리보기

강의 하나 = **독립 GitHub repo**. 각 repo 는 `pnu/lectures/<학기>/<과목>/` 에 클론되어 있고
(`origin` = 그 repo), **강의 자료는 항상 거기서** 수정하고 `git push` 한다.

```
pnu/
├── milab-pnu/                        # 사이트 코드
│   └── lectures/                     # 빌드용 자동 clone — 절대 손대지 않음
└── lectures/                         # ← 작업 공간
    ├── AGENTS.md                     # 공통 작업 지침 (lecture-authoring.md 를 가리킴)
    ├── CLAUDE.md                     # AGENTS.md 를 가리키는 심볼릭 링크
    └── 2026-02/
        ├── 2026f-advanced-deep-learning/   # = github.com/milab-pnu/2026f-advanced-deep-learning
        └── 2026f-applied-data-science/     # = github.com/milab-pnu/2026f-applied-data-science
```

```sh
cd pnu/lectures/2026-02/2026f-advanced-deep-learning
# course.md 또는 weeks/*.md 수정 → 개발 서버에서 렌더 확인 → 커밋·push
git add -A && git commit -m "..."
git push
# push 후 pnu/milab-pnu 에서 npm run build 로 빌드·검사 (빌드는 GitHub 콘텐츠를 동기화한다)
```

push → 그 repo 의 `.github/workflows/notify.yml` 이 사이트 재배포를 트리거 → **1~2분 뒤 반영**.
로컬 미리보기: `cd pnu/milab-pnu && npm run dev:bg`(Windows는 `.\dev.ps1`도 가능) → http://localhost:4321/
(dev 서버는 `lectures.config.json`의 `localPath`에 지정한 `pnu/lectures/` 편집 폴더를 직접
읽는다. 저장하면 반영되며, 미공개 주차도 모두 표시한다. 배포 빌드는 GitHub 콘텐츠를 동기화한다).

## 학생 사이트 공개 주차

로컬 전체 미리보기와 과목별 학생 공개 설정의 실행 방법은 [README](../README.md#강의-미리보기와-과목별-공개-설정)에 정리한다.
공개 주차는 과목별 GitHub Actions 변수 `LECTURE_<SLUG 대문자·하이픈을 밑줄로 치환>_PUBLIC_WEEKS`에
저장한다. 미설정은 전체 공개다. 기존 `ADS_PUBLIC_WEEKS`는 데이터사이언스의 새 변수가 없을 때만
사용한다. 개발 서버는 `lectures.config.json`의 `localPath`를 읽고 모든 노트를 표시한다.

전체 공개 빌드가 통과해도 제한 공개 빌드에서는 링크 대상이 없어 실패할 수 있으므로,
주차 간 링크를 바꿀 때는 실제 배포의 공개 주차 설정으로도 빌드·검사한다. 배포는 변수를 개별 환경 변수가 아니라
JSON 하나(`LECTURE_VISIBILITY_VARIABLES`)로 넘기므로 로컬에서도 같은 형태로 준다. 예:
`LECTURE_VISIBILITY_VARIABLES='{"LECTURE_2026F_ADVANCED_DEEP_LEARNING_PUBLIC_WEEKS":"1,2"}' npm run build`.
`LECTURE_…_PUBLIC_WEEKS=1,2 npm run build`처럼 개별 변수로 주면 무시되어 전체 공개로 빌드된다.
새 과목 등록 시 `localPath`를 `pnu/lectures/` 기준 상대 경로로 지정한다. 로컬 과목 폴더명을 바꾸면 이 설정도 함께 수정하고 개발 서버를 재시작한다.

## 강의 repo 구조

```
<slug>/
├── course.md              # 강의 소개 페이지 (개요 + Schedule 표) — 사이트 네비 있음
├── weeks/
│   ├── 01-intro.md        # 주차 노트 1개 = 웹페이지 1개 — 사이트 네비 없는 독립 문서
│   ├── 01b-setup.md       # 같은 주차에 여러 개 가능 (order 로 정렬)
│   ├── 02-optim.md       # 파일명 예시; 명명 규칙은 과목별로 지정
│   └── assets/            # 노트에 넣는 이미지 (상대경로 참조)
├── .github/workflows/notify.yml   # 손대지 않음
└── .gitattributes                 # 손대지 않음
```

**파일명은 해당 과목의 명명 규칙을 따른다.** 이름을 바꿀 때는 `week`·`order`의 정렬 관계를 유지하고,
본문 링크·과목 일정에 생성되는 URL·섹션 anchor까지 확인한다.

**`weeks/` 안에는 강의 노트(`.md`/`.mdx`)와 `assets/` 만 둔다.** `lectureNotes` 컬렉션은
`glob({ pattern: "*/weeks/*.{md,mdx}" })` 로 로드하는데, 이 로더는 **`_` 접두사 파일도
무시하지 않는다** (그건 구 `src/content/` 컬렉션 API 의 동작). 검수 체크리스트·작업 메모
같은 노트 아닌 `.md` 를 `weeks/` 에 두면 `title`/`week` frontmatter 가 없어
`InvalidContentEntryDataError` 로 **사이트 전체 빌드가 깨진다**. 작업용 파일은 repo 밖에
둔다.

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
| `weeks` |  | 계획표. 항목: `{ n: 1, topic: "주제", date?: "2026-09-01", submissionUrl?: "https://…" }` |

`weeks` 항목에 `submissionUrl`(HTTPS URL)을 지정하면 Schedule 표의 해당 주차
강의자료 목록 맨 뒤에 **과제 제출** 링크가 표시된다. 노트가 없는 주차에도 표시되며,
노트 공개 주차 설정과 별개로 항상 공개되므로 제출 창구를 공개할 때 추가한다.

반별 제출 창구가 여러 개면 `submissionLinks: [{ label: "과제 제출 (금 09시 수업)", url: "https://…" }, { label: "과제 제출 (금 19시 수업)", url: "https://…" }]`를 사용한다.
각 링크는 지정한 순서와 문구로 표시되며 URL은 HTTPS여야 한다. `submissionLinks`가
비어 있지 않으면 기존 `submissionUrl`보다 우선한다.

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

## 강의 노트 컴포넌트 (MDX)

`weeks/*.mdx` (`.mdx` 확장자) 에서 **import 없이** 아래 컴포넌트를 태그로 쓴다.
`src/pages/lecture/[course]/[note].astro` 가 `<Content components={…}>` 로 주입한다.
`.mdx` 는 **`milab-pnu` 빌드를 통해서만** 제대로 렌더된다(단독으로 열면 안 됨).
컴포넌트는 전부 `milab-pnu/src/components/lecture/` 에 있다.

| 컴포넌트 | 용법 | 비고 |
|---|---|---|
| `<Sidenote>…</Sidenote>` | 본문 옆 우측 여백 주석 | **문장 끝에 붙여 쓴다**(`…한다.<Sidenote>…</Sidenote>`) — 단독 줄에 두면 본문 위첨자 번호가 허공에 뜬다. 자동 번호. 좁은 화면은 인라인. 설명 전용 — 서지 인용은 각주(`[^키]`) |
| `<Figure src alt caption? source? wide? hero? />` | 그림 + 캡션 + 출처 | `alt` 필수. `source` 로 출처 표기 필수. `wide`는 현재 일반과 같다(최대 32rem). `hero`=노트 최상단, 최대 40rem |
| `<Video src caption? />` | YouTube/Vimeo 임베드 | URL 파싱 → nocookie iframe. **그 외 URL 은 빌드 실패** |
| `<Callout type="intuition"\|"warning"\|"example"\|"note">…</Callout>` | 강조 박스 | 라벨: 직관/주의/예시/노트 |
| `<Details summary="…">…</Details>` | 접이식 블록 | 긴 유도·보충. 네이티브 `<details>` |

인용은 컴포넌트가 아니라 GFM 각주(`[^키]`)를 쓴다 — 아래 "각주 동작".

- 좌측 목차는 `##`/`###` 마크다운 heading 에서 자동 생성된다. heading 에 `$수식$` 을
  넣으면 목차 텍스트가 깨진다.
- 컴포넌트 목록을 바꾸면 `[note].astro` 의 주입 객체와 이 표를 함께 갱신한다.

## 각주 동작

인용은 **GFM 각주**를 쓴다 (`remark-gfm` 이 빌드 파이프라인에 켜져 있음). 무엇을 어떤
형식으로 인용하는지는 `lecture-authoring.md`의 "표기 규칙".

```
softmax 가 포화되지 않는다.[^aiayn]
...
[^aiayn]: Vaswani, A., et al. (2017). Attention Is All You Need. NeurIPS 2017.
  [arXiv:1706.03762](https://arxiv.org/abs/1706.03762).
```

- **키는 의미 있는 슬러그**(`aiayn`, `leakage`, `vds` …)로 영문·숫자·`_`·`-`만 쓴다. 숫자만은 피한다. 번호는 remark 가
  **등장 순서로 자동** 매긴다 — 중간에 새 인용을 끼워도 전부 자동 재번호.
- 같은 `[^키]` 를 여러 번 쓰면 **항목 1개 + 위치별 backlink**. 중복 관리 불필요.
- 정의(`[^키]: …`)는 어디 둬도 되지만 **노트 맨 끝에 모아** 둔다 (기존 참고문헌 목록 위치).
  빌드가 하단에 "참고문헌" 절로 자동 수집한다. 정의 본문은 마크다운(`[제목](url)`·`*이탤릭*`·`$수식$`).
- `<Sidenote>`와 MDX에 직접 쓴 `<figcaption>` 안에서도 `[^키]`·마크다운이 처리된다.
  `<Figure caption="…">`는 문자열 prop이라 마크다운·각주 없이 텍스트 그대로 나간다.
- 정의 안 된 `[^키]` 는 본문에 리터럴로 남고 `check-lecture-notes.mjs` 가 잡는다. 검사는 영문·숫자·
  `_`·`-`로 된 키만 찾으므로, 다른 문자를 쓴 키의 누락은 잡지 못한다.

## 수식·코드블록 렌더

- 인라인 `$...$`, 디스플레이는 `$$` 를 **각각 별도 줄**에 둔다 —

  ```
  $$
  \theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}(\theta)
  $$
  ```

  한 줄로 `$$...$$` 쓰면 인라인 취급된다 (remark-math 규칙).
- 수식은 빌드 때 **MathML** 로 렌더 (KaTeX JS·CSS 런타임 불필요). 이유는 아래 "설계 배경".
- 코드블록은 ` ```python ` 처럼 언어를 붙여도 된다. 단 **syntax highlighting 은 꺼져 있어**
  어두운 배경에 단색으로 나온다 (이유는 아래 "설계 배경"). 코드 내용·들여쓰기는 그대로 유지됨.

## 이미지 / 로딩

- **외부 이미지가 기본 수단이다.** `<Figure src="https://…" />` 로 논문·블로그의 그림을
  직접 참조한다. 강의 노트 경로는 완화 CSP(`img-src 'self' https: data:`)라 외부 https 이미지가 뜬다.
  `source` 로 출처 표기 필수. **라이선스는 넣기 전에 확인** — `lecture-authoring.md` "남의 저작물".
- **외부 동영상(mp4·webm)도 심을 수 있다.** 노트 CSP 에 `media-src 'self' https:` 가 있어
  raw `<figure><video src="https://…" autoplay loop muted playsinline controls width="100%"
  aria-label="…"></video><figcaption>…</figcaption></figure>` 가 그대로 동작한다(예:
  `01a-transformer.mdx` 의 Alammar seq2seq 클립). `<Figure>` 는 이미지 전용, `<Video>` 는
  YouTube/Vimeo 전용이라 이 경우엔 둘 다 안 쓴다. 라이선스 확인은 이미지와 동일.
- 로컬 이미지를 `<Figure>`에 넣을 때는 MDX에서 `import plot from "./assets/그림.png";`로
  가져온 뒤 `<Figure src={plot.src} alt="…" source="…" />`로 전달한다. 현재 `Figure`는
  문자열 경로를 해석하거나 이미지를 최적화하지 않는 `<img>` 래퍼이므로 `src="./assets/…"`를
  직접 넣지 않는다. import는 빌드 자산 경로를 생성하며 자동 WebP 변환을 뜻하지 않는다.
  **외부 URL 이미지는 최적화 없이 그대로 나간다** — 원본을 적당한 해상도로.
- 설명·외부 그림으로 부족하면 **인라인 `<svg>` 다이어그램**을 직접 그린다(최후 수단).
  CSP 상 `style=`·`<style>` 불가 → presentation 속성(`fill=`, `stroke=`, `font-size=`)만.
  고급딥러닝 `01b-bert-vs-gpt.mdx` 에 예시가 있다. **한 노트 안의 SVG 는 viewBox 크기·글자
  크기·박스 규격·색을 서로 맞춘다** — 안 그러면 그림마다 축척이 달라 보인다.
  현재 팔레트: 박스 `#f8fafc`/`#e2e8f0`, 강조 `#0f172a`, 보조 텍스트 `#64748b`,
  연결선 `#0f172a`(강조)·`#94a3b8`(약).
- **그림 폭은 CSS 가 통일한다**(`lecture-note.css`) — 원본 해상도와 무관하게 `<Figure>`와
  `<figure class="lecture-figure">`는 최대 32rem, hero 는 최대 40rem 로 가운데 정렬된다.
  `wide` prop 은 현재 일반과 같다. 클래스 없는 `<figure>`는 이 제한을 받지 않고 본문 폭을 따른다
  (본문 바로 아래 `<svg>`는 최대 32rem).
- 슬라이드 PDF·데이터셋 등 **큰 파일은 페이지에 심지 말고 링크로**.
- 각 노트는 독립 정적 HTML → 방문할 때만 로드. 페이지 하나가 너무 커지면 주차 노트를 쪼갠다.

## 재사용 가능한 도식·강연 (딥러닝)

자작 전에 먼저 뒤진다. 개별 이용 조건은 `lecture-authoring.md` "남의 저작물"대로 확인한다.

- [dvgodoy/dl-visuals](https://github.com/dvgodoy/dl-visuals) — Transformer·attention·BERT·
  positional encoding 등 215장, **CC BY 4.0**(상업적 사용까지 허용). raw GitHub URL 또는
  Wikimedia Commons 미러. 출처: `그림 dvgodoy / dl-visuals · CC BY 4.0`.
- [Jay Alammar](https://jalammar.github.io/) *Illustrated Transformer / BERT / GPT-2* —
  CC 표시와 개별 그림·mp4의 이용 조건을 해당 페이지에서 확인한다. NC·SA 등 조건을 충족하는 이용인지 검토하고, 근거가 불명확하면 원문 페이지를 링크한다.
- [Lil'Log](https://lilianweng.github.io/) (Lilian Weng) — 도식 재사용 시 라이선스 각 글에서 확인.
- CC 표기 없는 블로그(Thinking Machines 등)는 **전권 보유**로 본다 — 그림 임베드 불가,
  설명 방식·구성만 참고하고 필요하면 자작한다.
- 강연은 [Stanford CS25 *Transformers United*](https://web.stanford.edu/class/cs25/)
  ([녹화](https://web.stanford.edu/class/cs25/recordings/) ·
  [YouTube 재생목록](https://www.youtube.com/playlist?list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM))
  가 폭넓다 — Karpathy·Vaswani·Hinton 등. 필요한 대목에 해당 강연을 `<Video>` 로 넣고,
  슬라이드·페이지 글은 © Stanford 라 인용만 한다.

## 새 강의 추가

```powershell
cd pnu/milab-pnu
# -Path 의 폴더명 = slug(저장소 이름)
# -Pat: milab-pnu.github.io Actions:write PAT — 기존 MILAB_DEPLOY_TOKEN 재사용 가능 (아래 참고)
./scripts/new-lecture.ps1 -Slug 2027s-machine-learning `
    -Path ..\lectures\2027-01\2027s-machine-learning `
    -Pat github_pat_xxxxx
```

스크립트가: GitHub repo 생성 → 작업 폴더 클론 → 골격 복사(`scripts/lecture-template/`)
→ `MILAB_DEPLOY_TOKEN` secret 등록. 그다음 직접:

1. `course.md` 를 실제 내용으로 채우고 `git push`
2. `milab-pnu/lectures.config.json`에 스크립트가 출력한 항목 추가 → 커밋 · push. `localPath`는 `pnu/lectures/` 기준 상대 경로이며, 스크립트가 `-Path`에서 계산한다. 누락하면 개발 서버에서 해당 과목을 찾지 못한다.

`-Pat` 생략 시 secret 만 수동: `gh secret set MILAB_DEPLOY_TOKEN -R milab-pnu/<slug>`
(PAT 발급 방법은 `../README.md` "재배포 트리거용 PAT").

## 운영 주의점

- **`npm run build`는 GitHub에서 동기화한 과목 콘텐츠를 빌드한다.** push 전의 로컬 수정은
  이 빌드·검사에 반영되지 않으므로, push 전에는 개발 서버에서 해당 노트를 열어 HTTP 200과
  렌더를 확인하고, push 후 다시 빌드한다.
- 배포가 "성공" 인데 사이트 반영이 안 되면 (드묾): milab → Actions → deploy → "Run workflow".
- `MILAB_DEPLOY_TOKEN` PAT 만료 시 자동 배포가 조용히 멈춘다 → 수동 버튼 or 재발급.
- `slug` 은 소문자·숫자·하이픈만. `lectures.config.json` 의 `slug` = 클론 폴더명 = URL 경로.

## 건드리기 전에 알아야 할 설계 배경

사이트 대부분이 **엄격 CSP**(`style-src 'self'`, `script-src 'none'`, `img-src 'self' data:`, 정본 `src/lib/csp.mjs`)로
돌아서, 인라인 `style=` 이나 런타임 JS·외부 자원을 쓰는 렌더링은 조용히 깨진다. 아래는
그 때문에 내려진 결정이라 되돌리면 안 된다:

- **수식 → MathML** (`astro.config.mjs`, `rehype-katex { output: 'mathml' }`). KaTeX 의
  기본 HTML 출력은 인라인 style 범벅이라 CSP 에 막힌다. HTML 출력으로 되돌리면 수식이 깨짐.
- **코드블록 하이라이팅 꺼짐** (`markdown.syntaxHighlight: false`). Shiki 가 토큰마다
  인라인 `style=` 로 색을 넣어 CSP 에 막힌다 + 사이트는 무채색 방침. 켜지 않는다.
- **강의 노트 페이지(`/lecture/<course>/<note>`)만 완화 CSP.** `NoteLayout` 이
  `HeadMeta` 의 `csp` prop 으로 넘긴다: `script-src 'self'`(번들 아닌 정적 파일
  `public/lecture-nav.js` 목차 추적 스크립트 1개), `img-src 'self' https: data:`(외부 이미지),
  `media-src 'self' https:`(외부 동영상·오디오 — raw `<video>` 로 mp4 임베드 가능),
  `frame-src` = YouTube-nocookie·Vimeo(영상 임베드). 인라인 `<script>`·CDN 은 여전히
  차단 — Astro 가 작은 모듈 스크립트를 HTML 에 인라인해버리므로 노트용 JS 는 `public/`
  정적 파일로 두고 `<script is:inline src>` 로 부른다. 그 외 모든 페이지는 엄격 CSP.
- **빌드 검사** `scripts/check-lecture-notes.mjs` 가 `postbuild` 로 돌며 산출물에서
  노트 페이지의 CSP·인라인 `style=`/`<script>`·해석 안 된 각주(`[^키]`)·단독 줄에 놓인
  `<Sidenote>`(문장 끝에 안 붙은 것)를, 그 외 페이지의 엄격 CSP 유지를 확인한다.
  테스트 프레임워크는 없고, 그 밖의 회귀 검사는 `npm run check`(astro check·`check-bibtex`·
  `check-lecture-visibility`·`check-build-validation`)로 돌린다.

### 로컬 개발 서버의 CSP

`HeadMeta`의 CSP meta는 production 빌드에만 넣는다. 개발 서버는 Vite가 CSS를
인라인으로 주입하고 실시간 갱신 스크립트를 실행하므로 배포용 CSP를 그대로 적용하면
로컬 화면이 깨진다. 로컬 HTTP 200뿐 아니라 스타일 로딩도 확인한다. 배포의 엄격
CSP는 `check-lecture-notes.mjs`로 계속 검증한다. 디자인과 CSS 자체는 두 모드가 공유한다.

### 개발 서버 실행 중 빌드

로컬 검증은 `npm run build`를 사용한다. 이 명령(`scripts/build-with-dev.mjs`)이 실행 중인 백그라운드 개발 서버를 스스로 중지하고, 빌드 성공·실패와 관계없이 같은 포트로 다시 시작하므로 따로 끄고 켤 필요가 없다. 포그라운드 서버가 떠 있으면 오류를 내고 중단하니, 직접 종료한 뒤 빌드하고 다시 켠다. `astro build`나 `astro sync`를 개발 서버와 동시에 직접 실행하면 공유 `.astro` 콘텐츠 목록이 덮어써져 `UnknownContentCollectionError`가 발생할 수 있다. 이 경우 개발 서버를 재시작(`npm run dev:stop` 후 `npm run dev:bg`, 또는 `.\dev.ps1 restart`)해 복구한다. 학생 사이트 공개 설정은 바뀌지 않는다.
