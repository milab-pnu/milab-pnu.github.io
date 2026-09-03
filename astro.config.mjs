// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';

// 수식 파이프라인: remark-math(파싱) + rehype-katex(빌드 타임 렌더).
// output: 'mathml' — KaTeX 의 기본 HTML 출력은 인라인 style= 을 잔뜩 쓰는데
// 엄격 CSP(style-src 'self') 가 그걸 막아 수식이 깨진다. MathML 만 내보내면
// 인라인 스타일도 KaTeX CSS 도 필요 없고, 요즘 브라우저는 MathML 을 기본 렌더한다.
// .md/.mdx 공통 적용되도록 markdown.processor 로 넘긴다
// (Astro 가 remarkPlugins/rehypePlugins 직접 지정을 deprecate 했으므로 이 형태 유지).
// 커스텀 processor 는 Astro 기본 파이프라인을 대체하므로 GFM(표·각주)과
// heading id 를 여기서 명시적으로 넣어준다. heading id 는 강의 노트 좌측
// 목차(LectureNav)의 앵커 대상이다.
const processor = unified({
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [rehypeSlug, [rehypeKatex, { output: 'mathml' }]],
});

// https://astro.build/config
export default defineConfig({
  // GitHub Pages organization site: https://milab-pnu.github.io/ (루트 서빙, base 없음)
  // 커스텀 도메인/학교 서버로 옮기면 site 만 그 도메인으로 바꾼다.
  site: 'https://milab-pnu.github.io',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // 코드블록 하이라이팅 끔: Shiki 는 토큰마다 인라인 style= 로 색을 넣는데
    // 엄격 CSP(style-src 'self') 가 그걸 막아 색이 조용히 죽는다(KaTeX 와 같은 문제).
    // 무채색 사이트라 색 자체도 불필요 — 플레인 <pre><code> 로 두고 global.css 로 스타일.
    syntaxHighlight: false,
    processor,
  },
});
