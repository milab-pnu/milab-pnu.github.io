// 개발 서버에서는 모두 표시하고, 배포에서는 저장된 공개 주차만 표시한다.
export function parseWeeks(value) {
  const raw = (value ?? "all").trim().toLowerCase();
  if (raw === "all") return null;
  if (raw === "none") return new Set();
  if (!/^[1-9]\d*(\s*,\s*[1-9]\d*)*$/.test(raw))
    throw new Error("공개 주차는 all, none 또는 1,2 같은 쉼표 목록이어야 합니다.");
  return new Set(raw.split(",").map(Number));
}
export function isNoteVisible(note, dev, raw) {
  if (dev || note.id.split("/")[0] !== "2026f-applied-data-science") return true;
  const weeks = parseWeeks(raw);
  return weeks === null || weeks.has(note.data.week);
}
