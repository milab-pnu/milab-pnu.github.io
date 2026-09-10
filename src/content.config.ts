import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import lectureConfig from "../lectures.config.json";

// 로컬 편집 폴더를 직접 읽는다. 배포는 동기화된 공개 저장소를 읽는다.
function lectureLoader(suffix: string) {
  if (!import.meta.env.DEV) return glob({ pattern: `*/${suffix}`, base: "./lectures" });
  return glob({
    pattern: lectureConfig.map((c) => `${c.localPath}/${suffix}`),
    base: "../lectures",
    generateId: ({ entry }) => {
      const path = entry.replaceAll("\\", "/");
      const course = lectureConfig.find((c) => path.startsWith(`${c.localPath}/`));
      if (!course) throw new Error(`로컬 강의 경로를 확인하세요: ${path}`);
      return `${course.slug}/${path.slice(course.localPath.length + 1)}`.replace(/\.mdx?$/, "");
    },
  });
}

// 메인 사이트 "최신 뉴스"
const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // 같은 날짜 내 정렬용 (클수록 위)
    order: z.number().default(0),
  }),
});

// 구성원
const members = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/members" }),
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    role: z.enum(["professor", "postdoc", "phd", "ms", "undergrad"]),
    title: z.string().optional(), // 입학 시기 등. 예: "2026.09 ~"
    // true 면 Members 에서 빠지고 Alumni 페이지에 표시됨 (role 은 phd/ms 유지)
    alumni: z.boolean().default(false),
    email: z.string().optional(),
    photo: z.string().optional(), // /members/xxx.jpg (public 기준)
    homepage: z.string().optional(),
    // 외부 프로필 링크. url 로 아이콘 자동 판별(scholar/linkedin/github), 그 외는 일반 링크.
    links: z
      .array(z.object({ label: z.string(), url: z.url() }))
      .default([]),
    // professor 상세용. 한 줄 = 한 항목 (예: "Ph.D. in CS, KAIST (2018–2022)")
    education: z.array(z.string()).default([]),
    workHistory: z.array(z.string()).default([]),
    order: z.number().default(99),
  }),
});

// 강의 — 강의마다 별도 repo (콘텐츠 전용). scripts/sync-lectures.mjs 가
// lectures.config.json 에 적힌 repo 들을 lectures/<slug>/ 로 clone 해두면 여기서 스캔.
// lectures/ 가 비어 있어도(등록된 강의 0개) 빌드는 정상.
const courses = defineCollection({
  loader: lectureLoader("course.md"),
  schema: z.object({
    title: z.string(), // 고급딥러닝
    titleEn: z.string().optional(), // Advanced Deep Learning
    term: z.string(), // "2026 Fall" — 표시용
    semester: z.string(), // "2026-02" — 정렬·그룹핑용 (YYYY-SS)
    instructor: z.string().optional(),
    schedule: z.string().optional(), // "월/수 15:00–16:15"
    location: z.string().optional(),
    credits: z.number().optional(),
    summary: z.string().optional(), // <meta description> 용. 화면엔 표시 안 함
    // 강의 계획 표. 강의자료(웹 노트)는 weeks/*.md 가 각자 week 번호로 연결됨.
    weeks: z
      .array(
        z.object({
          n: z.number(),
          topic: z.string(),
          date: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

// 주차별 강의 노트 — 각 강의 repo 의 weeks/*.md(x). 빌드되어 /lecture/<slug>/<noteSlug> 페이지가 됨.
// frontmatter 의 week 번호로 course.md 의 Schedule 표 행에 연결된다.
const lectureNotes = defineCollection({
  loader: lectureLoader("weeks/*.{md,mdx}"),
  schema: z.object({
    title: z.string(),
    week: z.number(),
    order: z.number().default(0), // 같은 주차에 노트 여러 개일 때 정렬
  }),
});

// 논문은 content collection 대신 src/data/*.bib 를 빌드 타임에 파싱 (src/lib/bibtex.ts)

export const collections = { news, members, courses, lectureNotes };
