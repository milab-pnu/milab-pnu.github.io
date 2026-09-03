# 강의 노트 전용 표현 계층 (Lecture Note Presentation Layer)

작성: 2026-08-28 · 관련: `2026-08-27-lecture-content-repos-design.md` (강의 콘텐츠 repo 시스템)

## 배경 · 문제

강의 노트(`weeks/*.md`)가 사이트의 다른 본문 페이지(뉴스·구성원)와 레이아웃·CSP·타이포를
공유한다. 현재 상태의 한계:

- **엄격 CSP** (`img-src 'self' data:`, `script-src 'none'`, `frame-src` 없음) 때문에
  외부 이미지 hotlink·YouTube/Vimeo 임베드·스크롤 추적 네비게이터가 전부 불가능하다.
- `NoteLayout` 은 `max-w-2xl` 단일 컬럼이라 목차(TOC)·사이드노트·넓은 그림을 둘 곳이 없다.
- 강의 노트는 "읽기만 해도 그 주차 내용을 이해할 수 있는" 전체 대체 읽기자료를 지향한다.
  이를 위해 그림·영상·다이어그램·주석·참고문헌을 풍부하게 쓸 수 있어야 한다.

## 목표

강의 노트 경로(`/lecture/<course>/<note>`)에 **전용 표현 계층**을 만든다.

- 3구역 레이아웃: 좌측 스크롤 추적 네비게이터 · 고정 폭 본문 · 우측 사이드노트.
- 강의 노트 페이지에 한정한 완화 CSP (외부 이미지·영상 임베드·번들 스크립트 허용).
- MDX 컴포넌트 6종 + `<Cite>` 를 import 없이 사용.
- 콘텐츠 repo(과목 폴더)는 순수 MDX 만 담는다 — 표현 로직은 전부 `milab-pnu` 쪽.

## 비목표 (이번엔 안 함)

- `course.md` 페이지 개편 — 사이트 크롬·Schedule 표가 필요한 인덱스 페이지라 현행 유지.
- 다크모드 — 사이트가 `color-scheme: light` 전용, 그에 맞춘다.
- 외부 CDN 스크립트·React 재도입 — `script-src 'self'` 까지만 연다.
- 로컬 이미지 최적화 파이프라인 신규 구축 — 외부 이미지 우선이라 후순위(아래 "확인 필요" 참고).
- 실제 주차 노트 콘텐츠 작성 — 이 계층이 서면 별도 작업으로.

## 결정된 방침 (브레인스토밍 2026-08-28)

- **레이아웃**: 3구역 A안. 본문 고정 폭(안 튀어나옴), 대표 그림·`<Figure wide>` 만 넓게.
- **JS/CSP**: `script-src 'self'` — 빌드 시 번들되는 네비 스크립트 하나만. 인라인·CDN 차단.
- **작성 형식**: MDX. 컴포넌트는 `<Content components={…}>` 로 주입, 저자는 import 불필요.
- **외부 이미지**: **기본 수단**. `img-src https:` 개방. 출처 표기 필수. 링크 깨짐은 감수.
- **SVG 다이어그램**: 설명·외부 그림으로 부족할 때만 그리는 최후 수단.
- **영상**: YouTube(`youtube-nocookie.com`) + Vimeo(`player.vimeo.com`) 2종.
- **인용**: 본문 `<Cite n={1}/>` → 하단 `<References>` 항목으로. 사이드노트는 설명 전용(인용 아님).

## 콘텐츠 repo ↔ 사이트 계약

- 편집·커밋·push 는 **과목 repo** 에서 한다: 작업 클론 `pnu/lectures/2026-02/<folder>/`
  (GitHub `milab-pnu/<slug>`, `lectures.config.json`). 예: folder `advanced_deep_learning`
  ↔ slug `2026f-advanced-deep-learning`.
- 빌드 때 `sync-lectures.mjs` 가 각 repo 를 `milab-pnu/lectures/<slug>/` 로 `--depth 1`
  clone(detached HEAD) → 컬렉션이 `./lectures/*/weeks/*.{md,mdx}` 로 스캔 → 라우트
  `/lecture/<slug>/<note>`. `milab-pnu/lectures/` 는 **절대 커밋하지 않는다**.
- `weeks/*.mdx` 는 bare 태그(`<Sidenote>` 등)를 쓰고, 컴포넌트는 `milab-pnu` 빌드 시점에
  `[note].astro` 가 주입한다. **`.mdx` 는 `milab-pnu` 빌드를 통해서만 렌더된다** — 단독으로는
  안 됨. 계약 = "다음 컴포넌트 이름이 전역 제공됨": `Sidenote`, `Figure`, `Video`, `Callout`,
  `Details`, `References`, `Cite`. 이 목록을 `docs/lecture-authoring.md` 에 고정한다.
- **로컬 미리보기 함정**: `./dev.ps1` 은 sync 가 GitHub 최신을 당겨오므로, 표현 계층 개발 중
  샘플 `.mdx` 를 확인하려면 그 노트를 과목 repo 에 **push** 해야 보인다. 구현 단계에서 임시
  샘플 노트를 과목 repo 하나(ADL)에 push 해 검증하고, 계층 완성 후 정리·삭제한다.

## 파일 배치

```
milab-pnu/
├── astro.config.mjs                         # 수정: remark-gfm 확인/추가, rehype-slug 추가
├── src/
│   ├── layouts/NoteLayout.astro             # 전면 개편: 3구역 그리드
│   ├── components/
│   │   ├── HeadMeta.astro                   # 수정: csp 오버라이드 prop
│   │   └── lecture/
│   │       ├── LectureNav.astro             # 좌측 목차 (heading 추출)
│   │       ├── lecture-nav.ts               # 스크롤 추적 (번들, script-src 'self')
│   │       ├── Sidenote.astro
│   │       ├── Figure.astro
│   │       ├── Video.astro
│   │       ├── Callout.astro
│   │       ├── Details.astro
│   │       ├── References.astro
│   │       └── Cite.astro
│   ├── pages/lecture/[course]/[note].astro  # 수정: 컴포넌트 주입
│   └── styles/lecture-note.css              # 전용 스타일 (global.css 와 분리)
└── docs/lecture-authoring.md                # 수정: 콘텐츠 작성 규칙 + 컴포넌트 레퍼런스
```

콘텐츠 repo 는 `weeks/*.mdx` 만 바뀐다 (`.md` → `.mdx`, 컴포넌트 태그 사용).

## 레이아웃

**데스크톱 (≥1100px)** — CSS Grid 3열 `[nav 좌측] [본문 고정폭 ~680px] [사이드 ~220px]`:

```
┌─────────┬───────────────────────┬──────────────┐
│  목차   │   대표 그림 (전체 폭)   │              │
│ (sticky)├───────────────────────┤   사이드노트  │
│  현재 ● │   본문 · 그림 · 수식    │   ① 설명…     │
└─────────┴───────────────────────┴──────────────┘
```

- 스타일: `lecture-note.css` + 각 컴포넌트 `<style>`. Astro 가 별도 스타일시트로 번들 →
  `style-src 'self'` 통과 (인라인 `style=` 아님).
- 본문 최대폭 고정. `<Figure wide>` 와 대표 그림만 `nav~본문` 또는 `본문~사이드` 폭까지 확장.

**반응형:**

| 폭 | 네비 | 사이드노트 | 컬럼 |
|---|---|---|---|
| ≥1100px | 좌측 sticky | 우측 열 | 3 |
| 768–1100px | 좌측 sticky | 본문 내 인라인(작은 글씨·좌측 경계선) | 2 |
| <768px | 본문 상단 `<details>` 접이식 | 본문 내 인라인 | 1 |

**네비게이터:**

- 빌드 시 MDX 의 `h2`/`h3` 를 추출해 목차 생성. heading `id` 는 `rehype-slug` 로 자동 부여.
- `lecture-nav.ts`: `IntersectionObserver` 로 현재 섹션 추적 → 목차 항목에 `aria-current`.
  ~30줄, 의존성 없음, `/_astro/` 번들 모듈. JS 꺼져도 앵커 링크로 정상 동작(강조만 없음).

## MDX 컴포넌트 인터페이스

`[note].astro` 에서 `<Content components={{ Sidenote, Figure, Video, Callout, Details, References, Cite }} />` 로 주입.

### `<Sidenote>`
```mdx
경사하강법은 1차 방법이다.<Sidenote>2차 방법(Newton)은 Hessian 이 필요해 대규모에 비쌈.</Sidenote>
```
자동 번호(①②③). 데스크톱은 우측 여백, 좁은 화면은 인라인 접이식.

### `<Figure>`
```mdx
<Figure src="https://.../adam.png" alt="Adam 수렴 곡선"
  caption="학습률별 수렴 양상" source="Kingma & Ba, 2014, Fig. 2" wide />
```
- `src`: 외부 https URL 기본. 로컬 `./assets/…` 도 허용.
- `alt` 필수. `source` 는 캡션에 작게 병기 — **출처 표기 필수**.
- `wide`: 본문보다 넓게. 없으면 본문 폭.

### `<Video>`
```mdx
<Video src="https://youtu.be/xxxx" caption="역전파 시각화 (3Blue1Brown)" />
```
URL 에서 제공자·ID 파싱 → `youtube-nocookie.com` / `player.vimeo.com` iframe.
`loading="lazy"`, 16:9 비율 박스. 지원 안 되는 URL 이면 빌드 실패.

### `<Callout>`
```mdx
<Callout type="intuition">경사는 가장 가파른 방향, 학습률은 보폭이다.</Callout>
```
`type`: `intuition` | `warning` | `example` | `note`. 라벨 + 좌측 경계선. 무채색 톤, 색 최소.

### `<Details>`
```mdx
<Details summary="전체 유도">…긴 수식 전개…</Details>
```
네이티브 `<details>` 기반. JS 불필요.

### `<References>` + `<Cite>`
```mdx
본문 …이는 Adam 의 원논문에서 제안되었다.<Cite n={1}/> …

<References items={[
  { id: 1, text: "Kingma, D. P., & Ba, J. (2014). Adam: A Method for Stochastic Optimization. ICLR 2015. arXiv:1412.6980." },
  { id: 2, text: "Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press. §8.3, pp. 290–296." },
]} />
```
- `<Cite n={1}/>` → 본문에 위첨자 `[1]` 링크, 클릭 시 하단 항목으로 스크롤.
- `<References>` 는 노트 맨 아래 `## 참고문헌` 목록 렌더.
- **빌드 검증**: `items` 에 없는 번호를 `<Cite>` 하면 빌드 실패.
- 서지정보는 완전하게 — 저자·제목·출처·연도·DOI/URL. 특정 절·페이지를 지정받으면 명시.

## CSP (강의 노트 페이지 한정)

`HeadMeta.astro` 에 `csp?: string` prop 추가. `NoteLayout` 만 완화본 전달, 나머지 페이지는 기존값.

```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' https: data:;
frame-src https://www.youtube-nocookie.com https://player.vimeo.com;
media-src 'self' https:;
font-src 'self' data:;
base-uri 'none'; form-action 'none'; object-src 'none'
```

메타 태그 CSP 는 `frame-ancestors` 등 일부 지시어를 지원하지 않는다 — 기존 사이트도 메타
방식이므로 동일 제약을 받아들인다 (nginx 이전 시 실제 헤더로 강화, `HeadMeta` 주석 참고).

## astro.config.mjs 변경

- 커스텀 `processor` 가 GFM(표·각주)을 떨어뜨리는지 확인 → 필요 시 `remark-gfm` 추가.
- `rehype-slug` 추가 (heading `id`).
- 수식 파이프라인(`remark-math` + `rehype-katex` `output: 'mathml'`)은 그대로.

## 확인 필요 (구현 착수 시)

1. 커스텀 `markdown.processor` 로 GFM 표·각주가 살아 있는지. 안 살면 `remark-gfm` 추가.
2. `<Content components={…}>` 로 MDX 가 import 없이 컴포넌트를 참조할 수 있는지 (Astro MDX
   provider 동작). 안 되면 각 `.mdx` 상단에 자동 import 를 넣는 remark 플러그인 또는 명시 import.
3. glob 로더 기반 콘텐츠 컬렉션에서 상대경로 이미지 자동 최적화가 실제로 도는지.
   외부 https 이미지는 최적화 없이 그대로 나간다 — 외부 우선 방침상 이는 감수한다.
   (`2026-08-27` 스펙의 "webp/width/height/lazy 자동" 서술은 상대경로 이미지 한정이며,
   glob 로더 조합에서 재확인 필요.)
4. 번들 스크립트(`lecture-nav.ts`)가 `/_astro/` 에서 로드되어 `script-src 'self'` 에
   걸리지 않는지 (Astro `<script>` 는 기본 번들 — `is:inline` 쓰지 않는다).

## 진행 순서

1. 이 설계 문서 커밋 → 사용자 리뷰.
2. 구현 계획 작성 (writing-plans).
3. 표현 계층 구현: 컴포넌트 8개 · `NoteLayout` · CSP · 네비 스크립트 · `astro.config`.
   샘플 `.mdx` 노트 1개로 로컬 검증 (`./dev.ps1`) 후 배포.
4. `docs/lecture-authoring.md` 갱신 (콘텐츠 작성 규칙 + 컴포넌트 레퍼런스).
   `pnu/lectures/CLAUDE.md` 의 "milab-pnu 안 건드림" 규칙도 이 작업 반영해 갱신.
5. 기존 `weeks/*.md` 2개(ADL) · 2개(ADS) 를 `.mdx` 로 이행.
6. 이후 실제 주차 노트 작성 — 사용자 5단계 흐름(내용 제시 → 자료조사 → 작성 → 검토 → 과목별 강조).

## 테스트

- 각 컴포넌트 렌더 스냅샷 (샘플 MDX 노트).
- 빌드 산출물에서 CSP 위반 없음 확인 (인라인 `style=`/`script` 없음).
- 네비 스크롤 추적 수동 확인 · JS 비활성 시 앵커 폴백 확인.
- 반응형 3단계(≥1100 / 768–1100 / <768) 확인.
- `<Cite n={99}/>` (미등록 번호) → 빌드 실패 확인.
- `<Video>` 지원 안 되는 URL → 빌드 실패 확인.

## 작업 흐름 (구현 시)

`milab-pnu` 는 이 작업에서 수정 대상이다 (`pnu/lectures/CLAUDE.md` 규칙 1 의 예외 —
사용자 승인). 단 `milab-pnu/lectures/` 는 여전히 손대지 않는다 (sync 빌드 입력물).
콘텐츠 repo 수정은 각 과목 폴더에서 커밋·push.
