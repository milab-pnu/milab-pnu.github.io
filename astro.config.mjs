// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// 수식 파이프라인: remark-math(파싱) + rehype-katex(빌드 타임 HTML 렌더).
// .md/.mdx 공통 적용되도록 markdown.processor 로 넘긴다
// (Astro 가 remarkPlugins/rehypePlugins 직접 지정을 deprecate 했으므로 이 형태 유지).
const processor = unified({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
});

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://jaehoonoh-pnu.github.io/milab
  // 커스텀 도메인/학교 서버로 옮기면 site 를 그 도메인으로, base 는 '/' 로.
  site: 'https://jaehoonoh-pnu.github.io',
  base: '/milab',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor,
  },
});
