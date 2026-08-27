import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

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
    role: z.enum(["professor", "postdoc", "phd", "ms", "undergrad", "alumni"]),
    title: z.string().optional(), // 예: "지도교수", "박사과정"
    email: z.string().optional(),
    photo: z.string().optional(), // /members/xxx.jpg (public 기준)
    homepage: z.string().optional(),
    // 외부 프로필 링크. url 로 아이콘 자동 판별(scholar/linkedin/github), 그 외는 일반 링크.
    links: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    interests: z.array(z.string()).default([]),
    // professor 상세용. 한 줄 = 한 항목 (예: "Ph.D. in CS, KAIST (2018–2022)")
    education: z.array(z.string()).default([]),
    workHistory: z.array(z.string()).default([]),
    order: z.number().default(99),
  }),
});

// 논문
const papers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/papers" }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(), // 예: "ICLR 2026"
    year: z.number(),
    type: z.enum(["conference", "journal", "workshop", "preprint"]).default("conference"),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
  }),
});

export const collections = { news, members, papers };
