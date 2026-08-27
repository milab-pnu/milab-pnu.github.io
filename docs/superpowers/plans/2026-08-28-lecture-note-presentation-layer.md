# 강의 노트 전용 표현 계층 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 강의 노트 경로(`/lecture/<course>/<note>`)에 3구역 레이아웃 · 완화 CSP · MDX 컴포넌트 8종을 갖춘 전용 표현 계층을 만든다.

**Architecture:** `milab-pnu` Astro 사이트에 강의 노트 전용 레이아웃(`NoteLayout`)·컴포넌트(`src/components/lecture/`)·스타일(`lecture-note.css`)·번들 네비 스크립트를 신설한다. 콘텐츠 repo 의 `weeks/*.mdx` 는 import 없이 bare 태그를 쓰고, `[note].astro` 가 `<Content components={…}>` 로 주입한다. 검증은 테스트 프레임워크 없이 `astro build` 성공 + 산출물 HTML 검사 스크립트(`scripts/check-lecture-notes.mjs`) + 로컬 `./dev.ps1` 미리보기로 한다.

**Tech Stack:** Astro 7, `@astrojs/mdx` 7, `@astrojs/markdown-remark` 7 (`unified()` 커스텀 processor), `remark-math` + `rehype-katex`(mathml), 신규: `remark-gfm` · `rehype-slug`. Tailwind 4 (vite plugin). 네비 스크립트는 의존성 없는 TS(`IntersectionObserver`).

**Spec:** `docs/superpowers/specs/2026-08-28-lecture-note-presentation-layer-design.md`

## Global Constraints

- 언어: 한국어 (커밋 메시지·주석·문서 포함).
- `milab-pnu/lectures/` 는 **절대 커밋하지 않는다** — `sync-lectures.mjs` 가 덮어쓰는 빌드 입력물. `.gitignore` 에 이미 제외됨.
- 강의 노트 페이지 외(메인·구성원·뉴스·`course.md`)의 CSP 는 기존값 유지: `default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; base-uri 'none'; form-action 'none'; object-src 'none'`.
- 강의 노트 페이지 CSP (이 값 그대로): `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; media-src 'self' https:; font-src 'self' data:; base-uri 'none'; form-action 'none'; object-src 'none'`.
- 인라인 `style=` 속성·인라인 `<script>` 본문 금지 (CSP `style-src 'self'` / `script-src 'self'`). Astro 컴포넌트 `<style>`·`<script>`(비-`is:inline`)는 별도 파일로 번들되므로 허용됨.
- 전역 제공 컴포넌트 이름 (콘텐츠 계약, 변경 시 `lecture-authoring.md` 동기화): `Sidenote`, `Figure`, `Video`, `Callout`, `Details`, `References`, `Cite`.
- milab-pnu 커밋 트레일러:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT
  ```
- 콘텐츠 repo(과목 폴더) 커밋 트레일러: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` 만.
- 커밋은 로컬만. **push 는 명시 지시가 있을 때만** (단, Task 11 의 콘텐츠 repo 이행은 미리보기 검증을 위해 push 필요 — 그 태스크 안에서 처리).

---

### Task 1: 로컬 개발 픽스처 + 산출물 검사 스크립트

빌드 기반 검증의 토대. 네트워크로 실제 강의 repo 를 당겨오는 sync 와 무관하게 검증할 수 있도록, `sync-lectures.mjs` 가 "매니페스트에 없는 폴더는 삭제하지 않고 경고만" 하는 성질을 이용해 `lectures/_dev-fixture/` 를 둔다.

**Files:**
- Create: `milab-pnu/lectures/_dev-fixture/course.md` (gitignore 대상 — 커밋 안 됨)
- Create: `milab-pnu/lectures/_dev-fixture/weeks/00-fixture.md` (gitignore 대상)
- Create: `milab-pnu/scripts/check-lecture-notes.mjs`
- Modify: `milab-pnu/package.json` (`postbuild` 스크립트 추가)

**Interfaces:**
- Produces: `npm run build` 종료 시 `check-lecture-notes.mjs` 가 자동 실행. 위반 시 exit 1.
- Produces: 픽스처 라우트 `/milab/lecture/_dev-fixture/00-fixture` (로컬 전용).

- [ ] **Step 1: 픽스처 course.md 작성**

`milab-pnu/lectures/_dev-fixture/course.md`:
```markdown
---
title: 개발 픽스처
term: DEV
semester: "9999-99"
weeks:
  - { n: 0, topic: "픽스처" }
---

로컬 표현 계층 검증용. 커밋되지 않는다(`lectures/` 는 .gitignore).
```

- [ ] **Step 2: 픽스처 노트 작성 (일반 마크다운만)**

`milab-pnu/lectures/_dev-fixture/weeks/00-fixture.md`:
```markdown
---
title: 픽스처 노트
week: 0
---

## 첫 번째 섹션

본문 문단. 인라인 수식 $e^{i\pi} + 1 = 0$.

$$
\theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}(\theta)
$$

### 하위 섹션

| 항목 | 값 |
|---|---|
| a | 1 |
| b | 2 |

## 두 번째 섹션

- 목록 1
- 목록 2
```

- [ ] **Step 3: 검사 스크립트 작성**

`milab-pnu/scripts/check-lecture-notes.mjs`:
```js
// 빌드 산출물(dist/) 검사 — 테스트 프레임워크 대체.
// postbuild 로 자동 실행. 위반 1건이라도 있으면 exit 1.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const errors = [];
const err = (f, m) => errors.push(`${f}: ${m}`);

const NOTE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; " +
  "img-src 'self' https: data:; " +
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com; " +
  "media-src 'self' https:; font-src 'self' data:; " +
  "base-uri 'none'; form-action 'none'; object-src 'none'";
const STRICT_CSP =
  "default-src 'self'; script-src 'none'; style-src 'self'; " +
  "img-src 'self' data:; font-src 'self' data:; " +
  "base-uri 'none'; form-action 'none'; object-src 'none'";

/** dist 안의 모든 index.html 경로 (재귀) */
function htmlFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlFiles(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

if (!existsSync(dist)) {
  console.error("[check] dist/ 없음 — 먼저 astro build");
  process.exit(1);
}

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(dist.length + 1).replace(/\\/g, "/");
  const isNote = /^lecture\/[^/]+\/[^/]+\//.test(rel) && rel !== "lecture/index.html";

  const cspMatch = html.match(
    /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
  );
  const csp = cspMatch?.[1] ?? null;

  if (isNote) {
    if (csp !== NOTE_CSP) err(rel, `강의 노트 CSP 불일치\n  기대: ${NOTE_CSP}\n  실제: ${csp}`);
    // 인라인 style= 금지
    if (/<[^>]+\sstyle=/.test(html)) err(rel, "인라인 style= 속성 발견");
    // 본문 있는 인라인 <script> 금지 (src= 만 허용)
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (m[2].trim() && !/\bsrc=/.test(m[1])) err(rel, "인라인 <script> 본문 발견");
    }
    // <Cite> → <References> 참조 무결성: class="cite" href="#ref-N" 마다 id="ref-N" 존재
    for (const m of html.matchAll(/class="cite"[^>]*href="#(ref-\d+)"/g)) {
      if (!html.includes(`id="${m[1]}"`)) err(rel, `인용 [${m[1]}] 에 대응하는 참고문헌 항목 없음`);
    }
  } else if (rel === "index.html") {
    if (csp !== STRICT_CSP) err(rel, `메인 페이지 CSP 가 엄격값이 아님: ${csp}`);
  }
}

if (errors.length) {
  console.error(`[check] 실패 (${errors.length}건):\n` + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log("[check] 강의 노트 산출물 검사 통과");
```

- [ ] **Step 4: package.json 에 postbuild 연결**

`milab-pnu/package.json` `scripts` 에 추가:
```json
"postbuild": "node scripts/check-lecture-notes.mjs",
```

- [ ] **Step 5: 검사가 현재 상태에서 통과하는지 (기준선)**

Run: `cd milab-pnu && npm run build`
Expected: 빌드 성공. 픽스처 노트는 아직 기존 `NoteLayout`(엄격 CSP)로 렌더되므로 `isNote` 검사에서 **CSP 불일치로 실패**해야 정상 (기준선 확인 — 이 실패가 Task 10 에서 해소됨). 확인 후 다음 단계로.

- [ ] **Step 6: 커밋**

```bash
cd milab-pnu
git add scripts/check-lecture-notes.mjs package.json
git commit -m "$(printf 'build: 강의 노트 산출물 검사 스크립트(postbuild)\n\nCSP·인라인 style/script·인용 무결성 검사. 테스트 프레임워크 대신\n빌드 산출물 검사로 검증. 로컬 픽스처는 lectures/_dev-fixture (gitignore).\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 2: astro.config — remark-gfm · rehype-slug

커스텀 `processor` 가 Astro 기본 GFM(표·각주)·heading id 를 떨어뜨린다. 명시적으로 추가한다. heading id 는 `LectureNav` 앵커와 `render()` 의 `headings` slug 에 필요.

**Files:**
- Modify: `milab-pnu/astro.config.mjs`
- Modify: `milab-pnu/package.json` (deps)

**Interfaces:**
- Produces: 모든 `.md`/`.mdx` 에서 GFM 표 렌더, `<h2>`/`<h3>` 에 `id` 속성, `render()` 반환값의 `headings` 배열 채워짐.

- [ ] **Step 1: 의존성 설치**

Run:
```bash
cd milab-pnu && npm install remark-gfm@^4 rehype-slug@^6
```
(`remark-gfm` 은 이미 node_modules 에 전이 의존성으로 존재 — direct dep 로 승격. 설치 후 실제 버전은 `package.json` 에 기록되는 값을 따른다.)

- [ ] **Step 2: config 수정**

`milab-pnu/astro.config.mjs` — import 추가:
```js
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
```
`processor` 수정:
```js
const processor = unified({
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [rehypeSlug, [rehypeKatex, { output: 'mathml' }]],
});
```

- [ ] **Step 3: 빌드 후 heading id · 표 확인**

Run: `cd milab-pnu && npm run build`
Then: `dist/lecture/_dev-fixture/00-fixture/index.html` 를 열어 확인:
- `<h2 id="첫-번째-섹션"` (또는 slug 규칙에 따른 id) 존재
- `<table>` 로 표 렌더됨
Expected: 둘 다 존재. (CSP 검사는 여전히 실패 — 정상, Task 10 까지.)

- [ ] **Step 4: 커밋**

```bash
cd milab-pnu
git add astro.config.mjs package.json package-lock.json
git commit -m "$(printf 'build: remark-gfm · rehype-slug 를 마크다운 processor 에 추가\n\n커스텀 unified() processor 가 Astro 기본 GFM·heading id 를 대체하므로\n명시적으로 등록. heading id 는 강의 노트 목차 앵커에 필요.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 3: HeadMeta — csp 오버라이드 prop

**Files:**
- Modify: `milab-pnu/src/components/HeadMeta.astro`

**Interfaces:**
- Consumes: 없음
- Produces: `<HeadMeta title description csp?={string} />` — `csp` 주면 그 값으로 `<meta http-equiv>` 렌더, 없으면 기존 엄격값.

- [ ] **Step 1: Props 와 상수 수정**

`milab-pnu/src/components/HeadMeta.astro` frontmatter:
```astro
import { withBase, SITE } from "../consts";

const STRICT_CSP =
  "default-src 'self'; script-src 'none'; style-src 'self'; " +
  "img-src 'self' data:; font-src 'self' data:; " +
  "base-uri 'none'; form-action 'none'; object-src 'none'";

interface Props {
  title: string;
  description?: string;
  csp?: string;
}
const { title, description = SITE.description, csp = STRICT_CSP } = Astro.props;

const canonical = Astro.site
  ? new URL(Astro.url.pathname, Astro.site).href
  : undefined;
```

- [ ] **Step 2: meta 태그를 변수로**

동일 파일 body 의 CSP `<meta>` 를:
```astro
<meta http-equiv="Content-Security-Policy" content={csp} />
```
(위 주석은 "JS 도입 시 script-src 수정" → "강의 노트 페이지는 NoteLayout 에서 완화 CSP 를 넘긴다" 로 갱신.)

- [ ] **Step 3: 빌드로 회귀 없음 확인**

Run: `cd milab-pnu && npm run build`
Then: `dist/index.html` 의 CSP 가 여전히 엄격값인지 확인 (postbuild 검사의 `index.html` 항목이 통과해야 함).
Expected: 메인 페이지 CSP 검사 통과. 강의 노트 검사는 아직 실패(정상).

- [ ] **Step 4: 커밋**

```bash
cd milab-pnu
git add src/components/HeadMeta.astro
git commit -m "$(printf 'feat(head): HeadMeta 에 csp 오버라이드 prop\n\n기본값은 기존 엄격 CSP. NoteLayout 이 강의 노트용 완화값을 넘길 수 있게.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 4: NoteLayout 3구역 레이아웃 + lecture-note.css + LectureNav + 네비 스크립트

표현 계층의 뼈대. MDX 컴포넌트 없이 일반 마크다운 픽스처로 검증 가능한 범위.

**Files:**
- Modify: `milab-pnu/src/layouts/NoteLayout.astro` (전면 개편)
- Create: `milab-pnu/src/styles/lecture-note.css`
- Create: `milab-pnu/src/components/lecture/LectureNav.astro`
- Create: `milab-pnu/src/components/lecture/lecture-nav.ts`
- Modify: `milab-pnu/src/pages/lecture/[course]/[note].astro` (headings 전달)

**Interfaces:**
- Consumes: `HeadMeta` 의 `csp` prop (Task 3)
- Produces: `<NoteLayout title courseTitle courseSlug week headings={{depth,slug,text}[]} description? />` — 3구역 shell 렌더, 강의 노트 완화 CSP 적용.
- Produces: `initLectureNav(): void` — `.lecture-nav a[href^='#']` 와 대상 heading 을 `IntersectionObserver` 로 연결, 현재 항목에 `aria-current="true"`.

- [ ] **Step 1: lecture-nav.ts 작성**

`milab-pnu/src/components/lecture/lecture-nav.ts`:
```ts
export function initLectureNav(): void {
  const nav = document.querySelector<HTMLElement>(".lecture-nav");
  if (!nav) return;

  const links = new Map<string, HTMLAnchorElement>();
  nav.querySelectorAll<HTMLAnchorElement>("a[href^='#']").forEach((a) => {
    links.set(decodeURIComponent(a.hash.slice(1)), a);
  });

  const headings = [...links.keys()]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (headings.length === 0) return;

  let current: string | null = null;
  const setCurrent = (id: string | null): void => {
    if (id === current) return;
    if (current) links.get(current)?.removeAttribute("aria-current");
    if (id) links.get(id)?.setAttribute("aria-current", "true");
    current = id;
  };

  const seen = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target.id);
        else seen.delete(e.target.id);
      }
      const first = headings.find((h) => seen.has(h.id));
      if (first) setCurrent(first.id);
    },
    { rootMargin: "0px 0px -70% 0px", threshold: 0 },
  );
  headings.forEach((h) => observer.observe(h));
}
```

- [ ] **Step 2: LectureNav.astro 작성**

`milab-pnu/src/components/lecture/LectureNav.astro`:
```astro
---
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}
const { headings } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

{
  items.length > 0 && (
    <nav class="lecture-nav" aria-label="목차">
      <p class="lecture-nav__title">목차</p>
      <ol>
        {items.map((h) => (
          <li class={`lecture-nav__item lecture-nav__item--h${h.depth}`}>
            <a href={`#${h.slug}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

<script>
  import { initLectureNav } from "./lecture-nav";
  initLectureNav();
</script>
```

- [ ] **Step 3: lecture-note.css 작성**

`milab-pnu/src/styles/lecture-note.css`:
```css
/* 강의 노트 전용 표현 계층. global.css 의 .prose-lecture 를 이 파일에서 확장한다.
   인라인 style 금지(CSP) — 모든 규칙 여기 또는 컴포넌트 <style>. */

.lecture-shell {
  display: grid;
  grid-template-columns: 12rem minmax(0, 42rem);
  gap: 3.5rem;
  max-width: 68rem;
  margin: 0 auto;
  padding: 3.5rem 1.5rem 6rem;
}
.lecture-shell__nav {
  position: relative;
}
.lecture-shell__main {
  min-width: 0;
  /* 우측 사이드노트 여백 */
  padding-right: 13rem;
}
.lecture-shell__kicker {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #94a3b8;
}
.lecture-shell__title {
  margin-top: 0.5rem;
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: #0f172a;
}
.lecture-shell .prose-lecture {
  margin-top: 2.5rem;
}
.lecture-shell__footer {
  margin-top: 4rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}
.lecture-shell__footer a {
  font-size: 0.875rem;
  color: #64748b;
  text-decoration: none;
}
.lecture-shell__footer a:hover {
  color: #0f172a;
}

/* ── 좌측 네비게이터 ── */
.lecture-nav {
  position: sticky;
  top: 3.5rem;
  font-size: 0.8125rem;
  line-height: 1.5;
}
.lecture-nav__title {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}
.lecture-nav ol {
  list-style: none;
  padding: 0;
  margin: 0;
}
.lecture-nav__item {
  margin: 0.35rem 0;
}
.lecture-nav__item--h3 {
  padding-left: 0.75rem;
}
.lecture-nav a {
  color: #64748b;
  text-decoration: none;
  display: block;
  border-left: 2px solid transparent;
  padding-left: 0.5rem;
  margin-left: -0.5rem;
}
.lecture-nav a:hover {
  color: #0f172a;
}
.lecture-nav a[aria-current="true"] {
  color: #0f172a;
  font-weight: 600;
  border-left-color: #0f172a;
}

/* ── 대표 그림 (본문 최상단, nav~사이드 전체 폭) ── */
.lecture-hero {
  margin: 0 -13rem 2.5rem -15.5rem;
}
.lecture-hero img {
  width: 100%;
  border-radius: 0.5rem;
}

/* ── 반응형 ── */
@media (max-width: 1100px) {
  .lecture-shell {
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: 2.5rem;
    max-width: 46rem;
  }
  .lecture-shell__main {
    padding-right: 0;
  }
  .lecture-hero {
    margin: 0 0 2.5rem;
  }
}
@media (max-width: 768px) {
  .lecture-shell {
    grid-template-columns: minmax(0, 1fr);
    padding-top: 2rem;
  }
  .lecture-shell__nav {
    /* 상단 접이식으로 — LectureNav 를 details 로 감쌀 필요는 없고 sticky 해제 */
  }
  .lecture-nav {
    position: static;
    margin-bottom: 2rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
  }
}
```

- [ ] **Step 4: NoteLayout.astro 전면 개편**

`milab-pnu/src/layouts/NoteLayout.astro`:
```astro
---
import "../styles/global.css";
import "../styles/lecture-note.css";
import HeadMeta from "../components/HeadMeta.astro";
import LectureNav from "../components/lecture/LectureNav.astro";
import { withBase } from "../consts";

interface Props {
  title: string;
  courseTitle: string;
  courseSlug: string;
  week: number;
  headings: { depth: number; slug: string; text: string }[];
  description?: string;
}
const { title, courseTitle, courseSlug, week, headings, description } =
  Astro.props;
const courseHref = withBase(`/lecture/${courseSlug}`);

const NOTE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; " +
  "img-src 'self' https: data:; " +
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com; " +
  "media-src 'self' https:; font-src 'self' data:; " +
  "base-uri 'none'; form-action 'none'; object-src 'none'";
---

<!doctype html>
<html lang="ko">
  <head>
    <HeadMeta
      title={`${title} · ${courseTitle}`}
      description={description ?? `${courseTitle} — ${title}`}
      csp={NOTE_CSP}
    />
  </head>
  <body class="bg-white text-slate-800">
    <div class="lecture-shell">
      <div class="lecture-shell__nav">
        <LectureNav headings={headings} />
      </div>
      <article class="lecture-shell__main">
        <p class="lecture-shell__kicker">Week {week}</p>
        <h1 class="lecture-shell__title">{title}</h1>
        <div class="prose-lecture">
          <slot />
        </div>
        <footer class="lecture-shell__footer">
          <a href={courseHref}>← 전체 일정</a>
        </footer>
      </article>
    </div>
  </body>
</html>
```

- [ ] **Step 5: [note].astro 가 headings 전달**

`milab-pnu/src/pages/lecture/[course]/[note].astro` frontmatter:
```astro
const { note, courseSlug, courseTitle } = Astro.props;
const { Content, headings } = await render(note);
```
body:
```astro
<NoteLayout
  title={note.data.title}
  courseTitle={courseTitle}
  courseSlug={courseSlug}
  week={note.data.week}
  headings={headings}
>
  <Content />
</NoteLayout>
```

- [ ] **Step 6: 빌드 + 검사 통과 확인**

Run: `cd milab-pnu && npm run build`
Expected:
- 빌드 성공.
- `postbuild` 검사 **통과** ("강의 노트 산출물 검사 통과") — 픽스처 노트가 이제 완화 CSP 로 렌더됨.
- `dist/lecture/_dev-fixture/00-fixture/index.html` 에 `<nav class="lecture-nav">`, `<a href="#첫-번째-섹션">`, `<script type="module" src="/milab/_astro/...">` (번들된 네비 스크립트) 존재, 인라인 `<script>` 본문 없음.

- [ ] **Step 7: 로컬 미리보기로 레이아웃 육안 확인**

Run: `cd milab-pnu && ./dev.ps1` → `http://localhost:4321/milab/lecture/_dev-fixture/00-fixture`
확인: 좌측 목차 표시, 본문 좁은 컬럼, 스크롤 시 현재 섹션 강조 이동, 창 폭 줄이면 768px 이하에서 목차가 본문 위로.

- [ ] **Step 8: 커밋**

```bash
cd milab-pnu
git add src/layouts/NoteLayout.astro src/styles/lecture-note.css src/components/lecture/ src/pages/lecture/\[course\]/\[note\].astro
git commit -m "$(printf 'feat(lecture): 강의 노트 3구역 레이아웃 + 스크롤 추적 목차\n\nNoteLayout 전면 개편(그리드 shell), lecture-note.css 신설,\nLectureNav(headings 기반) + lecture-nav.ts(IntersectionObserver),\n강의 노트 경로 완화 CSP 적용. [note].astro 가 render() headings 전달.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 5: 컴포넌트 주입 배선 + Callout + Details

`<Content components={…}>` 로 bare 태그를 해석하게 만들고, 로직 없는 두 컴포넌트로 배선을 검증한다.

**Files:**
- Modify: `milab-pnu/src/pages/lecture/[course]/[note].astro`
- Create: `milab-pnu/src/components/lecture/Callout.astro`
- Create: `milab-pnu/src/components/lecture/Details.astro`
- Modify: `milab-pnu/src/styles/lecture-note.css` (callout/details 스타일)
- Create: `milab-pnu/lectures/_dev-fixture/weeks/01-components.mdx` (gitignore)

**Interfaces:**
- Consumes: NoteLayout (Task 4)
- Produces: MDX 에서 import 없이 `<Callout type?>` · `<Details summary>` 사용 가능.
- Produces: `<Callout type="intuition"|"warning"|"example"|"note">…</Callout>` → `<div class="callout callout--{type}">`.
- Produces: `<Details summary="…">…</Details>` → 네이티브 `<details class="lecture-details">`.

- [ ] **Step 1: Callout.astro 작성**

`milab-pnu/src/components/lecture/Callout.astro`:
```astro
---
type CalloutType = "intuition" | "warning" | "example" | "note";
interface Props {
  type?: CalloutType;
}
const { type = "note" } = Astro.props;
const LABELS: Record<CalloutType, string> = {
  intuition: "직관",
  warning: "주의",
  example: "예시",
  note: "노트",
};
---

<div class={`callout callout--${type}`}>
  <p class="callout__label">{LABELS[type]}</p>
  <div class="callout__body"><slot /></div>
</div>
```

- [ ] **Step 2: Details.astro 작성**

`milab-pnu/src/components/lecture/Details.astro`:
```astro
---
interface Props {
  summary: string;
}
const { summary } = Astro.props;
---

<details class="lecture-details">
  <summary>{summary}</summary>
  <div class="lecture-details__body"><slot /></div>
</details>
```

- [ ] **Step 3: 스타일 추가**

`milab-pnu/src/styles/lecture-note.css` 끝에 추가:
```css
/* ── Callout ── */
.callout {
  margin: 1.75rem 0;
  padding: 1rem 1.25rem;
  border-left: 3px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 0 0.375rem 0.375rem 0;
}
.callout__label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin: 0 0 0.35rem;
}
.callout__body > :first-child { margin-top: 0; }
.callout__body > :last-child { margin-bottom: 0; }
.callout--warning { border-left-color: #64748b; background: #f1f5f9; }
.callout--intuition { border-left-color: #0f172a; }

/* ── Details ── */
.lecture-details {
  margin: 1.75rem 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
}
.lecture-details > summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
  padding: 0.4rem 0;
}
.lecture-details__body {
  padding: 0.25rem 0 0.75rem;
}
.lecture-details__body > :first-child { margin-top: 0; }
```

- [ ] **Step 4: [note].astro 에 주입 배선**

`milab-pnu/src/pages/lecture/[course]/[note].astro` frontmatter 에 import 추가:
```astro
import Callout from "../../../components/lecture/Callout.astro";
import Details from "../../../components/lecture/Details.astro";

const mdxComponents = { Callout, Details };
```
body 의 `<Content />` 를:
```astro
<Content components={mdxComponents} />
```

- [ ] **Step 5: 픽스처 MDX 노트 작성**

`milab-pnu/lectures/_dev-fixture/weeks/01-components.mdx`:
```mdx
---
title: 컴포넌트 픽스처
week: 0
order: 1
---

## Callout

<Callout type="intuition">경사는 가장 가파른 방향, 학습률은 보폭이다.</Callout>

<Callout type="warning">이건 주의 박스.</Callout>

## Details

<Details summary="접힌 유도">
숨겨진 본문. $a^2 + b^2 = c^2$.
</Details>
```

- [ ] **Step 6: 빌드 + 검사**

Run: `cd milab-pnu && npm run build`
Expected:
- 빌드 성공 (bare `<Callout>`/`<Details>` 가 주입으로 해석됨).
- `dist/lecture/_dev-fixture/01-components/index.html` 에 `<div class="callout callout--intuition">`, `<details class="lecture-details">` 존재.
- postbuild 검사 통과.
- 만약 bare 태그가 해석 안 되고 빌드 실패하면 → fallback: `src/components/lecture/mdx-autoimport.mjs` remark 플러그인으로 각 `.mdx` 상단에 import 자동 삽입. (Astro MDX 의 `components` prop 이 un-imported 태그를 처리하지 못하는 버전일 때만.)

- [ ] **Step 7: 커밋**

```bash
cd milab-pnu
git add src/components/lecture/Callout.astro src/components/lecture/Details.astro src/styles/lecture-note.css src/pages/lecture/\[course\]/\[note\].astro
git commit -m "$(printf 'feat(lecture): Callout · Details MDX 컴포넌트 + 주입 배선\n\n[note].astro 가 Content 에 components 를 주입 → mdx 에서 import 없이 사용.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 6: Figure 컴포넌트

**Files:**
- Create: `milab-pnu/src/components/lecture/Figure.astro`
- Modify: `milab-pnu/src/pages/lecture/[course]/[note].astro` (주입 목록)
- Modify: `milab-pnu/src/styles/lecture-note.css`
- Modify: `milab-pnu/lectures/_dev-fixture/weeks/01-components.mdx`

**Interfaces:**
- Produces: `<Figure src alt caption? source? wide? hero? />` → `<figure class="lecture-figure">` (+ `--wide` / hero 는 `.lecture-hero`). `alt` 필수(빌드 타임 검증).

- [ ] **Step 1: Figure.astro 작성**

`milab-pnu/src/components/lecture/Figure.astro`:
```astro
---
interface Props {
  src: string;
  alt: string;
  caption?: string;
  source?: string;
  wide?: boolean;
  hero?: boolean;
}
const { src, alt, caption, source, wide = false, hero = false } = Astro.props;
if (!src) throw new Error("<Figure>: src 필수");
if (alt === undefined) throw new Error(`<Figure>: alt 필수 (src=${src})`);

const cls = hero
  ? "lecture-hero"
  : wide
    ? "lecture-figure lecture-figure--wide"
    : "lecture-figure";
---

<figure class={cls}>
  <img src={src} alt={alt} loading="lazy" decoding="async" />
  {
    (caption || source) && (
      <figcaption>
        {caption}
        {source && <span class="lecture-figure__source"> (출처: {source})</span>}
      </figcaption>
    )
  }
</figure>
```

- [ ] **Step 2: 스타일 추가**

`lecture-note.css` 끝에:
```css
/* ── Figure ── */
.lecture-figure {
  margin: 2.5rem 0;
}
.lecture-figure img,
.lecture-hero img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
.lecture-figure--wide {
  margin-left: -6rem;
  margin-right: -6rem;
}
.lecture-figure figcaption,
.lecture-hero figcaption {
  margin-top: 0.6rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}
.lecture-figure__source {
  color: #94a3b8;
}
@media (max-width: 1100px) {
  .lecture-figure--wide { margin-left: 0; margin-right: 0; }
}
```

- [ ] **Step 3: 주입 목록에 추가**

`[note].astro`: `import Figure from "../../../components/lecture/Figure.astro";` + `const mdxComponents = { Callout, Details, Figure };`

- [ ] **Step 4: 픽스처에 추가**

`01-components.mdx` 끝에:
```mdx
## Figure

<Figure src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gradient_descent.svg/512px-Gradient_descent.svg.png"
  alt="경사하강 경로" caption="경사하강 경로" source="Wikimedia Commons" wide />
```

- [ ] **Step 5: 빌드 + 검사**

Run: `cd milab-pnu && npm run build`
Expected: 빌드 성공. `dist/.../01-components/index.html` 에 `<figure class="lecture-figure lecture-figure--wide">` + `<img src="https://upload.wikimedia.org/..." alt="경사하강 경로" loading="lazy">` + `(출처: Wikimedia Commons)`. postbuild 검사 통과 (외부 https 이미지는 `img-src https:` 로 허용).

- [ ] **Step 6: 커밋**

```bash
cd milab-pnu
git add src/components/lecture/Figure.astro src/styles/lecture-note.css src/pages/lecture/\[course\]/\[note\].astro
git commit -m "$(printf 'feat(lecture): Figure 컴포넌트 (외부 이미지 + 캡션/출처 + wide/hero)\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 7: Video 컴포넌트 (YouTube/Vimeo 파싱)

**Files:**
- Create: `milab-pnu/src/components/lecture/Video.astro`
- Modify: `milab-pnu/src/pages/lecture/[course]/[note].astro`
- Modify: `milab-pnu/src/styles/lecture-note.css`
- Modify: `milab-pnu/lectures/_dev-fixture/weeks/01-components.mdx`

**Interfaces:**
- Produces: `<Video src caption? />` — `src` 가 YouTube/Vimeo URL 이면 `youtube-nocookie.com`/`player.vimeo.com` iframe(16:9, lazy). 그 외 URL 이면 빌드 타임에 throw.

- [ ] **Step 1: Video.astro 작성**

`milab-pnu/src/components/lecture/Video.astro`:
```astro
---
interface Props {
  src: string;
  caption?: string;
}
const { src, caption } = Astro.props;

function toEmbed(url: string): { src: string; title: string } {
  const yt = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/,
  );
  if (yt) {
    return {
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}`,
      title: "YouTube 동영상",
    };
  }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) {
    return { src: `https://player.vimeo.com/video/${vm[1]}`, title: "Vimeo 동영상" };
  }
  throw new Error(
    `<Video>: 지원하지 않는 URL: ${url} — YouTube / Vimeo 만 가능`,
  );
}

const { src: embedSrc, title } = toEmbed(src);
---

<figure class="lecture-video">
  <div class="lecture-video__frame">
    <iframe
      src={embedSrc}
      title={title}
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowfullscreen></iframe>
  </div>
  {caption && <figcaption>{caption}</figcaption>}
</figure>
```

- [ ] **Step 2: 스타일 추가**

`lecture-note.css` 끝에:
```css
/* ── Video ── */
.lecture-video {
  margin: 2.5rem 0;
}
.lecture-video__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #0f172a;
}
.lecture-video__frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
.lecture-video figcaption {
  margin-top: 0.6rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}
```

- [ ] **Step 3: 주입 목록 + 픽스처**

`[note].astro`: `import Video ...` + map 에 `Video` 추가.
`01-components.mdx` 끝에:
```mdx
## Video

<Video src="https://www.youtube.com/watch?v=aircAruvnKk" caption="신경망 소개 (3Blue1Brown)" />
```

- [ ] **Step 4: 정상 빌드 확인**

Run: `cd milab-pnu && npm run build`
Expected: 빌드 성공. `dist/.../01-components/index.html` 에 `<iframe src="https://www.youtube-nocookie.com/embed/aircAruvnKk"`. postbuild 통과.

- [ ] **Step 5: 미지원 URL 이 빌드를 깨는지 확인**

`01-components.mdx` 의 Video 를 임시로 `<Video src="https://example.com/video.mp4" />` 로 바꾸고:
Run: `cd milab-pnu && npm run build`
Expected: 빌드 **실패**, 메시지 `<Video>: 지원하지 않는 URL: https://example.com/video.mp4`.
확인 후 원래 YouTube URL 로 되돌린다.

- [ ] **Step 6: 커밋**

```bash
cd milab-pnu
git add src/components/lecture/Video.astro src/styles/lecture-note.css src/pages/lecture/\[course\]/\[note\].astro
git commit -m "$(printf 'feat(lecture): Video 컴포넌트 (YouTube/Vimeo URL 파싱 → nocookie iframe)\n\n미지원 URL 은 빌드 타임 throw. 16:9 lazy iframe.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 8: Sidenote 컴포넌트

**Files:**
- Create: `milab-pnu/src/components/lecture/Sidenote.astro`
- Modify: `milab-pnu/src/pages/lecture/[course]/[note].astro`
- Modify: `milab-pnu/src/styles/lecture-note.css`
- Modify: `milab-pnu/lectures/_dev-fixture/weeks/01-components.mdx`

**Interfaces:**
- Produces: `<Sidenote>…</Sidenote>` → `<aside class="sidenote">`. 데스크톱은 우측 여백에 float, CSS counter 로 자동 번호. ≤1100px 에서는 본문 내 인라인 블록.

- [ ] **Step 1: Sidenote.astro 작성**

`milab-pnu/src/components/lecture/Sidenote.astro`:
```astro
---
// 번호는 CSS counter(sidenote) 로 자동. JS 불필요.
---

<aside class="sidenote"><slot /></aside>
```

- [ ] **Step 2: 스타일 추가**

`lecture-note.css` — `.prose-lecture` 관련 블록 근처에:
```css
/* ── Sidenote ── */
.prose-lecture { counter-reset: sidenote; }
.sidenote {
  float: right;
  clear: right;
  width: 11rem;
  margin-right: -13rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #64748b;
  border-left: 1px solid #e2e8f0;
  padding-left: 0.75rem;
}
.sidenote::before {
  counter-increment: sidenote;
  content: counter(sidenote) ". ";
  font-weight: 700;
  color: #0f172a;
}
.sidenote > :first-child { display: inline; margin: 0; }
.sidenote > :last-child { margin-bottom: 0; }

@media (max-width: 1100px) {
  .sidenote {
    float: none;
    width: auto;
    margin: 1rem 0;
    padding: 0.75rem 0 0.75rem 0.85rem;
    border-left: 2px solid #cbd5e1;
    background: #f8fafc;
    border-radius: 0 0.25rem 0.25rem 0;
  }
}
```

- [ ] **Step 3: 주입 목록 + 픽스처**

`[note].astro`: `import Sidenote ...` + map 에 추가.
`01-components.mdx` 끝에:
```mdx
## Sidenote

경사하강법은 1차 방법이다.<Sidenote>2차 방법(Newton)은 Hessian 이 필요해 대규모 모델에 비싸다.</Sidenote>
이어지는 문장은 사이드노트 뒤에도 자연스럽게 흐른다.<Sidenote>두 번째 주석. 번호가 2 로 올라가야 한다.</Sidenote>
```

- [ ] **Step 4: 빌드 + 육안 확인**

Run: `cd milab-pnu && npm run build`
Expected: 빌드 성공, `<aside class="sidenote">` 2개. postbuild 통과.
Run: `cd milab-pnu && ./dev.ps1` → 픽스처 노트에서 데스크톱 폭일 때 우측 여백에 번호 1, 2 로 표시, 1100px 이하에서 본문 내 인라인 박스로.

- [ ] **Step 5: 커밋**

```bash
cd milab-pnu
git add src/components/lecture/Sidenote.astro src/styles/lecture-note.css src/pages/lecture/\[course\]/\[note\].astro
git commit -m "$(printf 'feat(lecture): Sidenote 컴포넌트 (우측 여백 float, CSS counter 번호)\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 9: Cite + References 컴포넌트

**Files:**
- Create: `milab-pnu/src/components/lecture/Cite.astro`
- Create: `milab-pnu/src/components/lecture/References.astro`
- Modify: `milab-pnu/src/pages/lecture/[course]/[note].astro`
- Modify: `milab-pnu/src/styles/lecture-note.css`
- Modify: `milab-pnu/lectures/_dev-fixture/weeks/01-components.mdx`

**Interfaces:**
- Produces: `<Cite n={number} />` → `<a class="cite" href="#ref-{n}"><sup>[{n}]</sup></a>`.
- Produces: `<References items={{ id: number; text: string }[]} />` → `<h2 id="참고문헌">참고문헌</h2><ol class="lecture-refs">` 각 항목 `<li id="ref-{id}">`.
- 무결성: `<Cite n>` 이 참조하는 `#ref-n` 이 산출물에 없으면 `postbuild` 검사(Task 1)가 exit 1.

- [ ] **Step 1: Cite.astro 작성**

`milab-pnu/src/components/lecture/Cite.astro`:
```astro
---
interface Props {
  n: number;
}
const { n } = Astro.props;
if (typeof n !== "number" || !Number.isInteger(n) || n < 1) {
  throw new Error(`<Cite>: n 은 1 이상의 정수여야 함 (받음: ${JSON.stringify(n)})`);
}
---

<a class="cite" href={`#ref-${n}`}><sup>[{n}]</sup></a>
```

- [ ] **Step 2: References.astro 작성**

`milab-pnu/src/components/lecture/References.astro`:
```astro
---
interface RefItem {
  id: number;
  text: string;
}
interface Props {
  items: RefItem[];
}
const { items } = Astro.props;
if (!Array.isArray(items) || items.length === 0) {
  throw new Error("<References>: items 배열이 비어 있음");
}
const ids = items.map((i) => i.id);
const dup = ids.find((id, idx) => ids.indexOf(id) !== idx);
if (dup !== undefined) throw new Error(`<References>: 중복 id ${dup}`);
const sorted = [...items].sort((a, b) => a.id - b.id);
---

<section class="lecture-refs-section">
  <h2 id="참고문헌">참고문헌</h2>
  <ol class="lecture-refs">
    {sorted.map((it) => <li id={`ref-${it.id}`}>{it.text}</li>)}
  </ol>
</section>
```

- [ ] **Step 3: 스타일 추가**

`lecture-note.css` 끝에:
```css
/* ── Cite / References ── */
.cite {
  text-decoration: none;
  color: #64748b;
}
.cite:hover { color: #0f172a; }
.cite sup { font-size: 0.7em; }

.lecture-refs-section { margin-top: 3.5rem; }
.lecture-refs {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #475569;
  padding-left: 1.4rem;
}
.lecture-refs li {
  margin: 0.5rem 0;
  scroll-margin-top: 4rem;
}
.lecture-refs li:target {
  background: #f1f5f9;
  border-radius: 0.25rem;
}
```

- [ ] **Step 4: 주입 목록 + 픽스처**

`[note].astro`: `import Cite ...`, `import References ...` + map 에 둘 다 추가. (최종 map: `{ Sidenote, Figure, Video, Callout, Details, References, Cite }`.)
`01-components.mdx` 끝에:
```mdx
## Cite 와 References

Adam 은 원논문에서 제안되었다.<Cite n={1} /> 딥러닝 일반은 Goodfellow 등을 보라.<Cite n={2} />

<References items={[
  { id: 1, text: "Kingma, D. P., & Ba, J. (2014). Adam: A Method for Stochastic Optimization. ICLR 2015. arXiv:1412.6980." },
  { id: 2, text: "Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press. §8.3, pp. 290–296." },
]} />
```

- [ ] **Step 5: 정상 빌드 + 검사 통과**

Run: `cd milab-pnu && npm run build`
Expected: 빌드 성공. `dist/.../01-components/index.html` 에 `<a class="cite" href="#ref-1">`, `<li id="ref-1">`, `<li id="ref-2">`. postbuild 통과.

- [ ] **Step 6: 무결성 검사가 dangling cite 를 잡는지 확인**

`01-components.mdx` 에 임시로 `<Cite n={9} />` 추가 (References 에 id 9 없음):
Run: `cd milab-pnu && npm run build`
Expected: `astro build` 자체는 성공하나 `postbuild` 검사가 **exit 1**, 메시지 `인용 [ref-9] 에 대응하는 참고문헌 항목 없음`.
확인 후 `<Cite n={9} />` 제거.

- [ ] **Step 7: 커밋**

```bash
cd milab-pnu
git add src/components/lecture/Cite.astro src/components/lecture/References.astro src/styles/lecture-note.css src/pages/lecture/\[course\]/\[note\].astro
git commit -m "$(printf 'feat(lecture): Cite · References 컴포넌트 + 인용 무결성 검사\n\n본문 <Cite n> → 하단 <References items> 항목으로 스크롤. dangling\n인용은 postbuild 검사가 잡음.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```

---

### Task 10: 통합 픽스처 + 반응형·네비 육안 검증

전 컴포넌트를 한 노트에 넣고 실제 읽기 경험을 점검한다. 코드 변경 없음 — 검증·조정 태스크.

**Files:**
- Modify: `milab-pnu/lectures/_dev-fixture/weeks/01-components.mdx` (대표 그림 hero + 실제 글 흐름 흉내)
- Modify (필요 시): `milab-pnu/src/styles/lecture-note.css` (육안 조정)

- [ ] **Step 1: 픽스처를 실제 노트처럼 보강**

`01-components.mdx` 맨 위(첫 `##` 앞)에 hero 추가:
```mdx
<Figure hero
  src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gradient_descent.svg/1024px-Gradient_descent.svg.png"
  alt="개요" caption="이번 주 개요" source="Wikimedia Commons" />
```
그리고 각 섹션에 2~3문단씩 더미 텍스트를 넣어 스크롤 길이를 확보한다 (목차 추적 확인용).

- [ ] **Step 2: 빌드 + 검사**

Run: `cd milab-pnu && npm run build`
Expected: 빌드 성공, postbuild 통과.

- [ ] **Step 3: 데스크톱 육안 점검**

Run: `cd milab-pnu && ./dev.ps1` → `http://localhost:4321/milab/lecture/_dev-fixture/01-components`
체크리스트:
- [ ] 좌측 목차: `## 첫...` 등 h2/h3 표시, 스크롤 시 현재 섹션이 강조 이동, 클릭 시 해당 섹션으로 점프
- [ ] hero 그림이 본문보다 넓게 (nav~사이드 폭)
- [ ] `<Figure wide>` 가 본문보다 약간 넓게, 일반 Figure 는 본문 폭
- [ ] Sidenote 가 우측 여백에 번호 순서대로
- [ ] Video iframe 재생됨 (youtube-nocookie)
- [ ] Callout·Details 표시, Details 펼침/접힘
- [ ] `<Cite>` 클릭 → 하단 참고문헌 해당 항목으로 스크롤 + 하이라이트
- [ ] 수식(인라인·디스플레이) MathML 렌더, 표 렌더

- [ ] **Step 4: 반응형 점검** (브라우저 창 폭 조절 또는 devtools)

- [ ] ~1000px: Sidenote 가 본문 내 인라인 박스로, wide Figure 가 본문 폭으로, 목차는 좌측 유지
- [ ] ~600px: 목차가 본문 위 박스로, 단일 컬럼, 가로 스크롤 없음
- [ ] 디스플레이 수식이 좁은 화면에서 가로 스크롤 되고 페이지 자체는 안 넘침

- [ ] **Step 5: JS 끄고 폴백 확인**

브라우저에서 JS 비활성화 후 픽스처 노트 새로고침:
- [ ] 목차 링크가 여전히 앵커로 동작 (강조만 없음)
- [ ] 페이지 나머지 정상

- [ ] **Step 6: 조정 사항이 있으면 CSS 수정 후 커밋**

```bash
cd milab-pnu
git add src/styles/lecture-note.css
git commit -m "$(printf 'style(lecture): 통합 픽스처 육안 점검 반영 조정\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```
(조정 없으면 이 태스크는 커밋 없이 종료.)

---

### Task 11: ADS 노트 2개 .mdx 이행 + ADL weeks/ 비우기

표현 계층이 실제 콘텐츠 repo 에 적용됨을 확인한다. **콘텐츠 repo 작업 — 각 과목 폴더에서.**
ADL 은 사용자 지시로 기존 뼈대 노트를 지우고 Task 12 에서 Transformers 노트를 새로 쓴다.

**Files:**
- Delete: `pnu/lectures/2026-02/advanced_deep_learning/weeks/01-intro.md`
- Delete: `pnu/lectures/2026-02/advanced_deep_learning/weeks/01b-setup.md`
- Delete: `pnu/lectures/2026-02/advanced_deep_learning/weeks/02-optimization.md`
- `pnu/lectures/2026-02/applied_data_science/weeks/01-overview.md` → `.mdx`
- `pnu/lectures/2026-02/applied_data_science/weeks/02-eda.md` → `.mdx`

- [ ] **Step 1: ADL weeks/ 노트 삭제**

```bash
cd pnu/lectures/2026-02/advanced_deep_learning
git rm weeks/01-intro.md weeks/01b-setup.md weeks/02-optimization.md
```
(`course.md` 의 `weeks:` 계획표는 그대로 둔다 — 노트만 지운다. Schedule 표의 "강의자료" 컬럼이 빈 칸이 되는 건 정상.)

- [ ] **Step 2: ADS 노트 .mdx 이행 + MDX 안전성 점검**

`pnu/lectures/2026-02/applied_data_science/weeks/*.md` 를 `.mdx` 로 rename. MDX 파서를 깨는 요소 점검·수정:
- `<` 뒤에 공백 없이 문자가 오는 표현 (예: `<0.5`) → `{"<0.5"}` 또는 `&lt;0.5`
- 중괄호 `{ }` 를 그대로 쓴 곳 → `` `{ }` `` 코드로 감싸거나 `\{`
현재 두 노트는 단순 마크다운(수식·목록만)이라 대부분 무수정. `$...$`·`$$` 는 그대로 동작.

- [ ] **Step 3: milab-pnu 에서 로컬 통합 빌드**

`.mdx` 파일을 임시로 sync clone 폴더에 반영해 로컬 빌드 (다음 sync 때 덮어써짐):
```bash
cp pnu/lectures/2026-02/applied_data_science/weeks/*.mdx milab-pnu/lectures/2026f-applied-data-science/weeks/
rm -f milab-pnu/lectures/2026f-applied-data-science/weeks/*.md
rm -f milab-pnu/lectures/2026f-advanced-deep-learning/weeks/*.md
cd milab-pnu && npx astro build   # prebuild(sync) 건너뛰려 astro 직접 호출
```
Expected: 빌드 성공, postbuild 통과. ADS 노트가 새 레이아웃으로 렌더. ADL 은 노트 0개.

- [ ] **Step 4: 커밋 (각 과목 repo)**

```bash
cd pnu/lectures/2026-02/advanced_deep_learning
git commit -m "$(printf 'weeks: 뼈대 노트 3개 삭제 (Transformers 노트로 교체 예정)\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"

cd ../applied_data_science
git add -A
git commit -m "$(printf 'weeks: .md → .mdx (표현 계층 컴포넌트 사용 준비)\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

- [ ] **Step 5: push 는 Task 12 완료 후 일괄** — 이 태스크에서는 push 하지 않는다.

---

### Task 12: Transformers 강의 노트 작성 — 전 컴포넌트 통합 테스트

ADL 1주차(계획표상 "Introduction & Course Logistics" 이나, 사용자 지시로 Transformers 심화 노트로 대체) 노트를 **arXiv:1706.03762 "Attention Is All You Need"** 를 backbone 으로 **매우 자세히** 작성한다. 목적 둘: (1) 실제 강의 콘텐츠, (2) 추가한 8개 컴포넌트를 전부 사용해 빌드·렌더 에러가 없는지 확인.

**이 태스크는 서브에이전트가 아니라 메인 세션(리뷰어)이 직접 수행한다** — 컴포넌트 계약·톤·자료조사 맥락이 메인 세션에 있음.

**Files:**
- Create: `pnu/lectures/2026-02/advanced_deep_learning/weeks/01-transformers.mdx`
- (필요 시) Create: `pnu/lectures/2026-02/advanced_deep_learning/weeks/assets/` (자작 SVG 만; 외부 그림은 URL)

**작성 요건:**
- **자료조사**: arXiv:1706.03762 본문을 근거로. 저작권 텍스트를 재현하지 않고 **자기 표현으로 설명·요약**. 인용은 `<Cite>` + `<References>` 로, 서지정보 완전하게(섹션·수식 번호까지). 논문 그림은 재현 대신 자작 SVG 다이어그램 또는 출처 표기한 외부 이미지.
- **흐름**: 읽는 것만으로 따라갈 수 있게. seq2seq/RNN 의 한계 → self-attention 동기 → scaled dot-product attention 수식 유도 → multi-head → positional encoding → encoder/decoder 블록 → 학습 설정 → 결과·영향. 각 수식에 직관과 예시.
- **용어**: 영어 기본 (self-attention, query/key/value, ...).
- **전 컴포넌트 1회 이상 사용**:
  - `<Figure hero>` 1개 (전체 아키텍처 개요 — 자작 SVG 또는 출처 표기 외부 이미지)
  - `<Figure>` (일반 + `wide`) 각 1회 이상
  - `<Video>` 1개 이상 (예: 3Blue1Brown / 저자 강연 등 YouTube)
  - `<Sidenote>` 여러 개 (용어 정의·보충)
  - `<Callout>` 4가지 type 각 1회 (`intuition`/`warning`/`example`/`note`)
  - `<Details>` 1개 이상 (긴 유도 — 예: softmax gradient, $\sqrt{d_k}$ 스케일 이유)
  - `<Cite>` + `<References>` (최소 3개 항목: 원논문 + 관련 2편)
  - 수식: 인라인 + 디스플레이 여러 개. GFM 표 1개 이상 (예: 복잡도 비교 self-attention vs recurrent vs convolutional).

- [ ] **Step 1: 자료조사 메모**

arXiv:1706.03762 의 핵심 구조·수식·수치를 섹션별로 정리 (scratchpad). 관련 후속 문헌 2편 선정 (예: BERT, GPT, "The Annotated Transformer", Vaswani 후속 등) — 서지정보 확정.

- [ ] **Step 2: 노트 초안 작성**

`weeks/01-transformers.mdx` frontmatter:
```mdx
---
title: Transformers — Attention Is All You Need
week: 1
---
```
위 "작성 요건" 대로 본문 작성.

- [ ] **Step 3: 자작 SVG 다이어그램** (필요한 만큼)

인라인 `<svg>` (또는 `weeks/assets/*.svg`). CSP 준수: `style=`·`<style>` 금지, presentation 속성(`fill=`,`stroke=`)만. 최소: 아키텍처 개요, attention 계산 흐름.

- [ ] **Step 4: 로컬 빌드 + 검사 + 육안**

```bash
cp pnu/lectures/2026-02/advanced_deep_learning/weeks/01-transformers.mdx milab-pnu/lectures/2026f-advanced-deep-learning/weeks/
cp -r pnu/lectures/2026-02/advanced_deep_learning/weeks/assets milab-pnu/lectures/2026f-advanced-deep-learning/weeks/ 2>/dev/null || true
cd milab-pnu && npx astro build
```
Expected: 빌드 성공, postbuild 통과 (CSP·인라인 style/script·인용 무결성).
그다음 `npx astro preview` 또는 `./dev.ps1` 로 `/lecture/2026f-advanced-deep-learning/01-transformers` 육안:
- [ ] 8개 컴포넌트 전부 정상 렌더
- [ ] 목차가 모든 h2/h3 추적, 긴 노트에서 스크롤 강조 이동
- [ ] 수식·표·SVG 정상, 반응형 3단계 정상, 가로 스크롤 없음
- [ ] Video 재생, Cite→References 점프

- [ ] **Step 5: 에러/경고 기록 및 수정**

빌드 경고·렌더 깨짐이 있으면 원인이 (a) 컴포넌트 버그면 해당 컴포넌트 파일 수정 후 그 커밋에 반영, (b) 노트 작성 실수면 노트 수정. 어느 쪽이든 빌드·검사 재실행.

- [ ] **Step 6: 커밋 (ADL repo)**

```bash
cd pnu/lectures/2026-02/advanced_deep_learning
git add -A
git commit -m "$(printf 'weeks: Transformers (Attention Is All You Need) 강의 노트\n\narXiv:1706.03762 기반 심화 노트. 표현 계층 컴포넌트 전종 사용.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

- [ ] **Step 7: 일괄 push (사용자 확인 후)**

라이브 검증을 위해 push. **사용자에게 확인 후**:
```bash
cd pnu/lectures/2026-02/advanced_deep_learning && git push
cd ../applied_data_science && git push
cd ../../../milab-pnu && git push
```
1~2분 뒤 `https://jaehoonoh-pnu.github.io/milab/lecture/2026f-advanced-deep-learning/01-transformers` 확인.

---

### Task 13: 픽스처 정리 + 문서화

**Files:**
- Delete: `milab-pnu/lectures/_dev-fixture/` (gitignore 대상이라 git 작업 없음 — 파일 삭제만)
- Modify: `milab-pnu/docs/lecture-authoring.md`
- Modify: `pnu/lectures/CLAUDE.md`
- Modify: `milab-pnu/docs/superpowers/specs/2026-08-27-lecture-content-repos-design.md` (선택: 로그에 4차 한 줄)

- [ ] **Step 1: 픽스처 삭제**

```bash
rm -rf milab-pnu/lectures/_dev-fixture
```

- [ ] **Step 2: lecture-authoring.md 갱신**

`## 이미지 / 로딩` 절의 잘못된 서술(자동 WebP 변환 등)을 정정하고, 새 절 `## 강의 노트 컴포넌트 (MDX)` 를 추가한다. 내용:
- `weeks/` 노트는 `.mdx`. 다음 컴포넌트를 **import 없이** 사용: `Sidenote`, `Figure`, `Video`, `Callout`, `Details`, `References`, `Cite`.
- 각 컴포넌트의 props 표 (Task 5–9 의 Interfaces 블록 그대로).
- 외부 이미지가 기본 수단, `Figure` 의 `source` 로 출처 표기 필수.
- 영상은 YouTube/Vimeo 만.
- 참고문헌: `<Cite n={N}/>` + 하단 `<References items={[…]} />`, 서지정보 완전하게, 지정된 절·페이지 명시.
- `.mdx` 는 `milab-pnu` 빌드로만 렌더된다(단독 X).
- 강의 노트 페이지는 완화 CSP(외부 이미지·YouTube/Vimeo·번들 스크립트 허용); 그 외 페이지는 엄격 CSP 유지.

`## 건드리기 전에 알아야 할 설계 배경` 의 "인터랙티브 위젯(JS) 불가" 항목에 예외 명시: 강의 노트 페이지는 `script-src 'self'` 로 번들 스크립트 1개(목차 추적) 허용.

- [ ] **Step 3: CLAUDE.md 갱신**

`pnu/lectures/CLAUDE.md` 의 규칙 1 ("milab-pnu 는 안 건드린다")에 예외 한 줄:
> 단, 강의 노트 표현 계층(`src/components/lecture/`, `NoteLayout`, `lecture-note.css`, 관련 CSP)은 이 작업의 대상이다 — `docs/superpowers/specs/2026-08-28-lecture-note-presentation-layer-design.md`. `milab-pnu/lectures/` 는 여전히 손대지 않는다.

- [ ] **Step 4: 빌드 최종 확인**

```bash
cd milab-pnu && npm run build
```
Expected: 빌드 성공, postbuild 통과, `_dev-fixture` 라우트 사라짐.

- [ ] **Step 5: 커밋 + push (사용자 확인 후)**

```bash
cd milab-pnu
git add docs/lecture-authoring.md docs/superpowers/specs/
git commit -m "$(printf 'docs(lecture-authoring): 강의 노트 MDX 컴포넌트 절 + CSP 예외\n\n이미지 자동 최적화 서술 정정. 표현 계층 컴포넌트 레퍼런스 추가.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9SM48utw9Bzj5YXcPGoYT')"
```
`pnu/lectures/CLAUDE.md` 는 repo 가 아니므로 파일 저장만 (커밋 없음).

---

## Self-Review

**Spec coverage:**
- 3구역 레이아웃 → Task 4 (+ 육안 Task 10)
- 반응형 3단계 → Task 4 (CSS) + Task 10 (검증)
- 네비게이터(스크롤 추적) → Task 4
- 완화 CSP → Task 3 (prop) + Task 4 (적용) + Task 1 (검사)
- MDX 컴포넌트 8종 → Task 5 (Callout/Details/주입), 6 (Figure), 7 (Video), 8 (Sidenote), 9 (Cite/References), 4 (LectureNav)
- 컴포넌트 주입(import 없이) → Task 5 (+ fallback 명시)
- astro.config (gfm, slug) → Task 2
- `course.md` 손대지 않음 → 명시적 non-goal, 어떤 태스크도 수정 안 함 ✓
- 다크모드 없음 → CSS 에 다크 규칙 없음 ✓
- 콘텐츠 repo 계약 / 로컬 미리보기 함정 → Task 11 (이행), Task 13 (문서화)
- ADS 노트 이행 → Task 11 · ADL weeks/ 비우기 → Task 11 · Transformers 노트(전 컴포넌트 통합 테스트) → Task 12
- 확인 필요 4가지: GFM(Task 2 Step 3), 컴포넌트 주입(Task 5 Step 6 + fallback), 상대경로 이미지 최적화(→ 외부 우선이라 non-goal 로 문서화, Task 13), 번들 스크립트 CSP(Task 4 Step 6) ✓
- 테스트 목록 → Task 1 (검사 스크립트) + Task 7 Step 5 (Video 실패) + Task 9 Step 6 (Cite 무결성) + Task 10 (반응형/네비/폴백) + Task 12 (전 컴포넌트 실사용)

**Placeholder scan:** 코드 블록은 모두 실제 구현. Task 10/12 의 "더미 텍스트"·"작성 요건"·"필요 시 조정"은 콘텐츠·육안 검증 태스크의 성격상 허용 범위 (구체적 체크리스트·요건 목록 제공). Task 12 의 자료조사·문헌 선정은 메인 세션이 수행하며 Step 1 에서 확정. Task 5 의 fallback(remark autoimport)은 조건부 경로로 명시 — 해당 시 별도 판단.

**Type consistency:**
- `headings: { depth: number; slug: string; text: string }[]` — Task 4 (LectureNav, NoteLayout, [note].astro) 일관.
- `mdxComponents` 객체 — Task 5 에서 생성, 6/7/8/9 에서 키 추가. 최종 `{ Sidenote, Figure, Video, Callout, Details, References, Cite }`.
- `check-lecture-notes.mjs` 의 `class="cite"` / `id="ref-N"` — Task 9 의 Cite/References 출력과 일치.
- `initLectureNav(): void` — Task 4 에서 정의·호출.

---

## Execution Handoff

**Subagent-Driven** 으로 실행한다 (사용자 지시). Task 1–11, 13 은 태스크당 새 서브에이전트 + 2단계 리뷰. **Task 12(Transformers 노트)는 메인 세션이 직접 수행** — 자료조사·톤·컴포넌트 계약 맥락이 메인에 있음.

push 는 Task 12 Step 7 에서 사용자 확인 후 일괄 (ADL·ADS·milab-pnu).
