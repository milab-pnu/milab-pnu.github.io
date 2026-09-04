# milab-pnu — 에이전트 안내

MI Lab 웹사이트(Astro 정적 빌드). 배경·구조·배포·강의 시스템은 `README.md` 가 정본이고,
여기서 반복하지 않는다. 아래는 작업 전에 알아야 할 것만.

## 먼저 알 것

- **강의 콘텐츠는 이 repo 에서 고치지 않는다.** 강의 하나 = 별도 repo 이고
  `pnu/lectures/<학기>/<과목>/` 의 클론에서 작업한다. `lectures/`(빌드용 자동 clone)는
  손대지도 커밋하지도 않는다. — `README.md` "강의 페이지"
- **강의 자료 작성 규칙의 정본은 `docs/lecture-authoring.md`** (frontmatter·수식·이미지·
  저작권·새 강의 추가·함정). 새 규칙은 거기 반영한다.

## 개발 서버

백그라운드로 띄운다: `.\dev.ps1 [start|stop|status|logs|restart]`
(또는 `npm run dev:bg` / `dev:stop` / `dev:status` / `dev:logs`). → http://localhost:4321/
자세히는 `README.md` "개발".
