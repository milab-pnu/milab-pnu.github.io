// 강의 콘텐츠 저장소 동기화.
//
// lectures.config.json 의 각 항목을 lectures/<slug>/ 로 clone(없으면) / 갱신(있으면).
// git submodule 을 쓰지 않는 이유: 편집마다 메인 repo 의 포인터 커밋이 필요해서.
// lectures/ 는 .gitignore — 메인 repo 에 커밋되지 않는다.
//
// prebuild / predev 훅에서 자동 실행. 수동 실행: npm run lectures:sync

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "lectures.config.json");
const lecturesDir = join(root, "lectures");

/** @typedef {{ slug: string, repo: string, ref?: string }} LectureEntry */

/** git 명령 실행 (실패 시 throw, stderr 포함) */
function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  })
    .toString()
    .trim();
}

/** @returns {LectureEntry[]} */
function readConfig() {
  if (!existsSync(configPath)) {
    console.warn(`[lectures] ${configPath} 없음 — 동기화 건너뜀`);
    return [];
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (e) {
    console.error(`[lectures] lectures.config.json 파싱 실패: ${e.message}`);
    process.exit(1);
  }
  if (!Array.isArray(parsed)) {
    console.error("[lectures] lectures.config.json 은 배열이어야 함");
    process.exit(1);
  }
  for (const e of parsed) {
    if (!e || typeof e.slug !== "string" || typeof e.repo !== "string") {
      console.error(
        `[lectures] 잘못된 항목 ${JSON.stringify(e)} — slug, repo 는 필수`,
      );
      process.exit(1);
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(e.slug)) {
      console.error(
        `[lectures] 잘못된 slug "${e.slug}" — 소문자·숫자·하이픈만 가능`,
      );
      process.exit(1);
    }
  }
  return parsed;
}

/** @param {LectureEntry} entry */
function syncOne(entry) {
  const ref = entry.ref || "main";
  const dest = join(lecturesDir, entry.slug);
  const isRepo = existsSync(join(dest, ".git"));

  if (!isRepo && existsSync(dest)) {
    console.error(
      `[lectures] ${dest} 가 git repo 가 아님 — 폴더를 지우고 다시 실행하세요`,
    );
    process.exit(1);
  }

  if (!isRepo) {
    mkdirSync(dest, { recursive: true });
    git(["init", "-q"], dest);
    git(["remote", "add", "origin", entry.repo], dest);
  } else {
    // config 에서 repo URL 이 바뀌었을 수 있으니 매번 맞춰줌
    git(["remote", "set-url", "origin", entry.repo], dest);
  }

  console.log(`[lectures] ${entry.slug}  ←  ${entry.repo} @ ${ref}`);
  // branch / tag / commit SHA 모두 이 경로로 처리됨 (GitHub 는 SHA fetch 허용)
  git(["fetch", "--depth", "1", "origin", ref], dest);
  git(["checkout", "-qf", "FETCH_HEAD"], dest);
}

function main() {
  const config = readConfig();
  mkdirSync(lecturesDir, { recursive: true });

  for (const entry of config) {
    try {
      syncOne(entry);
    } catch (err) {
      const detail = String(err?.stderr || err?.message || err).trim();
      console.error(`[lectures] ${entry.slug} 동기화 실패:\n${detail}`);
      console.error(
        `[lectures] repo URL / ref / 접근 권한을 확인하세요 — ` +
          `${entry.repo} @ ${entry.ref || "main"}`,
      );
      process.exit(1);
    }
  }

  // 매니페스트에 없는 폴더는 삭제하지 않고 경고만 (스모크 테스트용 임시 폴더 보호)
  const wanted = new Set(config.map((e) => e.slug));
  for (const d of readdirSync(lecturesDir, { withFileTypes: true })) {
    if (d.isDirectory() && !wanted.has(d.name)) {
      console.warn(
        `[lectures] lectures/${d.name} 는 lectures.config.json 에 없음 (그대로 둠)`,
      );
    }
  }

  if (config.length === 0) {
    console.log("[lectures] 등록된 강의 없음 (lectures.config.json 이 빈 배열)");
  } else {
    console.log(`[lectures] ${config.length}개 강의 동기화 완료`);
  }
}

main();
