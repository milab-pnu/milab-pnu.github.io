// 사이트 전역 설정 & 네비게이션
export const SITE = {
  name: "MI Lab",
  fullName: "Multimodal Intelligence Lab",
  fullNameKo: "멀티모달 지능 연구실",
  org: "Pusan National University",
  orgKo: "부산대학교",
  dept: "Graduate School of Data Science",
  deptKo: "데이터사이언스전문대학원",
  description:
    "부산대학교 데이터사이언스전문대학원 멀티모달 지능 연구실 (Multimodal Intelligence Lab)",
  email: "jaehoon.oh@pusan.ac.kr",
  phone: "051-510-7293",
  address: "부산광역시 금정구 부산대학로63번길 2, 제12공학관 326호",
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: "HOME", href: "/" },
  { label: "MEMBERS", href: "/members" },
  { label: "ALUMNI", href: "/alumni" },
  { label: "PROJECT", href: "/project" },
  { label: "PAPER", href: "/paper" },
  { label: "LECTURE", href: "/lecture" },
];

/**
 * base 경로(예: "/milab")를 앞에 붙여 내부 링크를 만든다.
 * GitHub Pages / 커스텀 도메인 / 학교 서버 어디로 옮겨도 이 함수만 통하면 됨.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  if (path === "/") return `${base}/`;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** 외부 프로필 링크 url 로 아이콘 종류 판별 (Icon.astro 의 name) */
export function iconFor(url: string): "scholar" | "linkedin" | "github" | "link" {
  if (/scholar\.google\./.test(url)) return "scholar";
  if (/linkedin\.com/.test(url)) return "linkedin";
  if (/github\.com/.test(url)) return "github";
  return "link";
}

/** 현재 경로가 nav 항목과 일치하는지(활성 표시용) */
export function isActive(currentPath: string, href: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const cur = currentPath.replace(base, "").replace(/\/+$/, "") || "/";
  if (href === "/") return cur === "/";
  return cur === href || cur.startsWith(href + "/");
}
