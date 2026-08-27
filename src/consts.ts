// 사이트 전역 설정 & 네비게이션
export const SITE = {
  name: "MI Lab",
  fullName: "Multimodal Intelligence Lab",
  org: "Pusan National University",
  orgKo: "부산대학교",
  description:
    "부산대학교 Multimodal Intelligence Lab — 멀티모달 인공지능 연구실",
  email: "jaehoon.oh@pusan.ac.kr",
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: "HOME", href: "/" },
  { label: "MEMBERS", href: "/members" },
  { label: "RESEARCH", href: "/research" },
  { label: "PROJECT", href: "/project" },
  { label: "PUBLICATION", href: "/publication" },
  { label: "LECTURE", href: "/lecture" },
  { label: "GALLERY", href: "/gallery" },
];

/**
 * base 경로(예: "/milab-pnu")를 앞에 붙여 내부 링크를 만든다.
 * GitHub Pages / 커스텀 도메인 / 학교 서버 어디로 옮겨도 이 함수만 통하면 됨.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  if (path === "/") return `${base}/`;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** 현재 경로가 nav 항목과 일치하는지(활성 표시용) */
export function isActive(currentPath: string, href: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const cur = currentPath.replace(base, "").replace(/\/+$/, "") || "/";
  if (href === "/") return cur === "/";
  return cur === href || cur.startsWith(href + "/");
}
