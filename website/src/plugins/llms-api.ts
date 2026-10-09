/**
 * Docusaurus plugin: writes `llms-api.txt` (condensed API index, one line per export) from the
 * TypeDoc JSON emitted alongside the markdown API docs (`json` option of
 * `docusaurus-plugin-typedoc` in `docusaurus.config.ts`).
 *
 * Runs in Node (Docusaurus), so `node:fs` instead of Bun APIs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PluginModule } from '@docusaurus/types';

interface CommentPart {
  kind: string;
  text: string;
}
interface Reflection {
  name: string;
  kind: number;
  flags?: { isDeprecated?: boolean };
  comment?: { summary?: CommentPart[]; blockTags?: { tag: string }[] };
  signatures?: Reflection[];
  children?: Reflection[];
}

// typedoc `ReflectionKind`
const Kind = {
  Module: 2,
  Namespace: 4,
  Enum: 8,
  Variable: 32,
  Function: 64,
  Class: 128,
  Interface: 256,
  TypeAlias: 2_097_152,
  Reference: 4_194_304,
} as const;
const kindLabel: Record<number, string> = {
  [Kind.Namespace]: 'namespace',
  [Kind.Enum]: 'enum',
  [Kind.Variable]: 'const',
  [Kind.Function]: 'function',
  [Kind.Class]: 'class',
  [Kind.Interface]: 'interface',
  [Kind.TypeAlias]: 'type',
};

const MAX_SUMMARY = 200;

const sigDeprecated = (r: Reflection) =>
  r.flags?.isDeprecated || !!r.comment?.blockTags?.some(t => t.tag === '@deprecated');

/** `{@link pkg!Name Label}` → `Label`; `{@link pkg!Name}` → `Name`. */
const linkText = (t: string) => {
  const sp = t.indexOf(' ');
  return sp > 0 ? t.slice(sp + 1).trim() : t.slice(t.lastIndexOf('!') + 1);
};

/** First paragraph of summary (prefers non-deprecated overload), single line. */
const summarize = (r: Reflection): string => {
  const sigs = (r.signatures ?? []).filter(s => s.comment);
  const c = r.comment ?? (sigs.find(s => !sigDeprecated(s)) ?? sigs[0])?.comment;
  const raw = (c?.summary ?? [])
    .map(p => (p.kind === 'inline-tag' ? `\`${linkText(p.text)}\`` : p.text))
    .join('')
    .split(/\n\s*\n/)[0]
    .replace(/\s+/g, ' ')
    .trim();
  if (raw.length <= MAX_SUMMARY) return raw;
  const cut = raw.slice(0, MAX_SUMMARY);
  const dot = cut.lastIndexOf('. ');
  return dot > 60 ? cut.slice(0, dot + 1) : `${cut.trimEnd()}…`;
};

/** Deprecated if the reflection is, or every overload is. */
const isDeprecated = (r: Reflection) =>
  sigDeprecated(r) || (!!r.signatures?.length && r.signatures.every(s => sigDeprecated(s)));

const renderSymbols = (members: Reflection[], skip?: Set<string>): string[] =>
  members
    .filter(m => m.kind in kindLabel && !skip?.has(m.name))
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map(m => {
      const s = summarize(m);
      const dep = isDeprecated(m) ? ' **Deprecated.**' : '';
      return `- \`${m.name}\` (${kindLabel[m.kind]})${s || dep ? `:${dep}${s ? ` ${s}` : ''}` : ''}`;
    });

/** Entry-point module name → import subpath (`index` → '', `index.ui` → `ui`, `utils/parseX` → `parseX`). */
const entrySubpath = (name: string) => name.replace(/^index\.?/, '').replace(/^.*\//, '');

/** Renders TypeDoc JSON (`entryPointStrategy: 'packages'`) as markdown text. */
export const renderLlmsApi = (project: Reflection, siteUrl: string): string => {
  const lines = [
    '# React Query Builder API (condensed)',
    '',
    `> Every exported symbol of every published package, one line each. Full reference: ${siteUrl}/api. Types/props: check the installed \`.d.ts\` files.`,
    '',
    '`react-querybuilder` re-exports everything from `@react-querybuilder/core`; re-exports are not repeated.',
  ];
  const pkgs = project.children ?? [];
  const core = pkgs.find(p => p.name === '@react-querybuilder/core');
  const coreRoot = core?.children?.find(k => k.kind === Kind.Module && k.name === 'index') ?? core;
  // `react-querybuilder` re-exports core; TypeDoc resolves those as own declarations
  const coreNames = new Set((coreRoot?.children ?? []).map(c => c.name));
  for (const pkg of pkgs.toSorted((a, b) => a.name.localeCompare(b.name))) {
    const skip = pkg.name === 'react-querybuilder' ? coreNames : undefined;
    lines.push('', `## ${pkg.name}`);
    const kids = pkg.children ?? [];
    const modules = kids.filter(k => k.kind === Kind.Module);
    // Multi-entry packages: one subsection per entry point, root first
    if (modules.length > 0) {
      const direct = renderSymbols(
        kids.filter(k => k.kind !== Kind.Module),
        skip
      );
      if (direct.length) lines.push('', ...direct);
      const sorted = modules
        .map(m => ({ m, sub: entrySubpath(m.name) }))
        .toSorted((a, b) => (a.sub === '' ? -1 : b.sub === '' ? 1 : a.sub.localeCompare(b.sub)));
      for (const { m, sub } of sorted) {
        const syms = renderSymbols(m.children ?? [], skip);
        if (syms.length) lines.push('', `### ${pkg.name}${sub && `/${sub}`}`, '', ...syms);
      }
    } else {
      lines.push('', ...renderSymbols(kids, skip));
    }
  }
  return `${lines.join('\n')}\n`;
};

export interface LlmsApiPluginOptions {
  /** TypeDoc JSON path (relative to site dir). */
  jsonPath: string;
}

/** Plugin factory, e.g. `plugins: [llmsApiPlugin({ jsonPath })]`. */
export const llmsApiPlugin =
  (options: LlmsApiPluginOptions): PluginModule =>
  context => ({
    name: 'rqb-llms-api',
    async postBuild({ outDir }) {
      const jsonPath = path.resolve(context.siteDir, options.jsonPath);
      let project: Reflection;
      try {
        project = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
      } catch {
        console.warn(`[rqb-llms-api] ${jsonPath} not found; skipping llms-api.txt`);
        return;
      }
      await fs.writeFile(
        path.join(outDir, 'llms-api.txt'),
        renderLlmsApi(project, context.siteConfig.url)
      );
    },
  });
