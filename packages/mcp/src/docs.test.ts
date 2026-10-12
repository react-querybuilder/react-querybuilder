import {
  docsIndex,
  getDocMarkdown,
  makeSnippet,
  resolveDocRef,
  searchDocs,
  sectionTitle,
  sectionUrl,
} from './docs';

const slugOf = (url: string) => url.replace('https://react-querybuilder.js.org/docs/', '');

describe('docsIndex', () => {
  test('has pages, sections, and types', () => {
    expect(docsIndex.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(docsIndex.pages.length).toBeGreaterThan(40);
    expect(docsIndex.sections.length).toBeGreaterThan(docsIndex.pages.length);
    expect(Object.keys(docsIndex.types)).toContain('RuleGroupType');
    expect(docsIndex.types.RuleGroupType).toContain('export interface RuleGroupType');
  });

  test('excludes API redirects and changelog', () => {
    const slugs = docsIndex.pages.map(p => p.slug);
    expect(slugs).not.toContain('changelog');
    expect(slugs.some(s => s.startsWith('api/'))).toBe(false);
    expect(slugs).toContain('utils/export');
  });

  test('section text has no MDX artifacts outside code fences', () => {
    let inFence = false;
    const bad: string[] = [];
    for (const line of docsIndex.sections.flatMap(s => s.text.split('\n'))) {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) continue;
      if (/^(import|export) |^:::|^%import|\{\/\*|^\s*<[A-Z]/.test(line)) bad.push(line);
    }
    expect(bad).toEqual([]);
  });
});

describe('searchDocs', () => {
  // [query, expected slug prefix within top 3]
  const fixtures: [string, string][] = [
    ['parameterized sql', 'utils/export'],
    ['drag and drop', 'dnd'],
    ['parse mongodb', 'utils/import'],
    ['jsonlogic', 'utils/export'],
    ['independent combinators', 'components/querybuilder'],
    ['custom value editor', 'components/valueeditor'],
    ['validation', 'utils/validation'],
    ['natural language', 'utils/export'],
    ['json schema', 'utils/json-schema'],
    ['mantine', 'compat'],
    ['typescript', 'typescript'],
    ['controlElements', 'components/querybuilder'],
    ['query manager', 'utils/query-management'],
    ['elasticsearch', 'utils/export'],
    ['cel', 'utils/import'],
    ['option groups', 'tips/option-lists'],
    ['arithmetic expressions', 'expr'],
    ['rules engine', 'rules-engine'],
    ['css classnames', 'styling/classnames'],
    ['undo redo', 'tips/undo-redo'],
    ['parseNumbers', 'utils/misc'],
    ['agent skill', 'ai'],
    ['subquery match modes', 'tips/subqueries'],
    ['datetime', 'datetime'],
  ];

  test.each(fixtures)('"%s" → %s in top 3', (query, expected) => {
    const slugs = searchDocs(query, 3).map(r => slugOf(r.url));
    expect(slugs.some(s => s === expected || s.startsWith(`${expected}#`))).toBe(true);
  });

  test('result shape and limit', () => {
    const results = searchDocs('formatQuery', 2);
    expect(results).toHaveLength(2);
    for (const r of results) {
      expect(r.url.startsWith('https://react-querybuilder.js.org/docs/')).toBe(true);
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.snippet.length).toBeGreaterThan(0);
      expect(typeof r.score).toBe('number');
    }
  });

  test('no results', () => {
    expect(searchDocs('zzqxjv')).toEqual([]);
  });
});

describe('makeSnippet', () => {
  test('centers on first matched term', () => {
    const text = `${'a '.repeat(200)}needle ${'b '.repeat(200)}`;
    const s = makeSnippet(text, ['NEEDLE'], 60);
    expect(s.startsWith('…')).toBe(true);
    expect(s.endsWith('…')).toBe(true);
    expect(s).toContain('needle');
  });

  test('starts at beginning when no term matches; no ellipses for short text', () => {
    expect(makeSnippet('short  text', ['zzz'])).toBe('short text');
    expect(makeSnippet('needle here', ['needle'])).toBe('needle here');
  });
});

describe('resolveDocRef', () => {
  test.each([
    'utils/export',
    '/docs/utils/export',
    'docs/utils/export/',
    'https://react-querybuilder.js.org/docs/utils/export',
    'utils/export.md',
    'utils/export.mdx',
    'utils/export.html',
  ])('%s', ref => {
    expect(resolveDocRef(ref)?.page.slug).toBe('utils/export');
  });

  test('anchor', () => {
    expect(resolveDocRef('utils/export#sql')?.anchor).toBe('sql');
  });

  test('unknown', () => {
    expect(resolveDocRef('nope/nope')).toBeUndefined();
  });
});

describe('getDocMarkdown', () => {
  const page = resolveDocRef('utils/export')!.page;

  test('full page', () => {
    const md = getDocMarkdown(page)!;
    expect(md.startsWith('# Export\n\n> ')).toBe(true);
    expect(md).toContain('## Basic usage');
    expect(md).toContain('### SQL');
  });

  test('page w/o description', () => {
    const p = { ...docsIndex.pages[0], description: '' };
    docsIndex.pages.push(p);
    try {
      expect(getDocMarkdown(p)).toBe(`# ${p.title}`);
    } finally {
      docsIndex.pages.pop();
    }
  });

  test('h3 section only', () => {
    const md = getDocMarkdown(page, 'sql')!;
    expect(md.startsWith('### SQL')).toBe(true);
    expect(md).not.toContain('### MongoDB');
  });

  test('h2 section includes subsections up to next h2', () => {
    const md = getDocMarkdown(page, 'basic-usage')!;
    expect(md.startsWith('## Basic usage')).toBe(true);
    expect(md).toContain('### SQL');
    expect(md).not.toContain('## Configuration');
  });

  test('last h2 section runs to end of page', () => {
    const sections = docsIndex.sections.filter(s => docsIndex.pages[s.page] === page);
    const lastH2 = sections.findLast(s => s.heading && !s.heading.includes(' › '))!;
    expect(getDocMarkdown(page, lastH2.anchor)!.endsWith(sections.at(-1)!.text)).toBe(true);
  });

  test('unknown anchor', () => {
    expect(getDocMarkdown(page, 'nope')).toBeUndefined();
  });
});

describe('section helpers', () => {
  test('preamble section has no anchor', () => {
    const s = docsIndex.sections.find(x => !x.heading)!;
    expect(sectionUrl(s)).toBe(docsIndex.pages[s.page].url);
    expect(sectionTitle(s)).toBe(docsIndex.pages[s.page].title);
  });
});
