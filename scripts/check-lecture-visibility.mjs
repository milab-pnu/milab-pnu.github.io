// 공개 필터가 직접 주소와 로컬 전체 보기에서 같은 기준을 적용하는지 확인한다.
import assert from "node:assert/strict";
import { parseWeeks, isNoteVisible } from "../src/lib/lecture-visibility.mjs";
const note = (week, course = "2026f-applied-data-science") => ({ id: `${course}/weeks/note`, data: { week } });
assert.equal(isNoteVisible(note(1), false, "1,2"), true);
assert.equal(isNoteVisible(note(2), false, "1,2"), true);
assert.equal(isNoteVisible(note(3), false, "1,2"), false);
assert.equal(isNoteVisible(note(3), true, "none"), true);
assert.equal(isNoteVisible(note(3), false, "all"), true);
assert.equal(isNoteVisible(note(1), false, "none"), false);
assert.equal(isNoteVisible(note(3, "2026f-advanced-deep-learning"), false, "none"), true);
for (const bad of ["", "1,x", "0", "1,", "1-3"]) assert.throws(() => parseWeeks(bad));
assert.deepEqual([...parseWeeks(" 1, 2,2 ")], [1,2]);
console.log("[check] 공개 주차 필터 검사 통과");
