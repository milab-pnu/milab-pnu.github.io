import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Node 22.12에서도 실행할 수 있도록 프로젝트의 TypeScript 컴파일러를 사용한다.
const source = readFileSync(new URL("../src/lib/bibtex.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { bibToPapers } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const valid = '@article{sample, title={A {Nested} Title}, author={Oh, Jaehoon and Kim, Min*}, year={2026}}';
const [paper] = bibToPapers(valid);
assert.equal(paper.title, "A Nested Title");
assert.equal(paper.authors[0].name, "Jaehoon Oh");
assert.equal(paper.authors[1].equal, true);
assert.throws(() => bibToPapers(valid.slice(0, -1)), /중괄호/);
assert.throws(() => bibToPapers('@article{sample, title="Unclosed}'), /따옴표/);
assert.throws(() => bibToPapers('@article{sample title={No comma}}'));
for (const name of ["publications", "preprints"]) {
  const papers = bibToPapers(readFileSync(new URL(`../src/data/${name}.bib`, import.meta.url), "utf8"));
  assert.ok(papers.length > 0);
  assert.ok(papers.every((p) => p.title && p.authors.length && p.year));
}
console.log("[check] BibTeX 정상 입력 및 구문 오류 검사 통과");
