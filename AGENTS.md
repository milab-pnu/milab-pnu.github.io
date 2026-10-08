# milab-pnu — 에이전트 안내

MI Lab 웹사이트(Astro 정적 빌드). 배경·구조·배포·강의 시스템은 `README.md`가 정본이고 여기서
반복하지 않는다. `AGENTS.md`가 원본이고 `CLAUDE.md`는 그 심볼릭 링크다(일반 파일로 덮어쓰지 않는다).

## 먼저 알 것

- **강의 콘텐츠는 이 repo에서 고치지 않는다.** 강의 하나 = 별도 repo이고 `pnu/lectures/<학기>/<과목>/`
  클론에서 작업한다. `lectures/`(빌드용 자동 clone)는 손대지도 커밋하지도 않는다.
- **정본 문서.** 강의 노트 작성·검토(검토 기준·표기·인용·저작권·커밋)는 `docs/lecture-authoring.md`,
  frontmatter·컴포넌트·이미지·공개 주차·새 강의·설계 배경은 `docs/lecture-site-reference.md`,
  Claude Code·Codex 협업은 `docs/agent-workflow.md`. 새 규칙은 해당 문서에 넣는다.
- **커밋.** 실제 참여한 도구의 `Co-Authored-By`를 반드시 붙인다(모델명을 몰라도 도구 이름으로).
  이 repo의 push는 사용자에게 묻는다. `.claude/`·`.codex/` 로컬 설정은 커밋하지 않는다.
- **개발 서버**는 백그라운드로: `npm run dev:bg` / `dev:stop` / `dev:status` / `dev:logs`
  → http://localhost:4321/ (Windows는 `.\dev.ps1`도 가능, macOS에서는 `pwsh`가 없으면 안 됨).
  자세히는 `README.md` "개발".
