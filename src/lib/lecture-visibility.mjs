// 개발 서버에서는 모두 표시하고, 배포에서는 저장된 공개 주차만 표시한다.
export function parseWeeks(value) {
  const raw = (value ?? "all").trim().toLowerCase();
  if (raw === "all") return null;
  if (raw === "none") return new Set();
  if (!/^[1-9]\d*(\s*,\s*[1-9]\d*)*$/.test(raw))
    throw new Error("공개 주차는 all, none 또는 1,2 같은 쉼표 목록이어야 합니다.");
  return new Set(raw.split(",").map(Number));
}
export function variableName(course) {
  return `LECTURE_${course.replaceAll("-", "_").toUpperCase()}_PUBLIC_WEEKS`;
}
export function isNoteVisible(note, dev, rawVariables) {
  if (dev) return true;
  const variables = JSON.parse(rawVariables || "{}");
  if (!variables || Array.isArray(variables) || typeof variables !== "object")
    throw new Error("공개 주차 설정은 객체여야 합니다.");
  const course = note.id.split("/")[0];
  // 기존 데이터사이언스 설정은 새 과목별 설정이 없을 때만 사용한다.
  const raw = variables[variableName(course)] ??
    (course === "2026f-applied-data-science" ? variables.ADS_PUBLIC_WEEKS : undefined);
  const weeks = parseWeeks(raw);
  return weeks === null || weeks.has(note.data.week);
}
