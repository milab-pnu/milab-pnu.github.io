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
