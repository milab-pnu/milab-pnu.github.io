import { getCollection, type CollectionEntry } from "astro:content";

export const NEWS_PAGE_SIZE = 10;

/** 날짜 내림차순, 같은 날짜는 order 내림차순 */
export async function getSortedNews(): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news")).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime() || b.data.order - a.data.order,
  );
}

export function newsTotalPages(count: number): number {
  return Math.max(1, Math.ceil(count / NEWS_PAGE_SIZE));
}
