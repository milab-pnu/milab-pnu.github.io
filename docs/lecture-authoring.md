# 강의 자료 작성 가이드

강의 콘텐츠(강의 소개 + 주차별 노트)를 만들고 사이트에 올리는 방법. **이 문서가
강의 작성 관련 규칙의 정본이다.** 새로 알게 된 규칙·함정은 해당 절에 반영하고 커밋한다
(맨 아래 "이 문서 관리" 참고).

시스템이 어떻게 도는지(sync·CI·배포 메커니즘)는 `../README.md` 의 "강의 페이지" 절과
`superpowers/specs/2026-08-27-lecture-content-repos-design.md` 참고.

## 작업 위치

강의 하나 = **독립 GitHub repo**. 각 repo 는 `pnu/lectures/<학기>/<과목>/` 에 클론되어 있고
(`origin` = 그 repo), **강의 자료는 항상 거기서** 수정하고 `git push` 한다.

```
pnu/
├── milab-pnu/                        # 사이트 코드
│   └── lectures/                     # 빌드용 자동 clone — 절대 손대지 않음
└── lectures/                         # ← 작업 공간
    ├── CLAUDE.md                     # 얇은 요약 (이 문서를 가리킴)
    └── 2026-02/
        ├── advanced_deep_learning/   # = github.com/jaehoonoh-pnu/2026f-advanced-deep-learning
        └── applied_data_science/     # = github.com/jaehoonoh-pnu/2026f-applied-data-science
```

## 평소 수정 흐름

```sh
cd pnu/lectures/2026-02/advanced_deep_learning
# course.md 또는 weeks/*.md 수정
git add -A && git commit -m "..." && git push
```

push → 그 repo 의 `.github/workflows/notify.yml` 이 사이트 재배포를 트리거 → **1~2분 뒤 반영**.
로컬 미리보기: `cd pnu/milab-pnu && ./dev.ps1` → http://localhost:4321/milab
(dev 서버는 시작할 때 GitHub 에서 최신 강의 콘텐츠를 당겨온다 → **push 안 한 로컬 커밋은
미리보기에 안 뜬다.** 바로 보려면 push 가 확실).

## 강의 repo 구조

```
<slug>/
├── course.md              # 강의 소개 페이지 (개요 + Schedule 표) — 사이트 네비 있음
├── weeks/
│   ├── 01-intro.md        # 주차 노트 1개 = 웹페이지 1개 — 사이트 네비 없는 독립 문서
│   ├── 01b-setup.md       # 같은 주차에 여러 개 가능 (order 로 정렬)
│   ├── 02-optim.md
│   └── assets/            # 노트에 넣는 이미지 (상대경로 참조)
├── .github/workflows/notify.yml   # 손대지 않음
└── .gitattributes                 # 손대지 않음
```

주차 노트 페이지(`/lecture/<slug>/<노트>`)는 **MI Lab 사이트 크롬(네비·푸터·로고) 없이**
읽기 중심 독립 문서로 렌더된다 (맨 아래 "← 전체 일정" 링크만). `course.md` 페이지는 크롬 있음.

## frontmatter 스키마

실제 강제되는 정의는 `../src/content.config.ts` (`courses`, `lectureNotes` 컬렉션). 아래는 요약.

### `course.md`

| 키 | 필수 | 설명 |
|---|---|---|
| `title` | ✓ | 한글 과목명 |
| `titleEn` |  | 영문명 |
| `term` | ✓ | 표시용 학기 (예: `2026 Fall`) |
| `semester` | ✓ | 정렬용 `YYYY-SS`, 따옴표 필수 (예: `"2026-02"`) |
| `instructor` |  | |
| `schedule` |  | 예: `월/수 15:00–16:15` |
| `location` |  | |
| `credits` |  | 숫자 |
| `summary` |  | 검색엔진용 한 줄. 화면엔 안 보임 |
| `weeks` |  | 계획표. 항목: `{ n: 1, topic: "주제", date?: "2026-09-01", discussion?: 3 }` |

본문(마크다운)은 Goals / Prerequisites / Grading 등으로 표시된다.

### `weeks/*.md` (또는 `.mdx`)

| 키 | 필수 | 설명 |
|---|---|---|
| `title` | ✓ | 노트 제목 |
| `week` | ✓ | 숫자. `course.md` 의 `weeks[].n` 과 매칭 → 계획표 "강의자료" 컬럼에 링크됨 |
| `order` |  | 같은 주차 내 정렬 (기본 0) |

## 수식

- 인라인: `$...$`
- 디스플레이: `$$` 를 **각각 별도 줄**에 둔다 —

  ```
  $$
  \theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}(\theta)
  $$
  ```

  한 줄로 `$$...$$` 쓰면 인라인 취급된다 (remark-math 규칙).
- 빌드 때 **MathML** 로 렌더 (KaTeX JS·CSS 런타임 불필요). 이유는 아래 "설계 배경".

## 코드블록

` ```python ` 처럼 언어를 붙여도 된다. 단 **syntax highlighting 은 꺼져 있어**
어두운 배경에 단색으로 나온다 (이유는 아래 "설계 배경"). 코드 내용·들여쓰기는 그대로 유지됨.

## 이미지 / 로딩

- `weeks/assets/` 에 두고 `![설명](./assets/그림.png)` 상대경로로 참조.
- 빌드 때 자동으로 **WebP 변환 + width/height + `loading="lazy"`**.
- 원본은 적당한 해상도로 (수천 px 짜리는 미리 줄여서).
- 슬라이드 PDF·데이터셋 등 **큰 파일은 페이지에 심지 말고 링크로**.
- 각 노트는 독립 정적 HTML → 방문할 때만 로드. 페이지 하나가 너무 커지면 주차 노트를 쪼갠다.
- **인터랙티브 위젯(JS)** 은 불가 (이유는 아래 "설계 배경").

## 주차별 토론

강의 repo 의 **Discussions** 탭. 스레드 하나 만들고 —

```sh
gh discussion create -R jaehoonoh-pnu/<slug> --category "Q&A" --title "N주차 토론"
```

— 그 번호를 `course.md` `weeks[].discussion` 에 적으면 계획표에 "토론 ↗" 링크가 생긴다.
제목 규칙: `"N주차 토론"` (주제명 안 붙임).

## 새 강의 추가

```powershell
cd pnu/milab-pnu
./scripts/new-lecture.ps1 -Slug 2027s-machine-learning `
    -Path ..\lectures\2027-01\machine_learning `
    -Pat github_pat_xxxxx        # milab repo Actions:write fine-grained PAT (아래 참고)
```

스크립트가: GitHub repo 생성 → 작업 폴더 클론 → 골격 복사(`scripts/lecture-template/`)
→ Discussions 활성화 → `MILAB_DEPLOY_TOKEN` secret 등록. 그다음 직접:

1. `course.md` 를 실제 내용으로 채우고 `git push`
2. `../lectures.config.json` 에 스크립트가 출력한 한 줄 추가 → 커밋 · push

`-Pat` 생략 시 secret 만 수동: `gh secret set MILAB_DEPLOY_TOKEN -R jaehoonoh-pnu/<slug>`
(PAT 발급 방법은 `../README.md` "재배포 트리거용 PAT").

## 주의점

- **`milab-pnu/lectures/` 에서 커밋하지 않는다.** sync 가 매번 덮어쓰는 빌드 입력물이다.
- 배포가 "성공" 인데 사이트 반영이 안 되면 (드묾): milab → Actions → deploy → "Run workflow".
- `MILAB_DEPLOY_TOKEN` PAT 만료 시 자동 배포가 조용히 멈춘다 → 수동 버튼 or 재발급.
- `slug` 은 소문자·숫자·하이픈만. `lectures.config.json` 의 `slug` = 클론 폴더명 = URL 경로.
- 강의 repo 는 **public**. 비밀정보·비공개 개인정보를 넣지 않는다.
- 언어는 한국어 (커밋 메시지·주석 포함).
- 강의 repo 커밋 트레일러:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

## 이 문서 관리

이 문서가 강의 작성 규칙의 정본이다. 작업하다 새 규칙·함정을 알게 되면 **해당 절에
바로 반영하고 `milab-pnu` 에 커밋한다** — `pnu/lectures/` 는 git repo 가 아니라 거기
적으면 사라진다. 짧은 팁은 "주의점" 절에 한 줄 추가한다. 날짜 붙인 변경 로그는 만들지
않는다 (규칙은 항상 현재형으로 유지).

## 건드리기 전에 알아야 할 설계 배경

사이트가 **엄격 CSP**(`style-src 'self'`, `script-src 'none'`)로 돌아서, 인라인
`style=` 이나 런타임 JS 를 쓰는 렌더링은 조용히 깨진다. 아래는 그 때문에 내려진 결정이라
되돌리면 안 된다:

- **수식 → MathML** (`astro.config.mjs`, `rehype-katex { output: 'mathml' }`). KaTeX 의
  기본 HTML 출력은 인라인 style 범벅이라 CSP 에 막힌다. HTML 출력으로 되돌리면 수식이 깨짐.
- **코드블록 하이라이팅 꺼짐** (`markdown.syntaxHighlight: false`). Shiki 가 토큰마다
  인라인 `style=` 로 색을 넣어 CSP 에 막힌다 + 사이트는 무채색 방침. 켜지 않는다.
- **인터랙티브 위젯(JS) 불가** — `script-src 'none'`. 필요하면 사이트 쪽 CSP·React 작업 선행.
