# 강의 자료 작성 가이드

강의 콘텐츠(강의 소개 + 주차별 노트)를 만들고 사이트에 올리는 방법. **이 문서가
강의 작성 관련 규칙의 정본이다.** 새로 알게 된 규칙·함정은 해당 절에 반영하고 커밋한다
(맨 아래 "이 문서 관리" 참고).

시스템이 어떻게 도는지(sync·CI·배포 메커니즘)는 `../README.md` 의 "강의 페이지" 절 참고.

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
        ├── advanced_deep_learning/   # = github.com/milab-pnu/2026f-advanced-deep-learning
        └── applied_data_science/     # = github.com/milab-pnu/2026f-applied-data-science
```

## 평소 수정 흐름

```sh
cd pnu/lectures/2026-02/advanced_deep_learning
# course.md 또는 weeks/*.md 수정 → 빌드·검사 통과 확인 → 커밋
git add -A && git commit -m "..."
# 과목 repo 는 알아서 push. milab-pnu 는 물어보고 push
git push
```

**강의 콘텐츠(과목 repo) push 는 알아서 진행한다** — 되돌리기 쉬우므로. 커밋은 자유롭게
쌓고, 다 됐다 싶으면 push 한다. `milab-pnu`(사이트 코드·이 문서 등 인프라) push 만
사용자에게 물어본다.

push → 그 repo 의 `.github/workflows/notify.yml` 이 사이트 재배포를 트리거 → **1~2분 뒤 반영**.
로컬 미리보기: `cd pnu/milab-pnu && ./dev.ps1` → http://localhost:4321/
(dev 서버는 시작할 때 GitHub 에서 최신 강의 콘텐츠를 당겨온다 → **push 안 한 로컬 커밋은
미리보기에 안 뜬다.** 바로 보려면 push 가 확실).

## 주차 노트: 내용 채우기 절차

주차 노트는 **강의를 대체할 수 있는 읽을거리**를 목표로 한다. 슬라이드 요약이 아니라,
읽는 것만으로 그 주차 내용을 따라갈 수 있어야 한다. 분량 제한은 없다.

**자료조사가 이 작업의 본체다.** 노트를 쓰거나 그림을 그리기 전에, 그 주제를 가장 잘
설명한 자료를 실제로 찾아 연다 — 원논문, 공식 문서, 검증된 해설(블로그·강의·영상),
그리고 **그림·시각화**. 요즘은 좋은 시각 자료가 많다. 개념을 잘 담은 그림이 이미 있으면
라이선스를 확인한 뒤 링크·임베드하는 것이 **1순위**이고, 인라인 `<svg>` 를 새로 그리는
건 대응하는 자료가 정말 없을 때의 최후 수단이다. 자료조사를 건너뛰고 기억으로 쓰거나
그림을 무작정 자작하지 않는다. **저작권은 넣기 전에 확인한다** — "수업용이니까"는
근거가 아니다(아래 "남의 저작물 재사용").

1. **사용자가 다룰 내용을 제시한다.** 필요하면 survey 논문·교재의 특정 절·페이지를
   정확히 지정한다. 과목마다 강조점이 다르므로(이론 깊이 / 구현 / 응용 등) 그 지시도
   여기서 받는다 — 이 문서에 과목별 규칙을 적지 않는다.
2. **자료조사를 꼼꼼히 한다.**
   - **1차 출처(원논문)** 로 사실·수식·수치를 확정한다. 개념은 그것을 처음
     제시했거나 표준이 된 **정본**을 인용한다(예: RoPE → Su et al. 2021, 블로그 아님).
     서지정보는 저자·연도·학회/저널·페이지·arXiv 번호까지 정확하게, 인용한 절·그림
     번호를 각주 항목(`[^키]: …`, 아래 "각주로 인용" 절) 안에 명시한다.
   - **저자가 실제로 연 자료만 인용한다.** 기억으로 인용하지 않는다 — URL 접속,
     저자·연도·제목을 대조한다. 주장 강도에 출처를 맞춘다: 실험 수치·그림은 원논문의
     표·그림 번호까지, 직관·비유는 2차 해설도 되지만 해설임을 드러낸다.
   - **무료 접근본을 우선**한다(arXiv·open-access·저자 PDF·공식 무료판). 페이월이면
     무료 대안을 병기한다. 블로그·공식 문서처럼 내용이 바뀌는 자료는 연도나 접근
     날짜를 적는다.
   - **잘 정리된 해설 블로그·튜토리얼·강의를 적극적으로 찾는다.** 원논문만으로는
     설명이 건조하다 — 그 주제를 가장 잘 풀어낸 2차 자료(예: Transformers 라면
     "The Illustrated Transformer", "The Annotated Transformer", Lilian Weng,
     3Blue1Brown)를 찾아 **설명 방식·비유·그림을 참고**하고, 쓸 만하면 출처를 달아
     `<Figure>`·`<Video>` 로 넣거나 각주로 함께 싣는다.
   - 여러 자료가 엇갈리면 원논문을 따르고, 흔한 오해는 `<Callout type="warning">` 로 짚는다.
   - **남의 저작물을 노트에 넣는 규칙은 아래 "남의 저작물 재사용" 절.** 핵심: 교재·글은
     읽고 **우리 말·우리 구조로 다시 쓴다**, 문단을 옮기지 않는다.
3. **작성한다.**
   - 흐름이 끊기지 않게. 이해 안 된 채 넘어가는 문장이 없어야 한다.
   - **같은 논점을 반복하지 않는다.** 한 가지 이야기는 가장 잘 맞는 곳에서 한 번만.
     절마다 요지를 다시 얹거나, 뒤 절이 앞 절 체크리스트를 다른 말로 되풀이하면 노트가
     늘어지고 독자는 "아까 봤는데"를 반복한다. 맨 끝 정리 절은 예외지만 거기서도 새 문장으로.
     참조로 대체할 수 있으면 그렇게 한다(`§2.1 참고`).
   - **군더더기는 빼되 예시는 아끼지 않는다.** 위치 안내("아래 있다", "맨 아래 링크
     참고")·다른 노트로의 전방 참조("이번 주 N번째 노트에서")·"관심 있으면 미리 봐도
     좋다" 식 곁다리는 초안에서 쳐낸다("이 문장이 없으면 독자가 못 따라가나?"로 훑는다).
     반대로 어려운 메커니즘은 산문만으로는 안 통한다 — 작은 예시로 입력→정답을 한
     줄씩 밟아 보이거나(worked example) 목적에 맞춘 도식을 넣는다. 같은 개념을 두 번
     설명해도 안 통하면 산문을 더 쓰지 말고 예시·도식으로 바꾼다.
   - **읽는 흐름이 자연스럽게.** 소리 내 읽어 걸리지 않을 만큼 다듬는다. 같은 접속사·
     문형·단어가 연달아 나오지 않게, 불릿과 산문을 리듬 있게 섞는다. 번역투, `**굵게**`
     남발, 구호식 단문이 쌓이면 톤이 딱딱해진다. 특히 **영어 자료를 우리 말로 옮겨 쓸
     때 직역투가 새어든다**("각도(angle)", "~에 다름 아니다" 등) — 원문 없이 처음부터
     한국어로 썼다면 이렇게 쓸지 자문한다.
   - 구성요소마다 **무엇을 계산하는가 · 왜 그렇게 하는가 · 작은 예시** 순서.
   - 용어는 기본적으로 **영어**(technical term). 한글로 풀어쓰되 핵심 용어는 영어 병기.
   - **약어는 처음 나올 때 full form 병기** — 개념어(`RoPE(rotary position embedding)`)도
     범용 약어(`GPU(graphics processing unit)`)도. 이후엔 약어만. 예외: 학회·저널명
     (NeurIPS 등)·제품/모델 고유명(BERT 등).
   - 수식은 직관과 함께. 유도가 길면 `<Details>` 로 접는다.
   - 그림·영상은 `<Figure>`·`<Video>` 로 넣는다. 라이선스·출처·자작 규칙은 "남의 저작물
     재사용", 렌더링·크기·인라인 `<svg>` 는 "이미지 / 로딩" 절.
   - 곁가지 설명은 `<Sidenote>`, 강조/직관/주의/예시는 `<Callout>`.
   - **단정적 표현을 절제한다.** "A가 아니라 B다" 식 범주적 부정, "전혀·항상·반드시" 류
     절대어, "의미가 0" 식 단언은 근거가 확실할 때만. 대개 정도로 눅인다("A보다 B가 주가
     된다", "대체로", "~는 위험하다"). 기억용 heuristic(kill criteria 등)은 의도적으로 강하게.
   - **기법·단계를 서로 깎아내리지 않는다.** "모델링은 덜 중요하다", "X만 잘하면 된다"
     식 중요도 서열은 대개 틀리거나 오해를 부른다. 하려는 말이 "여기서 실수하면 되돌리기
     비싸다"거나 "이 수업은 이 단계를 특히 점검한다"라면 그렇게 쓴다.
   - 직관 설명이 막히면 `eli5` 스킬을 쓴다.
   - 톤·구성 참고: <https://thinkingmachines.ai/blog/interaction-models/>
4. **검토한다.** 수식 기호 일관성, 각주 `[^키]` ↔ 정의 매칭·인용↔주장 적합성, 용어 통일,
   약어 full form 병기, 과한 단정 눅이기, 기법·단계 서열 안 매기기, **중복 논점 제거**
   (한 논점은 한 곳, 나머지는 참조), 소리 내 읽어 자연스러운 톤, 저작권(문단 이식 없나·그림
   라이선스/출처), heading 에 수식 없음, 문단 간 논리 연결. `npm run build` 로
   `check-lecture-notes.mjs` 통과.
5. **push 한다.** 과목 폴더에서 커밋 → push → 1~2분 뒤 라이브. push 후 CI 를
   습관적으로 들여다보지 않는다 — 사용자가 요청하면 `gh run list -R
   milab-pnu/milab-pnu.github.io --limit 1` 로 한 번 확인한다.

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

**`weeks/` 안에는 강의 노트(`.md`/`.mdx`)와 `assets/` 만 둔다.** `lectureNotes` 컬렉션은
`glob({ pattern: "*/weeks/*.{md,mdx}" })` 로 로드하는데, 이 로더는 **`_` 접두사 파일도
무시하지 않는다** (그건 구 `src/content/` 컬렉션 API 의 동작). 검수 체크리스트·작업 메모
같은 노트 아닌 `.md` 를 `weeks/` 에 두면 `title`/`week` frontmatter 가 없어
`InvalidContentEntryDataError` 로 **사이트 전체 빌드가 깨진다**. 작업용 파일은 repo 밖에
둔다.

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
| `weeks` |  | 계획표. 항목: `{ n: 1, topic: "주제", date?: "2026-09-01" }` |

본문(마크다운)은 Goals / Prerequisites / Grading 등으로 표시된다.

### `weeks/*.md` 또는 `.mdx`

| 키 | 필수 | 설명 |
|---|---|---|
| `title` | ✓ | 노트 제목 |
| `week` | ✓ | 숫자. `course.md` 의 `weeks[].n` 과 매칭 → 계획표 "강의자료" 컬럼에 링크됨 |
| `order` |  | 같은 주차 내 정렬 (기본 0) |

컴포넌트(`<Figure>` 등, 아래 "강의 노트 컴포넌트")를 쓰려면 `.mdx`. 순수 마크다운이면
`.md` 로 둬도 새 레이아웃(3구역·목차)은 그대로 적용된다. `.mdx` 에서는 텍스트의 `{` 가
JS 표현식으로 해석되니 주의 (인라인 `$...$` 수식 안의 `{}` 는 무방).

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

## 각주로 인용

인용은 컴포넌트가 아니라 **GFM 각주**를 쓴다 (`remark-gfm` 이 빌드 파이프라인에 켜져 있음).

```
softmax 가 포화되지 않는다.[^aiayn]
...
[^aiayn]: Vaswani, A., et al. (2017). Attention Is All You Need. NeurIPS 2017.
  [arXiv:1706.03762](https://arxiv.org/abs/1706.03762). — §3.1–3.3 (attention), Table 2 (BLEU).
```

- **키는 의미 있는 슬러그**(`aiayn`, `leakage`, `vds` …), 숫자 아님. 번호는 remark 가
  **등장 순서로 자동** 매긴다 — 중간에 새 인용을 끼워도 전부 자동 재번호.
- 같은 `[^키]` 를 여러 번 쓰면 **항목 1개 + 위치별 backlink**. 중복 관리 불필요.
- 정의(`[^키]: …`)는 어디 둬도 되지만 **노트 맨 끝에 모아** 둔다 (기존 참고문헌 목록 위치).
  빌드가 하단에 "참고문헌" 절로 자동 수집한다.
- 정의 본문은 **마크다운**(`[제목](url)`·`*이탤릭*`·`$수식$`). **한 노트 안에서 형식
  통일**: `저자(성, 이니셜). (연도). 제목. *매체/venue*. — 뒷받침하는 내용·절·표·그림.`
  링크는 **안정적 식별자**(arXiv abs·DOI·저자 도메인)를 arXiv-id 나 제목에 건다.
  arXiv 도 없으면 venue 표기로 충분 — 억지 링크 금지. 저자명 로마자, 제목 원어 그대로.
- **인용은 그 자리의 특정 주장을 직접 뒷받침한다** — "관련 문헌" 나열이 아니다.
  장식용 인용은 넣지 않는다: 검증돼야 하는 주장이거나, 더 파고들 독자를 위한
  안내일 때만.
- `<Sidenote>` 안에서도 `[^키]` 를 쓸 수 있다.
- 정의 안 된 `[^키]` 는 본문에 리터럴로 남고 `check-lecture-notes.mjs` 가 잡는다.

## 남의 저작물 재사용

강의 노트 repo 는 **public** → 올리는 건 재배포다. 남의 글·그림·코드는 **넣기 전에**
근거(라이선스·출처)를 확인한다. "수업용이니까"는 근거가 아니다.

**저작권은 *표현*을 보호하지 *아이디어·방법·사실*은 보호하지 않는다.**

- **개념·방법·수식·실험 사실**: 읽고 이해해서 **우리 말·우리 구조로** 쓴다. 자유롭다.
- **문단은 옮기지 않는다.** 원문 펴놓고 문단별로 바꿔 써도, **구조·순서·예시 배열**을
  가져오면 근접 모방 = 2차적저작물. 판별: 내 글을 원문 옆에 두고 "저걸 우리말로 바꾼
  것"으로 읽히면 위험. 정본 교재는 지정 읽기로 링크하고(아래 "권장 구조") 노트는 그 위에 얹는다.
- **핵심 정의문도 번역하지 않는다.** "이 용어의 정확한 정의를 넣고 싶다"가 함정이다 —
  우리 말로 다시 쓰거나, 원문이 꼭 필요하면 따옴표 + 출처로 한두 문장만 인용한다.
  프레임워크 용어(PCS 등)를 우리 말로 정의하는 건 자유(방법이지 표현이 아님).
- **짧은 직접 인용**(한두 문장)은 따옴표 + 출처. 번역해도 된다(저작권법 §28).

**그림·도표** — 넣기 전 라이선스 확인:

- **CC(BY·BY-SA·BY-NC·BY-ND·BY-NC-ND 전부) · CC0 · public domain** → **원본 그대로**
  임베드하면 OK. 우리 노트는 무료 공개(비영리)·무수정이라 NC·ND·SA 조건에 걸리지 않는다.
  버전(3.0/4.0)을 원 페이지가 안 밝히면 우리도 단정하지 않는다.
- **출판 논문 그림(IEEE·ACM·Springer·Nature…)은 대개 © 출판사.** arXiv 도 자동 자유
  아님. → **우리가 다시 그리거나**, 본문에서 실제로 분석하는 경우만 §28 인용(그림
  한 장, 출처 명시, 장식용 금지).
- **Wikimedia Commons 는 파일마다 다르다** — 파일 페이지에서 확인.
- **재사용 가능한 도식 모음(딥러닝):** 자작 전에 먼저 뒤진다.
  - [dvgodoy/dl-visuals](https://github.com/dvgodoy/dl-visuals) — Transformer·attention·BERT·
    positional encoding 등 215장, **CC BY 4.0**(상업적 사용까지 허용). raw GitHub URL 또는
    Wikimedia Commons 미러. 출처: `그림 dvgodoy / dl-visuals · CC BY 4.0`.
  - [Jay Alammar](https://jalammar.github.io/) *Illustrated Transformer / BERT / GPT-2* —
    **CC BY-NC-SA 4.0**, 우리 노트(비영리·무수정)에 임베드 가능. mp4 클립도 있음.
  - [Lil'Log](https://lilianweng.github.io/) (Lilian Weng) — 도식 재사용 시 라이선스 각 글에서 확인.
  - CC 표기 없는 블로그(Thinking Machines 등)는 **전권 보유**로 본다 — 그림 임베드 불가,
    설명 방식·구성만 참고하고 필요하면 자작한다.
- **자르거나 다시 그리지 않는다.** 원본 그대로가 아니면 새로 그린다(인라인 `<svg>`).
- 라이선스 불명 = 전권으로 가정 → 자작. **핫링크도 저작권 판단 대상**(면책 아님).
- `source` 형식: `저작자 · 출처 · 라이선스(버전 모르면 생략) · "수정 없음"`. 재현 그림이면
  원 개념 출처도 (예: `그림 Y. Jia, Wikimedia, CC BY-SA 3.0 · 아키텍처는 Vaswani 2017`).

**코드·데이터·사진 등**: 코드는 repo `LICENSE` 확인(없으면 복사 금지), 데이터셋은
재배포·게재 허용 여부, 스톡 사진 금지, `<Video>` 임베드는 링크라 OK. 애매하면 안 쓴다.

### 권장 구조

노트를 교재의 **"다리"** 로 만든다:

1. 교재 해당 장을 **지정 읽기**로 링크한다(`course.md` 주차 표 + 주차 노트 안).
2. 주차 노트는 교재에 **없는 것**을 쓴다 — 우리 과목 맥락(프로젝트·평가·국내 자료),
   우리 학생 도메인 예시, "이 방법론은 N장을 읽어라, 여기서는 **우리 프로젝트에
   어떻게 적용하는지**만".
3. 애매하면 **직접 그린다**. 더 크게 인용·번역해야 하면 저자에게 교육용 허락을 구한다.

## 코드블록

` ```python ` 처럼 언어를 붙여도 된다. 단 **syntax highlighting 은 꺼져 있어**
어두운 배경에 단색으로 나온다 (이유는 아래 "설계 배경"). 코드 내용·들여쓰기는 그대로 유지됨.

## 이미지 / 로딩

- **외부 이미지가 기본 수단이다.** `<Figure src="https://…" />` 로 논문·블로그의 그림을
  직접 참조한다. 강의 노트 경로는 완화 CSP(`img-src 'self' https: data:`)라 외부 https 이미지가 뜬다.
  `source` 로 출처 표기 필수. **라이선스는 넣기 전에 확인** — "남의 저작물 재사용" 절.
- **외부 동영상(mp4·webm)도 심을 수 있다.** 노트 CSP 에 `media-src 'self' https:` 가 있어
  raw `<figure><video src="https://…" autoplay loop muted playsinline controls width="100%"
  aria-label="…"></video><figcaption>…</figcaption></figure>` 가 그대로 동작한다(예:
  `01a-transformer.mdx` 의 Alammar seq2seq 클립). `<Figure>` 는 이미지 전용, `<Video>` 는
  YouTube/Vimeo 전용이라 이 경우엔 둘 다 안 쓴다. `<figcaption>` 안에서는 마크다운·각주가
  안 먹으니 `[^키]` 는 본문 산문에 둔다. 라이선스 확인은 이미지와 동일.
- 상대경로 로컬 이미지(`./assets/그림.png`, `<Figure src="./assets/…" />`)도 쓸 수 있다.
  Astro 콘텐츠 컬렉션의 상대경로 이미지는 자동 최적화(webp·크기·lazy)를 거친다.
  **외부 URL 이미지는 최적화 없이 그대로 나간다** — 원본을 적당한 해상도로.
- 설명·외부 그림으로 부족하면 **인라인 `<svg>` 다이어그램**을 직접 그린다(최후 수단).
  CSP 상 `style=`·`<style>` 불가 → presentation 속성(`fill=`, `stroke=`, `font-size=`)만.
  `01-transformers.mdx` 에 예시가 있다. **한 노트 안의 SVG 는 viewBox 크기·글자
  크기·박스 규격·색을 서로 맞춘다** — 안 그러면 그림마다 축척이 달라 보인다.
  현재 팔레트: 박스 `#f8fafc`/`#e2e8f0`, 강조 `#0f172a`, 보조 텍스트 `#64748b`,
  연결선 `#0f172a`(강조)·`#94a3b8`(약).
- **그림 폭은 CSS 가 통일한다** — 원본 해상도와 무관하게 hero 40rem, 그 외 모든
  `<Figure>`·`<figure>` 는 32rem 로 고정되고 가운데 정렬된다. 즉 큰 이미지를 넣어도
  본문을 가득 채우지 않는다. `wide` prop 은 현재 일반과 동일하게 취급된다.
- 슬라이드 PDF·데이터셋 등 **큰 파일은 페이지에 심지 말고 링크로**.
- 각 노트는 독립 정적 HTML → 방문할 때만 로드. 페이지 하나가 너무 커지면 주차 노트를 쪼갠다.

## 강의 노트 컴포넌트 (MDX)

`weeks/*.mdx` (`.mdx` 확장자) 에서 **import 없이** 아래 컴포넌트를 태그로 쓴다.
`src/pages/lecture/[course]/[note].astro` 가 `<Content components={…}>` 로 주입한다.
`.mdx` 는 **`milab-pnu` 빌드를 통해서만** 제대로 렌더된다(단독으로 열면 안 됨).
컴포넌트는 전부 `milab-pnu/src/components/lecture/` 에 있다.

| 컴포넌트 | 용법 | 비고 |
|---|---|---|
| `<Sidenote>…</Sidenote>` | 본문 옆 우측 여백 주석 | **문장 끝에 붙여 쓴다**(`…한다.<Sidenote>…</Sidenote>`) — 단독 줄에 두면 본문 위첨자 번호가 허공에 뜬다. 자동 번호. 좁은 화면은 인라인. 설명 전용 — 서지 인용은 각주(`[^키]`) |
| `<Figure src alt caption? source? wide? hero? />` | 그림 + 캡션 + 출처 | `alt` 필수. `source` 로 출처 표기 필수. `wide`=본문보다 넓게, `hero`=최상단 전체 폭 |
| `<Video src caption? />` | YouTube/Vimeo 임베드 | URL 파싱 → nocookie iframe. **그 외 URL 은 빌드 실패** |
| `<Callout type="intuition"\|"warning"\|"example"\|"note">…</Callout>` | 강조 박스 | 라벨: 직관/주의/예시/노트 |
| `<Details summary="…">…</Details>` | 접이식 블록 | 긴 유도·보충. 네이티브 `<details>` |

인용은 컴포넌트가 아니라 GFM 각주(`[^키]`)를 쓴다 — 위 "각주로 인용" 절.

- 좌측 목차는 `##`/`###` 마크다운 heading 에서 자동 생성된다. **heading 에 `$수식$`
  을 넣지 않는다**(목차 텍스트가 깨짐) — 유니코드로.
- 컴포넌트 목록을 바꾸면 `[note].astro` 의 주입 객체와 이 표를 함께 갱신한다.

## 새 강의 추가

```powershell
cd pnu/milab-pnu
./scripts/new-lecture.ps1 -Slug 2027s-machine-learning `
    -Path ..\lectures\2027-01\machine_learning `
    -Pat github_pat_xxxxx        # milab-pnu.github.io Actions:write PAT — 기존 MILAB_DEPLOY_TOKEN 재사용 가능 (아래 참고)
```

스크립트가: GitHub repo 생성 → 작업 폴더 클론 → 골격 복사(`scripts/lecture-template/`)
→ `MILAB_DEPLOY_TOKEN` secret 등록. 그다음 직접:

1. `course.md` 를 실제 내용으로 채우고 `git push`
2. `../lectures.config.json` 에 스크립트가 출력한 한 줄 추가 → 커밋 · push

`-Pat` 생략 시 secret 만 수동: `gh secret set MILAB_DEPLOY_TOKEN -R milab-pnu/<slug>`
(PAT 발급 방법은 `../README.md` "재배포 트리거용 PAT").

## 주의점

- **`milab-pnu/lectures/` 에서 커밋하지 않는다.** sync 가 매번 덮어쓰는 빌드 입력물이다.
- **GitHub 쓰기 API 를 몰아서 호출하지 않는다** (예: `gh` 를 짧은 시간에 루프로 십수 번,
  더구나 여러 repo 에 걸쳐). 어뷰징 탐지에 걸려 **계정이 정지**된다 (실제로 겪음 — 복구에
  며칠, 그동안 push·Pages·gh 전부 차단). write 작업은 소량씩 간격을 두고.
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

사이트 대부분이 **엄격 CSP**(`style-src 'self'`, `script-src 'none'`, `img-src 'self'`)로
돌아서, 인라인 `style=` 이나 런타임 JS·외부 자원을 쓰는 렌더링은 조용히 깨진다. 아래는
그 때문에 내려진 결정이라 되돌리면 안 된다:

- **수식 → MathML** (`astro.config.mjs`, `rehype-katex { output: 'mathml' }`). KaTeX 의
  기본 HTML 출력은 인라인 style 범벅이라 CSP 에 막힌다. HTML 출력으로 되돌리면 수식이 깨짐.
- **코드블록 하이라이팅 꺼짐** (`markdown.syntaxHighlight: false`). Shiki 가 토큰마다
  인라인 `style=` 로 색을 넣어 CSP 에 막힌다 + 사이트는 무채색 방침. 켜지 않는다.
- **강의 노트 페이지(`/lecture/<course>/<note>`)만 완화 CSP.** `NoteLayout` 이
  `HeadMeta` 의 `csp` prop 으로 넘긴다: `script-src 'self'`(번들 아닌 정적 파일
  `public/lecture-nav.js` 목차 추적 스크립트 1개), `img-src 'self' https: data:`(외부 이미지),
  `media-src 'self' https:`(외부 동영상·오디오 — raw `<video>` 로 mp4 임베드 가능),
  `frame-src` = YouTube-nocookie·Vimeo(영상 임베드). 인라인 `<script>`·CDN 은 여전히
  차단 — Astro 가 작은 모듈 스크립트를 HTML 에 인라인해버리므로 노트용 JS 는 `public/`
  정적 파일로 두고 `<script is:inline src>` 로 부른다. 그 외 모든 페이지는 엄격 CSP.
- **빌드 검사** `scripts/check-lecture-notes.mjs` 가 `postbuild` 로 돌며 산출물에서
  노트 페이지의 CSP·인라인 `style=`/`<script>`·해석 안 된 각주(`[^키]`)·단독 줄에 놓인
  `<Sidenote>`(문장 끝에 안 붙은 것)를, 그 외 페이지의 엄격 CSP 유지를 확인한다.
  테스트 프레임워크는 없다.
- **`lectures/_dev-fixture/`** (`.gitignore` 됨, 로컬 전용): 노트 컴포넌트와 각주 인용을
  전부 쓰는 회귀 픽스처. 표현 계층을 고칠 때 강의 repo sync 없이 `npm run build` 로 렌더·검사를
  확인하려고 둔다. CI 에는 없으므로 배포에 영향 없다. `sync-lectures.mjs` 가 "미등록
  폴더" 경고를 내지만 무시해도 된다.
