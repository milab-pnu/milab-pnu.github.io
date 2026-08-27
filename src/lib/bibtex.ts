// 아주 작은 BibTeX 파서 — 이 사이트가 쓰는 단순한 .bib 형식만 지원.
// (src/data/*.bib 를 빌드 타임에 ?raw 로 읽어서 사용)

export interface BibEntry {
  type: string;
  key: string;
  fields: Record<string, string>;
}

export interface Author {
  name: string;
  me: boolean; // \underline{...} 로 표시된 저자 (연구실 PI)
  equal: boolean; // * (동등 기여)
}

export interface Paper {
  key: string;
  title: string;
  authors: Author[];
  venue: string;
  year: number;
  url?: string;
  hasEqual: boolean;
}

// 연구실 PI 이름 (\underline 없이 들어오는 경우 대비)
const ME = /jaehoon\s+oh/i;

export function parseBibtex(src: string): BibEntry[] {
  // % 주석 줄 제거
  const text = src
    .split("\n")
    .filter((l) => !/^\s*%/.test(l))
    .join("\n");

  const entries: BibEntry[] = [];
  let i = 0;

  while (i < text.length) {
    const at = text.indexOf("@", i);
    if (at === -1) break;
    const open = text.indexOf("{", at);
    if (open === -1) break;

    const type = text.slice(at + 1, open).trim().toLowerCase();

    // 짝 맞는 닫는 중괄호 찾기
    let depth = 0;
    let j = open;
    for (; j < text.length; j++) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}" && --depth === 0) break;
    }

    const body = text.slice(open + 1, j);
    i = j + 1;

    const firstComma = body.indexOf(",");
    if (firstComma === -1) continue;
    const key = body.slice(0, firstComma).trim();
    const rest = body.slice(firstComma + 1);

    const fields: Record<string, string> = {};
    let k = 0;
    while (k < rest.length) {
      while (k < rest.length && /[\s,]/.test(rest[k])) k++;
      const eq = rest.indexOf("=", k);
      if (eq === -1) break;
      const name = rest.slice(k, eq).trim().toLowerCase();
      let m = eq + 1;
      while (m < rest.length && /\s/.test(rest[m])) m++;

      let value = "";
      if (rest[m] === "{") {
        let d = 0;
        let p = m;
        for (; p < rest.length; p++) {
          if (rest[p] === "{") d++;
          else if (rest[p] === "}" && --d === 0) break;
        }
        value = rest.slice(m + 1, p);
        k = p + 1;
      } else if (rest[m] === '"') {
        let p = m + 1;
        while (p < rest.length && rest[p] !== '"') p++;
        value = rest.slice(m + 1, p);
        k = p + 1;
      } else {
        let p = m;
        while (p < rest.length && rest[p] !== "," && rest[p] !== "\n") p++;
        value = rest.slice(m, p);
        k = p + 1;
      }

      if (name) fields[name] = value.replace(/\s+/g, " ").trim();
    }

    entries.push({ type, key, fields });
  }

  return entries;
}

function cleanTitle(raw: string): string {
  return raw.replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}

function parseAuthors(raw: string): Author[] {
  return raw
    .split(/\s+and\s+/)
    .map((tok) => tok.trim())
    .filter(Boolean)
    .map((tok) => {
      const me = /\\underline\s*\{/.test(tok) || ME.test(tok.replace(/[,*]/g, " "));
      let t = tok.replace(/\\underline\s*\{/g, "").replace(/\}/g, "");
      const equal = t.includes("*");
      t = t.replace(/\*/g, "").trim();

      // "Last, First" → "First Last"
      let name: string;
      if (t.includes(",")) {
        const [last, first] = t.split(",");
        name = `${first.trim()} ${last.trim()}`.trim();
      } else {
        name = t;
      }
      name = name.replace(/\s+/g, " ").trim();

      return { name, me, equal };
    });
}

function parseVenue(entry: BibEntry): { venue: string; url?: string } {
  const { fields } = entry;

  if (fields.booktitle) return { venue: fields.booktitle };

  const journal = fields.journal ?? "";

  // arXiv preprint arXiv:XXXX.XXXXX
  const arxiv = journal.match(/arxiv:\s*([\d.]+)/i);
  if (arxiv) {
    return { venue: `arXiv:${arxiv[1]}`, url: `https://arxiv.org/abs/${arxiv[1]}` };
  }

  // openreview 등 URL
  if (/^https?:\/\//.test(journal)) {
    const host = /openreview\.net/.test(journal) ? "OpenReview" : "Link";
    return { venue: host, url: journal };
  }

  return { venue: journal };
}

export function bibToPapers(src: string): Paper[] {
  const papers = parseBibtex(src).map((e) => {
    const authors = parseAuthors(e.fields.author ?? "");
    const { venue, url } = parseVenue(e);
    return {
      key: e.key,
      title: cleanTitle(e.fields.title ?? ""),
      authors,
      venue,
      year: Number(e.fields.year) || 0,
      url,
      hasEqual: authors.some((a) => a.equal),
    } satisfies Paper;
  });

  // 연도 내림차순 (동일 연도는 .bib 파일 순서 유지 — 안정 정렬)
  return papers.sort((a, b) => b.year - a.year);
}
