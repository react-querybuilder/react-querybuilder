import { Glob } from 'bun';
// One-time Docusaurus → Rspress migration codemod. Run once from repo root, then delete.
// bun utils/rspress-migrate.ts
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';

const web = path.resolve(import.meta.dir, '../website');
const p = (...s: string[]) => path.join(web, ...s);
const mv = (from: string, to: string) => {
  if (!existsSync(p(from))) return;
  mkdirSync(path.dirname(p(to)), { recursive: true });
  renameSync(p(from), p(to));
};

const versions = ['7', '6', '5', '4', '3'] as const;
const dirFor = (v: string) => (v === 'next' ? 'docs/next' : v === '7' ? 'docs' : `docs/${v}`);

// #region moves
if (existsSync(p('docs/intro.mdx'))) {
  mv('docs', 'content/_tmp_next');
  mv('versioned_docs/version-7', 'content/docs');
  mv('content/_tmp_next', 'content/docs/next');
  for (const v of versions.slice(1)) mv(`versioned_docs/version-${v}`, `content/docs/${v}`);
  mv('static', 'content/public');
  mv('src/pages/demo/_components', 'src/demo/components');
  mv('src/pages/demo/_constants', 'src/demo/constants');
  mv('src/pages/demo/_styles', 'src/demo/styles');
  mv('src/pages/_utils.tsx', 'src/demo/utils.tsx');
  mv('src/pages/_rtl.ts', 'src/demo/rtl.ts');
  mv('src/pages/_CustomStylesQB.tsx', 'src/demo/CustomStylesQB.tsx');
  mv('src/pages/index.module.css', 'src/css/index.module.css');
  mv('src/pages/demo', 'content/demo');
  for (const f of ['index.tsx', 'discord.tsx', 'sandbox.tsx']) mv(`src/pages/${f}`, `content/${f}`);
  rmSync(p('src/pages'), { recursive: true, force: true });
  rmSync(p('blog'), { recursive: true, force: true });
  rmSync(p('content/docs/tsconfig.json'), { force: true });
}
// #endregion

// #region sidebars
type DItem =
  | string
  | { type: 'doc'; id: string; label?: string }
  | {
      type: 'category';
      label: string;
      link?: { type: 'doc'; id: string } | { type: 'generated-index'; title?: string };
      items: DItem[];
    };
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-');
const docTitle = async (ver: string, id: string) => {
  for (const ext of ['.mdx', '.md']) {
    const f = Bun.file(p('content', dirFor(ver), id + ext));
    if (await f.exists()) {
      const src = await f.text();
      return (
        src.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)?.[1] ??
        src.match(/^#\s+(.+)$/m)?.[1] ??
        id.split('/').pop()!
      );
    }
  }
  return id.split('/').pop()!;
};
const overviewPages: { ver: string; slug: string; title: string; desc: string }[] = [];
const convert = async (ver: string, items: DItem[]): Promise<unknown[]> => {
  const base = `/${dirFor(ver)}`;
  const out: unknown[] = [];
  for (const it of items) {
    if (typeof it === 'string') out.push({ text: await docTitle(ver, it), link: `${base}/${it}` });
    else if (it.type === 'doc')
      out.push({ text: it.label ?? (await docTitle(ver, it.id)), link: `${base}/${it.id}` });
    else {
      let link: string | undefined;
      if (it.link?.type === 'doc') link = `${base}/${it.link.id}`;
      else if (it.link?.type === 'generated-index') {
        const slug = slugify(it.label);
        link = `${base}/category/${slug}`;
        overviewPages.push({
          ver,
          slug,
          title: it.link.title ?? it.label,
          desc: (it.link as { description?: string }).description ?? '',
        });
      }
      out.push({
        text: it.label,
        ...(link ? { link } : {}),
        collapsible: true,
        items: await convert(ver, it.items),
      });
    }
  }
  return out;
};
mkdirSync(p('sidebars'), { recursive: true });
const sidebarSrc: Record<string, DItem[]> = {
  next: (await import(p('sidebars.ts'))).default.mySidebar,
};
for (const v of versions)
  if (existsSync(p(`versioned_sidebars/version-${v}-sidebars.json`)))
    sidebarSrc[v] = (await Bun.file(p(`versioned_sidebars/version-${v}-sidebars.json`)).json())
      .mySidebar as DItem[];
for (const [ver, items] of Object.entries(sidebarSrc)) {
  const conv = await convert(ver, items);
  await Bun.write(
    p(`sidebars/${ver}.ts`),
    `import type { Sidebar } from '@rspress/core';\n\nexport default ${JSON.stringify(conv, null, 2)} satisfies Sidebar[string];\n`
  );
}
for (const o of overviewPages)
  await Bun.write(
    p('content', dirFor(o.ver), 'category', `${o.slug}.mdx`),
    `---\ntitle: ${JSON.stringify(o.title)}\ndescription: ${JSON.stringify(o.desc)}\noverview: true\n---\n\n# ${o.title}\n\n${o.desc}\n`
  );
rmSync(p('sidebars.ts'), { force: true });
rmSync(p('versioned_sidebars'), { recursive: true, force: true });
rmSync(p('versioned_docs'), { recursive: true, force: true });
// #endregion

// #region content transforms
const redirects: { from: string; to: string }[] = [];
const tsAdmonitionRe = /^%importmd\s+\.\.\/\\?_ts_admonition\.md\s*$/m;

const highlight = (src: string) => {
  const lines = src.split('\n');
  const out: string[] = [];
  let rangeStart = -1;
  const marker =
    /^\s*(?:\/\/|#|\{\/\*|\/\*|<!--)\s*highlight-(next-line|start|end)\s*(?:\*\/\}|\*\/|-->)?\s*$/;
  for (const line of lines) {
    const m = line.match(marker);
    if (!m) {
      out.push(line);
      continue;
    }
    if (m[1] === 'next-line') out.push('\u0000NEXT');
    else if (m[1] === 'start') rangeStart = out.length;
    else if (rangeStart >= 0) {
      const n = out.length - rangeStart;
      if (n > 0) out[rangeStart] += ` // [!code highlight:${n}]`;
      rangeStart = -1;
    }
  }
  const res: string[] = [];
  for (let i = 0; i < out.length; i++) {
    if (out[i] === '\u0000NEXT') {
      i++;
      if (i < out.length) res.push(`${out[i]} // [!code highlight]`);
    } else res.push(out[i]);
  }
  return res.join('\n');
};

const transform = (src: string, rel: string, ver: string) => {
  let s = src;
  let usesPMTabs = false;
  const needImports = new Set<string>();

  // frontmatter
  s = s.replace(/^hide_table_of_contents:\s*true\s*$/m, 'outline: false');
  s = s.replace(/^toc_max_heading_level:\s*(\d)\s*$/m, (_, n) => `outline: [2, ${n}]`);

  // admonitions
  s = s.replace(/^(\s*):::caution/gm, '$1:::warning');

  // code fences: highlight comments, npm2yarn, mongodb lang
  s = s.replace(/^([ \t]*)```([^\n]*)\n([\s\S]*?)\n\1```/gm, (whole, indent, meta, body) => {
    if (/npm2yarn/.test(meta)) {
      usesPMTabs = true;
      return body
        .split('\n')
        .filter((l: string) => l.trim())
        .map(
          (l: string) =>
            `${indent}<PackageManagerTabs command=${JSON.stringify(l.trim().replace(/^npm /, ''))} />`
        )
        .join('\n\n');
    }
    const newMeta = meta.replace(/^mongodb\b/, 'js');
    return `${indent}\`\`\`${newMeta}\n${/highlight-/.test(body) ? highlight(body) : body}\n${indent}\`\`\``;
  });

  // Tabs
  s = s.replace(/^import Tabs from '@theme\/Tabs';\n/m, () => (needImports.add('Tabs'), ''));
  s = s.replace(/^import TabItem from '@theme\/TabItem';\n/m, () => (needImports.add('Tab'), ''));
  s = s.replace(/<TabItem\b([^>]*)>/g, (_, attrs: string) => {
    const label =
      attrs.match(/label=("[^"]*"|\{[^}]*\})/)?.[1] ?? attrs.match(/value=("[^"]*")/)?.[1];
    const rest = attrs
      .replace(/\s*(label|value)=("[^"]*"|\{[^}]*\})/g, '')
      .replace(/\s*default\b/, '');
    return `<Tab${label ? ` label=${label}` : ''}${rest}>`;
  });
  s = s.replace(/<\/TabItem>/g, '</Tab>');

  // Details
  s = s.replace(/^import Details from '@theme\/Details';\n/m, '');
  s = s.replace(/<Details\b/g, '<details').replace(/<\/Details>/g, '</details>');

  // Admonition component → container (best effort; leave TODO)
  if (/@theme\/Admonition/.test(s))
    s = s.replace(
      /^(import .* from '@theme\/Admonition.*';\n)/gm,
      '{/* TODO(rspress): replace @theme/Admonition usage */}\n'
    );

  // _ts_admonition partial
  if (tsAdmonitionRe.test(s)) {
    s = s.replace(tsAdmonitionRe, '<TSAdmonition />');
    s = addImport(s, "import TSAdmonition from '../_ts_admonition.mdx';");
  }

  // @site → relative-ish alias (kept; alias configured)
  // HTML comments → MDX comments
  s = s.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  const themeImports = [...needImports];
  if (usesPMTabs) themeImports.push('PackageManagerTabs');
  if (themeImports.length)
    s = addImport(s, `import { ${themeImports.sort().join(', ')} } from '@rspress/core/theme';`);

  void rel;
  void ver;
  return s;
};

const addImport = (s: string, imp: string) => {
  const fm = s.match(/^---\n[\s\S]*?\n---\n/);
  const at = fm ? fm[0].length : 0;
  return `${s.slice(0, at)}\n${imp}\n${s.slice(at)}`.replace(/\n{3,}/g, '\n\n');
};

for (const ver of ['next', ...versions]) {
  const root = p('content', dirFor(ver));
  for await (const rel of new Glob('**/*.{md,mdx}').scan(root)) {
    if (ver === '7' && /^(next|[3-6])\//.test(rel)) continue;
    const abs = path.join(root, rel);
    const src = await Bun.file(abs).text();

    // Redirect stubs → client-redirects rules
    const redir = src.match(/<Redirect\s+to=["']([^"']+)["']/);
    if (redir) {
      const fromRoute = `/${dirFor(ver)}/${rel.replace(/\.mdx?$/, '')}`;
      const to = path.posix.normalize(path.posix.join(path.posix.dirname(fromRoute), redir[1]));
      redirects.push({ from: fromRoute, to });
      rmSync(abs);
      continue;
    }

    let out = transform(src, rel, ver);
    let dest = abs;
    // .md files w/ JSX/imports must be .mdx in Rspress
    if (abs.endsWith('.md') && /^(import |<[A-Z])/m.test(out)) dest = abs.replace(/\.md$/, '.mdx');
    if (rel === '_ts_admonition.md') dest = abs.replace(/\.md$/, '.mdx');
    await Bun.write(dest, out);
    if (dest !== abs) rmSync(abs);
  }
}
await Bun.write(
  p('redirects.ts'),
  `// Generated by utils/rspress-migrate.ts from Docusaurus <Redirect> stubs\nexport const docRedirects: { from: string; to: string }[] = ${JSON.stringify(redirects, null, 2)};\n`
);
// #endregion

console.log(
  `sidebars: ${Object.keys(sidebarSrc).length}, overviews: ${overviewPages.length}, redirects: ${redirects.length}`
);
