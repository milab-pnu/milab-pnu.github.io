import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// KaTeX의 인라인 배치 스타일을 내용 기반 클래스와 문서별 CSS로 바꾸어
// 기존 style-src 'self' CSP를 유지한다.
const stylesheets = new Map();
const hash = (value) => createHash("sha256").update(value).digest("hex").slice(0, 20);

export function rehypeMathStyles() {
  return (tree) => {
    const rules = new Map();
    function visit(node, insideKatex = false) {
      if (!node || typeof node !== "object") return;
      const properties = node.properties || {};
      const classes = Array.isArray(properties.className) ? properties.className : [];
      insideKatex ||= classes.includes("katex");
      if (insideKatex && typeof properties.style === "string") {
        const style = properties.style;
        const name = `km-${hash(style)}`;
        rules.set(name, style);
        properties.className = [...classes, name];
        delete properties.style;
      }
      for (const child of node.children || []) visit(child, insideKatex);
    }
    visit(tree);
    if (!rules.size) return;
    // 원래 인라인 스타일이 KaTeX의 중첩 클래스 규칙보다 우선하던 순서를 유지한다.
    const css = [...rules].map(([name, style]) =>
      `.katex.katex.katex.${name},.katex.katex.katex .${name}{${style}}`
    ).join("\n");
    const id = hash(css);
    stylesheets.set(id, css);
    tree.children.unshift({
      type: "element", tagName: "link",
      properties: { rel: ["stylesheet"], href: `/_math/${id}.css` }, children: [],
    });
  };
}

// 개발 서버는 CSS를 메모리에서 제공하고 배포 빌드는 HTML과 함께 기록한다.
export function mathStyles() {
  return {
    name: "math-styles",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => updateConfig({ vite: { plugins: [{
        name: "math-styles-dev",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const match = req.url?.match(/^\/_math\/([0-9a-f]{20})\.css(?:\?|$)/);
            if (!match) return next();
            const css = stylesheets.get(match[1]);
            if (css === undefined) return next();
            res.setHeader("Content-Type", "text/css; charset=utf-8");
            res.end(css);
          });
        },
      }] } }),
      "astro:build:done": async ({ dir }) => {
        const target = fileURLToPath(new URL("_math/", dir));
        await mkdir(target, { recursive: true });
        await Promise.all([...stylesheets].map(([id, css]) => writeFile(`${target}/${id}.css`, css)));
      },
    },
  };
}
