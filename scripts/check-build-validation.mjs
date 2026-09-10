import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NOTE_CSP, STRICT_CSP } from "../src/lib/csp.mjs";

const tempRoot = resolve(tmpdir());
const fixture = mkdtempSync(join(tempRoot, "milab-build-check-"));
const checker = fileURLToPath(new URL("./check-lecture-notes.mjs", import.meta.url));
const page = (body = "", csp = STRICT_CSP) =>
  `<meta http-equiv="Content-Security-Policy" content="${csp}">${body}`;
const check = (expected) => {
  const result = spawnSync(process.execPath, [checker, fixture], { encoding: "utf8" });
  assert.equal(result.status, expected, result.stdout + result.stderr);
};

try {
  check(1); // 비어 있는 빌드는 통과하지 않는다.
  writeFileSync(join(fixture, "index.html"), page());
  check(0); // 노트가 없는 사이트/전체 비공개도 정상이다.
  writeFileSync(join(fixture, "index.html"), page('<a href="/lecture/course/note">노트</a>'));
  check(1); // 노트가 생성되지 않은 링크는 실패한다.
  const noteDir = join(fixture, "lecture", "course", "note");
  mkdirSync(noteDir, { recursive: true });
  writeFileSync(join(noteDir, "index.html"), page("", NOTE_CSP));
  check(0);
  writeFileSync(join(fixture, "index.html"), page('<a href="/base/lecture/course/note/">노트</a>'));
  check(0); // base 경로도 지원한다.
  writeFileSync(join(noteDir, "index.html"), page('<p style="color:red">오류</p>', NOTE_CSP));
  check(1);
  writeFileSync(join(noteDir, "index.html"), page());
  check(1); // 강의에 엄격 CSP를 잘못 적용한 경우.
} finally {
  // 이번 실행이 만든 임시 디렉터리만 삭제한다.
  assert.equal(dirname(resolve(fixture)), tempRoot);
  assert.ok(fixture.startsWith(join(tempRoot, "milab-build-check-")));
  rmSync(fixture, { recursive: true, force: true });
}
console.log("[check] 빌드 검사 회귀 검증 통과");
