import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const cli = fileURLToPath(new URL('node_modules/astro/bin/astro.mjs', root));
function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: fileURLToPath(root), stdio: 'inherit',
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

// dev와 build는 .astro의 콘텐츠 모듈 목록을 공유한다.
let server;
try {
  server = JSON.parse(readFileSync(new URL('.astro/dev.json', root), 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
if (server) {
  try { process.kill(server.pid, 0); }
  catch (error) {
    if (error.code === 'ESRCH') server = undefined;
    else throw error;
  }
}
if (server && !server.background) {
  throw new Error('포그라운드 개발 서버를 종료한 뒤 빌드하세요. 빌드 후 npm run dev로 다시 시작하세요.');
}
if (server && run(['dev', 'stop']) !== 0) {
  throw new Error('개발 서버를 중지하지 못해 빌드를 취소했습니다.');
}
let status = 1;
try {
  status = run(['build', ...process.argv.slice(2)]);
} finally {
  // 빌드 실패 시에도 편집용 서버를 복구한다.
  if (server) {
    const restart = run(['dev', '--background', '--port', String(server.port)]);
    if (restart !== 0) status = restart;
  }
}
process.exitCode = status;