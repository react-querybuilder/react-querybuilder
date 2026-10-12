import MiniSearch from 'minisearch';
import rawIndex from './generated/docs-index.json' with { type: 'json' };
import type { DocsIndex, DocsPage, DocsSection } from './types';

/** Build-time docs snapshot. */
export const docsIndex: DocsIndex = rawIndex;

const siteDocsPrefix = 'https://react-querybuilder.js.org/docs/';

/** Search hit. */
export interface DocsSearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

interface IndexedSection {
  id: number;
  title: string;
  heading: string;
  description: string;
  text: string;
}

let miniSearch: MiniSearch<IndexedSection> | undefined;

const getMiniSearch = (): MiniSearch<IndexedSection> => {
  if (!miniSearch) {
    miniSearch = new MiniSearch<IndexedSection>({
      fields: ['title', 'heading', 'description', 'text'],
      searchOptions: {
        boost: { title: 3, heading: 2, description: 1.5 },
        prefix: term => term.length > 3,
        fuzzy: term => (term.length > 5 ? 0.2 : false),
      },
    });
    miniSearch.addAll(
      docsIndex.sections.map((s, id) => ({
        id,
        title: docsIndex.pages[s.page].title,
        heading: s.heading,
        // Page description on preamble only (page-level match)
        description: s.heading ? '' : docsIndex.pages[s.page].description,
        text: s.text,
      }))
    );
  }
  return miniSearch;
};

export const sectionUrl = (s: DocsSection): string =>
  `${docsIndex.pages[s.page].url}${s.anchor ? `#${s.anchor}` : ''}`;

export const sectionTitle = (s: DocsSection): string =>
  [docsIndex.pages[s.page].title, s.heading].filter(Boolean).join(' › ');

/** ~`len`-char plain-ish excerpt around the first matched term. */
export const makeSnippet = (text: string, terms: string[], len = 240): string => {
  const flat = text.replace(/\s+/g, ' ').trim();
  const lower = flat.toLowerCase();
  const hit = Math.min(
    ...terms.map(t => lower.indexOf(t.toLowerCase())).filter(i => i >= 0),
    flat.length
  );
  const start = hit === flat.length ? 0 : Math.max(0, hit - len / 3);
  const excerpt = flat.slice(start, start + len);
  return `${start > 0 ? '…' : ''}${excerpt}${start + len < flat.length ? '…' : ''}`;
};

/** Full-text docs search (BM25+ via MiniSearch; title/heading boosted). */
export const searchDocs = (query: string, limit = 5): DocsSearchResult[] =>
  getMiniSearch()
    .search(query)
    .slice(0, limit)
    .map(r => {
      const s = docsIndex.sections[r.id];
      return {
        title: sectionTitle(s),
        url: sectionUrl(s),
        snippet: makeSnippet(s.text, r.terms),
        score: Math.round(r.score * 100) / 100,
      };
    });

/** Resolves a docs URL/slug (optionally with `#anchor`) to a page index + anchor. */
export const resolveDocRef = (ref: string): { page: DocsPage; anchor: string } | undefined => {
  const [pathPart, anchor = ''] = ref.trim().split('#');
  const slug = pathPart
    .replace(siteDocsPrefix, '')
    .replace(/^\/?(docs\/)?/, '')
    .replace(/(\.mdx?|\.html|\/)$/, '');
  const page = docsIndex.pages.find(p => p.slug === slug);
  return page ? { page, anchor } : undefined;
};

const pageSections = (page: DocsPage): DocsSection[] => {
  const pageIdx = docsIndex.pages.indexOf(page);
  return docsIndex.sections.filter(s => s.page === pageIdx);
};

/** Full page markdown (title, description, all sections). */
export const getPageMarkdown = (page: DocsPage): string =>
  [`# ${page.title}`, page.description && `> ${page.description}`]
    .concat(pageSections(page).map(s => s.text))
    .filter(Boolean)
    .join('\n\n');

/** One section's markdown (+ subsections if `##`), or `undefined` for unknown anchor. */
export const getSectionMarkdown = (page: DocsPage, anchor: string): string | undefined => {
  const sections = pageSections(page);
  const start = sections.findIndex(s => s.anchor === anchor);
  if (start < 0) return undefined;
  const isH2 = !sections[start].heading.includes(' › ');
  const end = isH2
    ? sections.findIndex((s, i) => i > start && !s.heading.includes(' › '))
    : start + 1;
  return sections
    .slice(start, end < 0 ? undefined : end)
    .map(s => s.text)
    .join('\n\n');
};

/** Page markdown, or one section's when `anchor` is non-empty. */
export const getDocMarkdown = (page: DocsPage, anchor = ''): string | undefined =>
  anchor ? getSectionMarkdown(page, anchor) : getPageMarkdown(page);
