// 과목 간 설정 독립성과 이전 설정 호환성을 검사한다.
import assert from "node:assert/strict";
import { parseWeeks, isNoteVisible, variableName } from "../src/lib/lecture-visibility.mjs";
const ads = "2026f-applied-data-science", adl = "2026f-advanced-deep-learning";
const note = (course, week) => ({id:`${course}/weeks/note`, data:{week}});
const vars = JSON.stringify({[variableName(ads)]:"1,2", [variableName(adl)]:"1,2,3"});
assert.equal(isNoteVisible(note(ads,3), false, vars), false);
assert.equal(isNoteVisible(note(adl,3), false, vars), true);
assert.equal(isNoteVisible(note(adl,4), false, vars), false);
assert.equal(isNoteVisible(note(ads,3), true, vars), true);
assert.equal(isNoteVisible(note(adl,4), true, vars), true);
assert.equal(isNoteVisible(note(ads,3), false, '{"ADS_PUBLIC_WEEKS":"1,2"}'), false);
assert.equal(isNoteVisible(note(adl,3), false, '{"ADS_PUBLIC_WEEKS":"none"}'), true);
assert.equal(isNoteVisible(note(ads,3), false, JSON.stringify({ADS_PUBLIC_WEEKS:"none",[variableName(ads)]:"all"})), true);
assert.equal(isNoteVisible(note(ads,1), false, JSON.stringify({[variableName(ads)]:"none"})), false);
assert.equal(isNoteVisible(note(ads,1), false, undefined), true);
for (const bad of ["", "1,x", "0", "1,", "1-3"]) assert.throws(() => parseWeeks(bad));
assert.throws(() => isNoteVisible(note(ads,1), false, "[]"));
console.log("[check] 과목별 공개 설정 검사 통과");
