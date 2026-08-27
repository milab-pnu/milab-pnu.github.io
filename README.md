# milab

부산대학교 **Multimodal Intelligence Lab (MI Lab)** 웹사이트.

- 프레임워크: [Astro](https://astro.build) (정적 빌드)
- 스타일: Tailwind CSS v4
- 수식: remark-math + rehype-katex (빌드 타임 렌더, 런타임 JS 불필요)
- 언어: 한국어

## 개발

```sh
npm install
npm run dev       # http://localhost:4321/milab
npm run build     # dist/ 로 정적 빌드
npm run preview   # 빌드 결과 미리보기
```

## 구조

```
src/
├── consts.ts              # 사이트 이름, 네비게이션, withBase() 링크 헬퍼
├── content.config.ts      # 콘텐츠 컬렉션 스키마 (news / members)
├── content/
│   ├── news/              # 메인 "최신 뉴스" — md 1개 = 항목 1개
│   └── members/           # 구성원 — md 1개 = 1명 (frontmatter)
├── data/                  # publications.bib / preprints.bib (Paper 페이지 소스)
├── lib/bibtex.ts          # .bib 파서
├── layouts/BaseLayout.astro
├── components/            # Nav, Footer, PageHeader, MemberCard, PaperList, Icon
└── pages/                 # index / members / alumni / project / paper / lecture
```

### 콘텐츠 수정 방법

- **뉴스 추가**: `src/content/news/2026-09-01-something.md` 생성, frontmatter에 `title`, `date`.
- **구성원 추가**: `src/content/members/NN-name.md` 생성.
  - `role`: professor / postdoc / phd / ms / undergrad
  - `title`: 입학 시기 등 (예: `"2026.09 ~"`)
  - `email`: 카드에 텍스트로 표시됨
  - `order`: 정렬 (작을수록 위)
  - `photo`: 사진을 `public/members/` 에 두고 `photo: "/members/파일명.jpg"` (jpg/png/webp, 정사각형 권장)
  - `alumni: true`: Members 에서 빠지고 **Alumni** 페이지(Ph.D./M.S. 구분)로 이동. role 은 phd/ms 유지.
  - professor 는 `education` / `workHistory` 배열(한 줄 = 한 항목)과 본문(소개글)이 크게 표시됨.
- **논문 추가/수정**: `src/data/publications.bib` (학회·워크샵) 또는 `src/data/preprints.bib` 에
  BibTeX 항목 추가. 저자는 `\underline{Jaehoon Oh}` 로 감싸면 굵게, `*` 는 동등 기여로 표시됨.
  venue 는 `booktitle`(publication) / `journal`(preprint, `arXiv:xxxx` 또는 URL) 사용.
  - **링크**: 항목에 `url = {https://...}` 필드를 추가하면 제목이 그 주소로 링크됨
    (모든 항목 공통). 없으면 preprint 는 arXiv/OpenReview 주소를 자동 인식.
- 페이지 본문(과제 소개 문구 등)은 해당 `src/pages/*.astro` 파일에서 직접 편집.
- 사이트 이름·이메일·연구실 정보는 `src/consts.ts` 의 `SITE` 객체.

## 배포 (GitHub Pages)

1. 이 저장소를 GitHub 에 push (`main` 브랜치).
2. 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.
3. `astro.config.mjs` 의 `site` 를 실제 값으로 수정:
   - project pages: `site: 'https://<GitHub사용자명>.github.io'`, `base: '/milab'` (현재 기본값)
   - 사용자/조직 pages 또는 커스텀 도메인: `base` 를 `'/'` 로.
4. `main` 에 push 하면 `.github/workflows/deploy.yml` 이 자동 빌드·배포.

## 학교/연구실 서버로 이전

정적 사이트라 이전이 단순하다. 서버에는 **Node 런타임이 필요 없다** (빌드는 CI 또는 로컬에서).

1. `astro.config.mjs` 수정: `site` 를 새 도메인(예: `https://milab.pusan.ac.kr`),
   루트 서빙이면 `base: '/'`.
2. 빌드: `npm ci && npm run build` → `dist/` 생성.
3. 웹서버(nginx 예시)에서 `dist/` 를 정적 서빙:
   ```nginx
   server {
     server_name milab.pusan.ac.kr;
     root /var/www/milab/dist;
     index index.html;
     location / { try_files $uri $uri/ $uri.html =404; }
   }
   ```
4. HTTPS: Let's Encrypt `certbot --nginx` (또는 학교 제공 인증서).
5. 배포 자동화(선택): GitHub Actions 에서
   `rsync -az --delete dist/ user@milab.pusan.ac.kr:/var/www/milab/dist/` (SSH 키 등록).

필요한 것 요약: **① 서브도메인/DNS (학교 전산팀), ② nginx/Apache, ③ HTTPS 인증서,
④ (자동배포 시) 서버 SSH 접근**.

## 강의 페이지 (Phase 2, 예정)

강의별로 **별도 git 저장소**를 만들어 `lectures/<강의>` 에 git submodule 로 연결하고,
이 저장소에서 한 번에 빌드·배포한다. `/lecture` 는 현재 placeholder.
상세 설계는 계획 문서 참고.
