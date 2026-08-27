// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
  // 수식: remark-math(파싱) + rehype-katex(빌드 타임 HTML 렌더). .md/.mdx 공통.
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
