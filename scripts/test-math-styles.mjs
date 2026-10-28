import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { rehypeMathStyles } from "../src/lib/math-styles.mjs";

test("KaTeX output and stylesheet use the same package version", () => {
  const root = createRequire(import.meta.url);
  const rehype = createRequire(root.resolve("rehype-katex"));
  assert.equal(root("katex/package.json").version, rehype("katex/package.json").version);
});

test("only KaTeX inline layout styles become external classes", () => {
  const ordinary = { type: "element", tagName: "span", properties: { style: "color:red" }, children: [] };
  const nested = { type: "element", tagName: "span", properties: { className: ["vlist"], style: "height:1.2em;" }, children: [] };
  const tree = { type: "root", children: [ordinary, {
    type: "element", tagName: "span", properties: { className: ["katex"] }, children: [nested],
  }] };
  rehypeMathStyles()(tree);
  assert.equal(ordinary.properties.style, "color:red");
  assert.equal(nested.properties.style, undefined);
  assert.match(nested.properties.className[1], /^km-[0-9a-f]{20}$/);
  assert.match(tree.children[0].properties.href, /^\/_math\/[0-9a-f]{20}\.css$/);
});
