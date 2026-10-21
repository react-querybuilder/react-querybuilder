/**
 * `llms.txt` / `llms-full.txt` customization (ports Docusaurus `llms-txt` plugin config):
 * - only default-version docs (`/docs/**`, not `/docs/{next,N}/**`), minus exclusions
 * - sections: Documentation (misc), Components, Styling, Utilities, Tips and Tricks
 * - trailing "Optional" links section
 *
 * Rspress `llms.llmsTxt` only customizes `llms.txt`, so `llmsFullTxtPlugin` re-filters/reorders
 * `llms-full.txt` in `afterBuild` using the route order captured by `renderLlmsTxt`.
 *
 * Runs in Node (Rspress), so `node:fs` instead of Bun APIs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { LlmsTxtPage, LlmsTxtRenderer, RspressPlugin } from '@rspress/core';
import { discordLink } from '../constants';

const repo = 'https://github.com/react-querybuilder/react-querybuilder';

const title = 'React Query Builder documentation and demos';
const description =
  'Comprehensive guide to the React Query Builder component library and associated packages';

const excludedRoutes = [
  /^\/docs\/(next|\d+)(\/|$)/, // non-default versions
  /^\/docs\/(api|category)\//,
  /^\/docs\/(changelog|migrate|tips\/styling|umd)$/,
];

// First match wins; unmatched `/docs/**` → "Documentation"
const sections: { title: string; match: RegExp }[] = [
  { title: 'Components', match: /^\/docs\/components\// },
  { title: 'Styling', match: /^\/docs\/styling\// },
  { title: 'Utilities', match: /^\/docs\/utils\// },
  { title: 'Tips and Tricks', match: /^\/docs\/tips\// },
];

const optionalLinks: { title: string; url: string; description?: string }[] = [
  { title: 'GitHub repository', url: repo },
  { title: 'Discord server', url: discordLink },
  {
    title: 'Agent skill (SKILL.md)',
    url: `${repo}/tree/main/skills/react-querybuilder`,
    description:
      'Install: `npx skills add react-querybuilder/react-querybuilder --skill react-querybuilder`. Also shipped in `node_modules/react-querybuilder/skills/` and `node_modules/@react-querybuilder/core/skills/`.',
  },
  {
    title: 'API index (llms-api.txt)',
    url: 'https://react-querybuilder.js.org/llms-api.txt',
    description: 'Every exported symbol of every package, one line each.',
  },
  {
    title: 'MCP server (@react-querybuilder/mcp)',
    url: 'https://www.npmjs.com/package/@react-querybuilder/mcp',
    description:
      'Stdio MCP server (`npx -y @react-querybuilder/mcp`): format/parse/convert/validate queries, JSON Schema, docs search.',
  },
];

const isIncluded = (routePath: string) =>
  routePath.startsWith('/docs/') && !excludedRoutes.some(re => re.test(routePath));

const linkLine = (t: string, url: string, desc?: string) =>
  `- [${t}](${url})${desc ? `: ${desc}` : ''}`;

const renderPages = (ps: LlmsTxtPage[]) => ps.map(p => linkLine(p.title, p.link, p.description));

// `llms-full.txt` order; set by `renderLlmsTxt` (runs before `afterBuild`)
let includedLinks: string[] = [];

export const renderLlmsTxt: LlmsTxtRenderer = ctx => {
  // Rspress sections are nav-ordered, pages sidebar-ordered
  const pages = ctx.sections.flatMap(s => s.pages).filter(p => isIncluded(p.routePath));
  const misc: LlmsTxtPage[] = [];
  const grouped = sections.map(() => [] as LlmsTxtPage[]);
  for (const p of pages) {
    const i = sections.findIndex(s => s.match.test(p.routePath));
    (i < 0 ? misc : grouped[i]).push(p);
  }
  includedLinks = [misc, ...grouped].flat().map(p => p.link);

  const lines = [`# ${title}`, '', `> ${description}`, '', '## Documentation', ''];
  lines.push(...renderPages(misc));
  sections.forEach((s, i) => {
    if (grouped[i].length > 0) lines.push('', `### ${s.title}`, '', ...renderPages(grouped[i]));
  });
  lines.push(
    '',
    '## Optional',
    '',
    ...optionalLinks.map(l => linkLine(l.title, l.url, l.description))
  );
  return `${lines.join('\n')}\n`;
};

export const llmsFullTxtPlugin = (): RspressPlugin => ({
  name: 'rqb-llms-full-txt',
  async afterBuild(config) {
    const file = path.join(path.resolve(config.outDir ?? 'build'), 'llms-full.txt');
    const src = await fs.readFile(file, 'utf8');
    // Rspress format: `---\nurl: <link>\n---\n<content>` per page
    const chunks = new Map<string, string>();
    const re = /^---\nurl: (.+)\n---\n/gm;
    const heads = [...src.matchAll(re)];
    heads.forEach((m, i) => {
      chunks.set(m[1], src.slice(m.index, heads[i + 1]?.index ?? src.length).trimEnd());
    });
    const out = includedLinks.flatMap(l => chunks.get(l) ?? []);
    await fs.writeFile(file, `${out.join('\n\n')}\n`);
  },
});
