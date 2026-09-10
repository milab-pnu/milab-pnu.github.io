# milab-pnu — 에이전트 안내

MI Lab 웹사이트(Astro 정적 빌드). 배경·구조·배포·강의 시스템은 `README.md` 가 정본이고,
여기서 반복하지 않는다. 아래는 작업 전에 알아야 할 것만.

## 지침 파일 관리

`AGENTS.md`가 공통 지침의 원본이고, `CLAUDE.md`는 이를 가리키는 심볼릭 링크다.
규칙은 `AGENTS.md`에서 수정한다. `CLAUDE.md` 링크를 일반 파일로 덮어쓰지 않는다.

## 먼저 알 것

- **강의 콘텐츠는 이 repo 에서 고치지 않는다.** 강의 하나 = 별도 repo 이고
  `pnu/lectures/<학기>/<과목>/` 의 클론에서 작업한다. `lectures/`(빌드용 자동 clone)는
  손대지도 커밋하지도 않는다. — `README.md` "강의 페이지"
- **강의 자료 작성 규칙의 정본은 `docs/lecture-authoring.md`** (frontmatter·수식·이미지·
  저작권·새 강의 추가·함정). 새 규칙은 거기 반영한다.

## 커밋 공동 작성자

Claude Code·Codex가 작성하거나 수정한 커밋에는 실제 참여한 도구의 `Co-Authored-By`를
반드시 추가한다. 모델명을 확인할 수 없어도 도구 이름으로 남긴다. 표기와 검증 방법은
`docs/lecture-authoring.md`의 공동 작성자 규칙을 따른다.

## 개발 서버

백그라운드로 띄운다: `.\dev.ps1 [start|stop|status|logs|restart]`
(또는 `npm run dev:bg` / `dev:stop` / `dev:status` / `dev:logs`). → http://localhost:4321/
자세히는 `README.md` "개발".
