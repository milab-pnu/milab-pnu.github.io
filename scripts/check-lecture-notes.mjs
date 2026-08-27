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

/** dist 안의 모든 .html 경로 (재귀) */
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

let noteCount = 0;

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(dist.length + 1).replace(/\\/g, "/");
  // 강의 노트 페이지: /lecture/<slug>/<note>/ (강의 목록·강의 첫 페이지 제외)
  const isNote =
    /^lecture\/[^/]+\/[^/]+\//.test(rel) && rel !== "lecture/index.html";

  const cspMatch = html.match(
    /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
  );
  const csp = cspMatch?.[1] ?? null;

  if (isNote) {
    noteCount++;
    if (csp !== NOTE_CSP)
      err(rel, `강의 노트 CSP 불일치\n  기대: ${NOTE_CSP}\n  실제: ${csp}`);
    // 인라인 style= 금지
    if (/<[^>]+\sstyle=/.test(html)) err(rel, "인라인 style= 속성 발견");
    // 실행되는 인라인 <script> 금지 (src= 또는 비실행 type 만 허용)
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const attrs = m[1];
      const body = m[2].trim();
      const hasSrc = /\bsrc=/.test(attrs);
      const nonExecType =
        /\btype=(["'])(?:application\/(?:ld\+)?json|text\/template)\1/.test(
          attrs,
        );
      if (body && !hasSrc && !nonExecType)
        err(rel, "인라인 <script> 본문 발견");
    }
    // <Cite> → <References> 참조 무결성.
    // 계약: <a class="cite" ... href="#ref-N">. class·href 순서 무관하게 매칭.
    for (const m of html.matchAll(/<a\b[^>]*\bclass="cite"[^>]*>/g)) {
      const hrefMatch = m[0].match(/href="#(ref-\d+)"/);
      if (!hrefMatch) {
        err(rel, `class="cite" 앵커에 href="#ref-N" 없음: ${m[0]}`);
        continue;
      }
      if (!html.includes(`id="${hrefMatch[1]}"`))
        err(rel, `인용 [${hrefMatch[1]}] 에 대응하는 참고문헌 항목 없음`);
    }
  } else if (rel.endsWith("index.html") || rel === "404.html") {
    // 강의 노트 외 모든 페이지는 엄격 CSP 유지 (HeadMeta 회귀 방지)
    if (csp !== STRICT_CSP)
      err(rel, `엄격 CSP 여야 함\n  기대: ${STRICT_CSP}\n  실제: ${csp}`);
  }
}

// dist 레이아웃이 바뀌어 노트 페이지가 하나도 안 잡히면 (base 변경 등) → 조용한 통과 방지
if (noteCount === 0)
  err(
    "(전역)",
    "강의 노트 페이지를 하나도 찾지 못함 — dist 레이아웃/경로 규칙 확인",
  );

if (errors.length) {
  console.error(
    `[check] 실패 (${errors.length}건):\n` +
      errors.map((e) => " - " + e).join("\n"),
  );
  process.exit(1);
}
console.log(`[check] 강의 노트 산출물 검사 통과 (노트 ${noteCount}개)`);
