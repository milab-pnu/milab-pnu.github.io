# 에이전트 협업 가이드 (Claude Code · Codex)

Claude Code와 Codex로 `milab-pnu`와 과목 repo를 작업할 때의 공통 규칙. **이 문서가
도구 협업 규칙의 정본이다.** 강의 작성 규칙은 `lecture-authoring.md`, 사이트 구조는
`../README.md`를 따른다.

**한 도구만 써도 된다.** 아래 규칙은 도구 수와 관계없이 지키는 것(시작 위치·지침 읽기·
설정·커밋)과 둘을 함께 쓸 때만 해당하는 것(역할·동시 작업·인수인계)으로 나뉜다.

## 공통 — 한 도구만 쓸 때도

### 시작 위치와 지침 읽기

- 강의 작업은 `pnu/lectures/`에서, 사이트 작업은 `pnu/milab-pnu/`에서 시작한다.
- 각 폴더의 `AGENTS.md`가 지침 원본이고 `CLAUDE.md`는 그 심볼릭 링크다. 규칙은
  `AGENTS.md`에서 고치고, 링크를 일반 파일로 덮어쓰지 않는다.
- **과목 폴더에서 작업하기 전에 그 과목의 `AGENTS.md`를 직접 읽는다.** 두 도구는 지침을
  불러오는 범위가 다르다. Claude Code는 상위 폴더의 `CLAUDE.md`와 작업 중 들어간 하위
  폴더의 `CLAUDE.md`를 불러오지만, Codex는 시작할 때 git 루트부터 시작 폴더까지의
  `AGENTS.md`만 읽는다. `pnu/lectures/`는 git repo가 아니라서 Codex가 과목 규칙을
  놓칠 수 있고, 과목 폴더에서 시작하면 `pnu/lectures/AGENTS.md`를 놓칠 수 있다.

### 로컬 설정

- 도구별 로컬 설정(`.claude/`, `.codex/`)은 커밋하지 않는다. 과목 repo와 `milab-pnu`는
  public이다.
- 도구별 설정에 공통 규칙을 따로 복제하지 않는다. 두 도구가 공유할 규칙은 `AGENTS.md`나
  이 문서에 둔다.

### 커밋

- 실제 참여한 도구의 `Co-Authored-By`를 붙인다. 둘 다 참여했으면(리뷰 반영 포함) 두 줄
  모두 넣는다. 표기·검증은 `lecture-authoring.md`의 공동 작성자 규칙을 따른다.
- push 권한은 도구와 관계없이 같다. 과목 repo는 알아서 push하고, `milab-pnu`는
  물어본다.

## 두 도구를 함께 쓸 때

### 역할

- 작성·리뷰 역할은 **작업마다 사용자가 정한다.** 정하지 않았으면 그 작업을 받은 도구가
  작성자다.
- 리뷰어는 작성자의 diff(`git diff`, `git show`)를 기준으로 지적한다. 직접 고치는 건
  사용자가 요청할 때만 한다. 지적할 때는 파일·줄·근거를 붙인다.
- 리뷰에서 확인할 것: 과목 `AGENTS.md`와 `lecture-authoring.md` 규칙 준수, 출처·저작권,
  수식·각주 렌더, `npm run build` 결과.

### 동시 작업

- **한 repo에는 한 도구만 쓴다.** 같은 작업 트리를 두 도구가 동시에 수정하지 않는다.
- 병렬로 하려면 과목(repo)을 나누거나 `git worktree`로 작업 트리를 나눈다.
- `milab-pnu` 빌드·개발 서버도 한 번에 한 도구만 다룬다. 서버를 켠 채 빌드할 때의 주의는
  `lecture-authoring.md` "개발 서버 실행 중 빌드"를 따른다.

### 인수인계

작업을 다른 도구로 넘길 때는 `HANDOFF.md`에 적고 커밋하지 않는다. 넘겨받은 도구는 읽고
이어서 작업한 뒤, 끝나면 지운다.

- 강의 작업: `pnu/lectures/HANDOFF.md` (git repo 밖). 과목 repo 안에 두지 않는다 —
  과목 `.gitignore`는 스캐폴드라 고치지 않으므로 `git add -A`에 딸려 들어간다.
- 사이트 작업: `pnu/milab-pnu/HANDOFF.md` (`.gitignore` 대상).

```md
# HANDOFF
- 대상: (과목 repo 또는 milab-pnu)
- 목표:
- 역할: 작성 = … / 리뷰 = …
- 진행 상태: (커밋 해시, 수정 중인 파일)
- 남은 일:
- 주의점: (합의된 결정, 건드리지 말 것)
```

커밋하지 않은 변경은 넘기기 전에 커밋하거나 `HANDOFF.md`에 명시한다.

## 이 문서 관리

협업 방식이 바뀌면 이 문서를 고치고 `milab-pnu`에 커밋한다. 각 `AGENTS.md`에는 요약과
이 문서 링크만 둔다.
