/**
 * Rehype plugin for `@signalwire/docusaurus-plugin-llms-txt`: cleans rendered Docusaurus HTML
 * before markdown conversion.
 *
 * - drops heading `hash-link` anchors, buttons, SVGs
 * - Prism code blocks → plain `<pre><code class="language-x">` (no blank line per line, keeps lang)
 * - package-manager tabs (npm2yarn) → first panel only; other tabs → panels labeled by tab name
 * - admonitions → `<blockquote>` w/ bold label
 */
import type { Element, ElementContent, Root, RootContent, Text } from 'hast';

const PKG_MANAGERS = new Set(['npm', 'yarn', 'pnpm', 'bun']);

const classes = (el: Element): string[] => {
  const c: unknown = el.properties?.className;
  return Array.isArray(c) ? c.map(String) : typeof c === 'string' ? c.split(/\s+/) : [];
};
const hasClass = (el: Element, re: RegExp) => classes(el).some(c => re.test(c));
const isEl = (n: RootContent | ElementContent): n is Element => n.type === 'element';
const text = (value: string): Text => ({ type: 'text', value });
const el = (tagName: string, children: ElementContent[], className?: string[]): Element => ({
  type: 'element',
  tagName,
  properties: className ? { className } : {},
  children,
});

const toText = (n: RootContent | ElementContent): string =>
  n.type === 'text' ? n.value : isEl(n) ? n.children.map(c => toText(c)).join('') : '';

/** Depth-first search. */
const find = (n: Element, pred: (e: Element) => boolean): Element | undefined => {
  for (const c of n.children) {
    if (!isEl(c)) continue;
    if (pred(c)) return c;
    const f = find(c, pred);
    if (f) return f;
  }
  return undefined;
};
const findAll = (n: Element, pred: (e: Element) => boolean, acc: Element[] = []): Element[] => {
  for (const c of n.children) {
    if (!isEl(c)) continue;
    if (pred(c)) acc.push(c);
    else findAll(c, pred, acc);
  }
  return acc;
};

const cleanCode = (pre: Element): Element => {
  const lang = classes(pre)
    .find(c => c.startsWith('language-'))
    ?.slice(9);
  const lines = findAll(pre, e => hasClass(e, /^token-line$/));
  const body = lines.length ? lines.map(l => toText(l)).join('\n') : toText(pre);
  return el('pre', [
    el('code', [text(body.replace(/\n+$/, ''))], lang ? [`language-${lang}`] : []),
  ]);
};

const cleanTabs = (tabs: Element): ElementContent[] => {
  const labels = findAll(tabs, e => e.properties?.role === 'tab').map(t => toText(t).trim());
  const panels = findAll(tabs, e => e.properties?.role === 'tabpanel');
  if (labels.length > 0 && labels.every(l => PKG_MANAGERS.has(l.toLowerCase())))
    return panels[0]?.children ?? [];
  const out: ElementContent[] = [];
  for (const [i, p] of panels.entries())
    out.push(el('p', [el('strong', [text(labels[i] ?? `Tab ${i + 1}`)])]), ...p.children);
  return out;
};

const cleanAdmonition = (adm: Element): Element => {
  const heading = find(adm, e => hasClass(e, /^admonitionHeading/));
  const content = find(adm, e => hasClass(e, /^admonitionContent/));
  const label = heading ? toText(heading).trim() : '';
  const children = content?.children ?? [];
  const [first, ...rest] = children;
  // Inline label into first paragraph when possible
  if (label && first && isEl(first) && first.tagName === 'p')
    return el('blockquote', [
      {
        ...first,
        children: [el('strong', [text(`${capitalize(label)}:`)]), text(' '), ...first.children],
      },
      ...rest,
    ]);
  return el(
    'blockquote',
    label ? [el('p', [el('strong', [text(capitalize(label))])]), ...children] : children
  );
};
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const transform = (parent: Root | Element): void => {
  const out: (RootContent | ElementContent)[] = [];
  for (const c of parent.children) {
    if (!isEl(c)) {
      out.push(c);
      continue;
    }
    if (
      c.tagName === 'button' ||
      c.tagName === 'svg' ||
      (c.tagName === 'a' && hasClass(c, /^hash-link$/))
    )
      continue;
    if (c.tagName === 'pre' && hasClass(c, /^prism-code$/)) {
      out.push(cleanCode(c));
      continue;
    }
    if (hasClass(c, /^tabs-container$/)) {
      const wrapper = el('div', cleanTabs(c));
      transform(wrapper);
      out.push(...wrapper.children);
      continue;
    }
    if (hasClass(c, /^theme-admonition$/)) {
      const bq = cleanAdmonition(c);
      transform(bq);
      out.push(bq);
      continue;
    }
    transform(c);
    out.push(c);
  }
  parent.children = out as typeof parent.children;
};

export const rehypeLlmsCleanup = () => (tree: Root) => {
  transform(tree);
};
