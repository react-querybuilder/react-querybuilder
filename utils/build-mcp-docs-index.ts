// oxlint-disable no-await-in-loop

/**
 * Builds `packages/mcp/src/generated/docs-index.json` for `@react-querybuilder/mcp`:
 * cleaned docs markdown (from `website/content/docs/next`), chunked by `##` heading, plus key type
 * declarations (from source). Usage: `bun utils/build-mcp-docs-index.ts`
 */
import path from 'node:path';
import { version } from '../lerna.json' with { type: 'json' };
import type { DocsIndex, DocsPage, DocsSection } from '../packages/mcp/src/types';

const root = path.join(import.meta.dirname, '..');
const docsDir = path.join(root, 'website/content/docs/next');
const outFile = path.join(root, 'packages/mcp/src/generated/docs-index.json');
const siteUrl = 'https://react-querybuilder.js.org';

// Relative to `website/content/docs/next`
const excludedDocs = [/^api\//, /^changelog\.mdx?$/, /(^|\/)_/];

/** Type declarations exposed as `rqb://types/{name}` resources. */
export const typeNames = [
  'RuleType',
  'RuleGroupType',
  'RuleGroupTypeIC',
  'RuleGroupTypeAny',
  'BaseFullField',
  'Field',
  'FullField',
  'ValueSource',
  'ValueEditorType',
  'InputType',
  'ParseNumbersPropConfig',
  'ValidationResult',
  'ExportFormat',
  'FormatQueryOptions',
  'ParserCommonOptions',
  'GetQueryJsonSchemaOptions',
  'DiagnosticEntry',
  'DiagnosticsResult',
  'QueryBuilderContextProps',
  'QueryBuilderProps',
] as const;

const typeSourceGlobs: [string, string][] = [
  ['packages/core/src/types', '*.ts'],
  ['packages/core/src/utils', 'getQueryJsonSchema.ts'],
  ['packages/react-querybuilder/src/types', '*.ts'],
];

// #region MDX cleanup

/** github-slugger-compatible anchor (Docusaurus default). */
export const slugify = (heading: string): string =>
  heading
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');

/** Heading markdown → plain text (strip code ticks, links, emphasis). */
export const headingText = (md: string): string =>
  md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/<[^>]+>/g, '')
    // Drop stray angle brackets (nested/malformed tags; CodeQL js/incomplete-multi-character-sanitization)
    .replace(/[<>]/g, '')
    .trim();

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** `%importcode` (mirrors `website/src/plugins/remark-plugin-import.ts`). */
const readCodeImport = async (spec: string): Promise<string> => {
  const [file, hash = ''] = spec.trim().split('#');
  const text = await Bun.file(path.join(root, file)).text();
  const lines = text.split('\n');
  const lang = path.extname(file).slice(1);
  const fenced = (code: string) => `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``;
  const lineNums = /^l(\d+)(-(l(\d+))?)?$/i.exec(hash);
  const region = /^region=(.+)$/i.exec(hash)?.[1];
  const block = /^blockname=(.+)$/i.exec(hash)?.[1];
  let start = 0;
  let end = lines.length;
  if (lineNums) {
    start = Number(lineNums[1]) - 1;
    end = lineNums[4] ? Number(lineNums[4]) : lineNums[2] ? lines.length : start + 1;
  } else if (region) {
    const r = lines.findIndex(l => l.trim() === `// #region ${region}`);
    start = r < 0 ? -1 : r + 1;
    end = lines.findIndex((l, i) => i >= start && /^\s*\/\/ #endregion/.test(l));
  } else if (block) {
    const re = new RegExp(
      `^(export )?(const|let|type|interface) ${escapeRegExp(block)}(<.*)?( extends .*)?( \\{)?$`
    );
    start = lines.findIndex(l => re.test(l));
    end = lines.findIndex((l, i) => i >= start && l.startsWith('}')) + 1;
  }
  if (start < 0 || end <= 0) throw new Error(`Code import "${spec}" not found`);
  return fenced(lines.slice(start, end).join('\n'));
};

/** Index of the char ending a JSX opening tag starting at `s[0] === '<'`, or -1. */
const findTagEnd = (s: string): number => {
  let braces = 0;
  let quote = '';
  for (let i = 1; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'" || c === '`') {
      quote = c;
    } else if (c === '{') {
      braces++;
    } else if (c === '}') {
      braces--;
    } else if (c === '>' && braces === 0) {
      return i;
    }
  }
  return -1;
};

/**
 * Converts Docusaurus MDX to plain markdown: drops frontmatter, imports/exports, JSX tags
 * (keeps children), MDX comments, admonition fences; inlines `%importmd`/`%importcode`.
 */
export const cleanMdx = async (src: string, filePath: string): Promise<string> => {
  const body = src.replace(/^---\n[\s\S]*?\n---\n/, '');
  const out: string[] = [];
  let fence = '';
  let jsxBuf = '';

  for (const line of body.split('\n')) {
    if (fence) {
      out.push(line);
      if (line.trimStart().startsWith(fence)) fence = '';
      continue;
    }
    if (jsxBuf) {
      jsxBuf += `\n${line}`;
      if (findTagEnd(jsxBuf) >= 0) jsxBuf = '';
      continue;
    }
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) {
      fence = fenceMatch[1];
      out.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (/^(import|export) /.test(line)) continue;
    if (/^\{\/\*.*\*\/\}$/.test(trimmed)) continue;
    const md = /^%importmd\s+(.+)$/.exec(trimmed);
    if (md) {
      const target = md[1].replaceAll('\\', '');
      const p = target.startsWith('/')
        ? path.join(root, target)
        : path.resolve(path.dirname(filePath), target);
      out.push(await cleanMdx(await Bun.file(p).text(), p));
      continue;
    }
    const code = /^%importcode\s+(.+)$/.exec(trimmed);
    if (code) {
      out.push(await readCodeImport(code[1]));
      continue;
    }
    // Admonitions: `:::tip Title` (or legacy `:::tip[Title]`) → bold label; closing `:::` dropped
    const adm = /^:::(\w+)(?:\[(.*)\])?\s*(.*)$/.exec(trimmed);
    if (adm) {
      const label = adm[2] || adm[3] || adm[1].charAt(0).toUpperCase() + adm[1].slice(1);
      out.push(`**${label}:**`);
      continue;
    }
    if (trimmed === ':::') continue;
    // JSX component lines (capitalized; plain HTML is left as-is)
    if (/^<\/?[A-Z][\w.]*/.test(trimmed)) {
      const end = findTagEnd(trimmed);
      if (end < 0) {
        jsxBuf = trimmed;
        continue;
      }
      const rest = trimmed.slice(end + 1).trim();
      // Inline closing tag on same line (e.g. `<summary>Text</summary>`): keep text
      const inner = rest.replace(/<\/[\w.]+>\s*$/, '').trim();
      if (inner) out.push(inner);
      continue;
    }
    out.push(line);
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// #endregion

const parseFrontmatter = (src: string): Record<string, string> => {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(src)?.[1] ?? '';
  return Object.fromEntries(
    fm
      .split('\n')
      .map(l => /^(\w+):\s*(.*)$/.exec(l))
      .filter(m => m !== null)
      .map(m => [m[1], m[2].replace(/^(['"])(.*)\1$/, '$2')])
  );
};

/**
 * Splits cleaned markdown into a preamble + one section per `##`/`###` heading. `heading` is
 * the heading path (`H2 › H3`); anchors follow Docusaurus (github-slugger, page-wide dedupe).
 */
export const splitSections = (md: string): { heading: string; anchor: string; text: string }[] => {
  const sections: { heading: string; anchor: string; text: string }[] = [];
  const used = new Map<string, number>();
  let h2 = '';
  let cur = { heading: '', anchor: '', lines: [] as string[] };
  let fence = '';
  for (const line of md.split('\n')) {
    const fm = /^\s*(```+|~~~+)/.exec(line);
    const hm = /^(#{2,6}) (.+)$/.exec(line);
    if (fence) {
      if (line.trimStart().startsWith(fence)) fence = '';
    } else if (fm) {
      fence = fm[1];
    } else if (hm) {
      const heading = headingText(hm[2]);
      const base = slugify(heading);
      const n = used.get(base) ?? 0;
      used.set(base, n + 1);
      const anchor = n ? `${base}-${n}` : base;
      const level = hm[1].length;
      if (level <= 3) {
        sections.push({
          heading: cur.heading,
          anchor: cur.anchor,
          text: cur.lines.join('\n').trim(),
        });
        if (level === 2) h2 = heading;
        cur = { heading: level === 2 ? heading : `${h2} › ${heading}`, anchor, lines: [] };
      }
    }
    cur.lines.push(line);
  }
  sections.push({ heading: cur.heading, anchor: cur.anchor, text: cur.lines.join('\n').trim() });
  return sections.filter(s => s.heading || s.text);
};

/** Extracts a top-level type/interface declaration (with preceding JSDoc) from source. */
export const extractDeclaration = (src: string, name: string): string | undefined => {
  const lines = src.split('\n');
  const start = lines.findIndex(l =>
    new RegExp(`^(export )?(declare )?(interface|type) ${name}\\b`).test(l)
  );
  if (start < 0) return undefined;
  let docStart = start;
  if (lines[start - 1]?.trim() === '*/') {
    while (docStart > 0 && !lines[docStart - 1].startsWith('/**')) docStart--;
    docStart--;
  }
  let end = start + 1;
  while (
    end < lines.length &&
    !/^(export |\/\*\*|type |interface |const |import |\/\/ )/.test(lines[end])
  )
    end++;
  return lines.slice(docStart, end).join('\n').trimEnd();
};

const buildTypes = async (): Promise<Record<string, string>> => {
  const sources: string[] = [];
  for (const [dir, pattern] of typeSourceGlobs) {
    for await (const f of new Bun.Glob(pattern).scan({ cwd: path.join(root, dir) })) {
      if (f.includes('.test')) continue;
      sources.push(await Bun.file(path.join(root, dir, f)).text());
    }
  }
  const types: Record<string, string> = {};
  for (const name of typeNames) {
    const decl = sources.map(s => extractDeclaration(s, name)).find(Boolean);
    if (!decl) throw new Error(`Type "${name}" not found`);
    types[name] = decl;
  }
  return types;
};

export const buildDocsIndex = async (): Promise<DocsIndex> => {
  const pages: DocsPage[] = [];
  const sections: DocsSection[] = [];
  const files = (await Array.fromAsync(new Bun.Glob('**/*.{md,mdx}').scan({ cwd: docsDir })))
    .filter(f => !excludedDocs.some(re => re.test(f)))
    .toSorted();

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const src = await Bun.file(filePath).text();
    const fm = parseFrontmatter(src);
    const slug = fm.slug?.replace(/^\//, '') ?? file.replace(/\.mdx?$/, '').replace(/\/index$/, '');
    const title = fm.title ?? fm.sidebar_label ?? slug;
    const pageIdx = pages.length;
    pages.push({
      slug,
      title,
      description: fm.description ?? '',
      url: `${siteUrl}/docs/${slug}`,
    });
    for (const s of splitSections(await cleanMdx(src, filePath))) {
      sections.push({ page: pageIdx, heading: s.heading, anchor: s.anchor, text: s.text });
    }
  }

  return { version, pages, sections, types: await buildTypes() };
};

/** Builds and writes the index to `packages/mcp/src/generated/docs-index.json`. */
export const writeDocsIndex = async (): Promise<void> => {
  const index = await buildDocsIndex();
  const json = JSON.stringify(index);
  await Bun.write(outFile, json);
  console.log(
    `Wrote ${path.relative(root, outFile)}: ${index.pages.length} pages, ${index.sections.length} sections, ${Object.keys(index.types).length} types, ${Math.round(json.length / 1024)} KB`
  );
};

if (import.meta.main) await writeDocsIndex();
