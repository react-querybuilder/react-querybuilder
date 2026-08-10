/**
 * Live-example runtime — module compilation + iframe document generation.
 *
 * Contract (see also `SandpackRQB.tsx`):
 *
 * - **Virtual module map**, not a filesystem. Keys are absolute-ish paths (`/App.tsx`).
 * - **Transform**: Sucrase (`typescript` + `jsx`, automatic runtime). No bundling, no type checking.
 *   Sucrase is lazy-`import()`ed by the caller so it never enters the SSR/initial page graph.
 * - **Relative specifiers** (`./Foo`) are resolved against the module map, trying
 *   `''`, `.tsx`, `.ts`, `.jsx`, `.js`. No `index`/directory resolution.
 *   They are replaced by `__RQBMOD:<path>__` placeholders here and swapped for `blob:` URLs
 *   inside the iframe (blob URLs must be minted in the iframe's own opaque origin).
 * - **Bare specifiers** are left alone and resolved by the iframe's native `<script type="importmap">`,
 *   which points at esm.sh. `?external=react,react-dom` keeps a single React/ReactDOM instance.
 * - **CSS**: bare `*.css` imports are stripped from JS and emitted as `<link>` tags at the
 *   equivalent esm.sh URL; all other CSS is concatenated into one inline `<style>`.
 * - **Isolation**: `<iframe sandbox="allow-scripts">` + `srcdoc` ⇒ opaque origin, no parent access.
 * - **Parent↔iframe**: `postMessage` (`ready` / `error` / `height`).
 */

export interface LiveFile {
  path: string;
  code: string;
  lang: string;
  hidden: boolean;
  active: boolean;
}

export interface CompileOptions {
  /** Bare specifier -> version range, e.g. `{ 'react-querybuilder': '8' }`. */
  dependencies: Record<string, string>;
  /** Bare CSS specifiers to link even if no module imports them. */
  extraCSSImports: string[];
  /** Unique id echoed back in every `postMessage` from the iframe. */
  id: string;
}

/**
 * Sandbox chrome, ported from the Sandpack implementation. Both themes ship in every document and
 * are toggled by a `theme` message, so switching light/dark never reloads the example.
 *
 * `color-scheme` stays `light` in both themes, matching the Sandpack behavior: the form controls
 * rendered by the examples are light in dark mode too. Consequently every rule that would otherwise
 * rely on the UA's dark defaults (notably `pre`, which has an explicit white background) sets its
 * own color.
 */
const SANDBOX_CSS = String.raw`
:root { color-scheme: light; background-color: #ffffff; }
body { margin: 8px; background-color: #ffffff; }
pre {
  padding: 1rem;
  color: #1c1e21;
  background-color: white;
  border: 1px solid lightgray;
  border-radius: 0.25rem;
  white-space: pre-wrap;
}
html.dark { background-color: #343a46; }
html.dark body { background-color: #343a46; }
html.dark :is(h1, h2, h3, h4, h5, h6) { color: white; }
`;

export type SucraseTransform = (
  code: string,
  opts: { transforms: string[]; jsxRuntime?: string; filePath?: string }
) => { code: string };

const REACT_VERSION = '18';
const ESM_SH = 'https://esm.sh';

const JS_EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js'];
const isJS = (path: string) => /\.[jt]sx?$/.test(path);
const isCSS = (path: string) => /\.s?css$/.test(path);

/** `from './x'` / `import './x'` / `import('./x')`, relative specifiers only. */
const RELATIVE_SPECIFIER = /(\bfrom\s*|\bimport\s*|\bimport\(\s*)(['"])(\.[^'"]*)\2/g;
/** Side-effect-only CSS import statement, e.g. `import 'pkg/dist/x.css';`. */
const CSS_IMPORT = /^[^\S\n]*import\s+(['"])([^'"]+\.s?css)\1;?[^\S\n]*$/gm;

export class CompileError extends Error {
  constructor(
    message: string,
    readonly file?: string
  ) {
    super(message);
    this.name = 'CompileError';
  }
}

/** Split a bare specifier into package name and subpath. */
const splitBareSpecifier = (specifier: string): [pkg: string, subpath: string] => {
  const parts = specifier.split('/');
  const pkg = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  return [pkg, specifier.slice(pkg.length + 1)];
};

const esmShURL = (pkg: string, dependencies: Record<string, string>, suffix = '') => {
  const version = dependencies[pkg];
  return `${ESM_SH}/${pkg}${version ? `@${encodeURIComponent(version)}` : ''}${suffix}`;
};

/** Bare CSS specifier (`pkg/dist/x.css`) -> esm.sh stylesheet URL. */
const cssURL = (specifier: string, dependencies: Record<string, string>) => {
  const [pkg, subpath] = splitBareSpecifier(specifier);
  return esmShURL(pkg, dependencies, `/${subpath}`).replace(/\.scss$/, '.css');
};

const buildImportMap = (dependencies: Record<string, string>) => {
  const imports: Record<string, string> = {
    react: `${ESM_SH}/react@${REACT_VERSION}`,
    'react/': `${ESM_SH}/react@${REACT_VERSION}/`,
    'react-dom': `${ESM_SH}/react-dom@${REACT_VERSION}?external=react`,
    'react-dom/': `${ESM_SH}/react-dom@${REACT_VERSION}&external=react/`,
  };
  // Subpath (`pkg/`) entries are deliberately omitted for third-party packages: no example imports
  // a bare subpath other than `react/jsx-runtime` and `react-dom/client`.
  for (const pkg of Object.keys(dependencies)) {
    if (pkg === 'react' || pkg === 'react-dom') continue;
    imports[pkg] = esmShURL(pkg, dependencies, '?external=react,react-dom');
  }
  return { imports };
};

/** Resolve `./Foo` from `/dir/Bar.tsx` against the module map. */
const resolveRelative = (specifier: string, importer: string, files: Record<string, LiveFile>) => {
  const dir = importer.slice(0, importer.lastIndexOf('/') + 1);
  const base = new URL(specifier, `file://${dir}`).pathname;
  for (const ext of JS_EXTENSIONS) if (files[base + ext]) return base + ext;
  throw new CompileError(`Cannot resolve '${specifier}' from '${importer}'`, importer);
};

interface CompiledModule {
  code: string;
  deps: string[];
}

/** Iframe-side bootstrap. Minted blob URLs, entry import, error/height reporting. */
const BOOTSTRAP = String.raw`
const post = (type, extra) => { try { parent.postMessage({ source: 'rqb-live', type, id: ID, ...extra }, '*'); } catch {} };
// Errors are surfaced by the host's overlay, not in here, so a failed example never renders a
// mystery blank box.
const fail = (kind, message, stack) => post('error', { kind, message, stack });
addEventListener('error', e => {
  if (e.target !== window && e.target?.tagName === 'LINK') {
    return fail('network', 'Failed to load stylesheet: ' + e.target.href);
  }
  fail('runtime', e.message, e.error?.stack);
}, true);
addEventListener('unhandledrejection', e => {
  const r = e.reason;
  fail(/Failed to fetch|Importing a module script failed|error loading dynamically imported module/i.test(String(r?.message ?? r)) ? 'network' : 'runtime', String(r?.message ?? r), r?.stack);
});

const urls = {};
const visiting = new Set();
const mint = path => {
  if (urls[path]) return urls[path];
  if (visiting.has(path)) throw new Error('Circular dependency involving ' + path);
  visiting.add(path);
  const mod = MODULES[path];
  for (const dep of mod.deps) mint(dep);
  const code = mod.code.replaceAll(/__RQBMOD:(.*?)__/g, (_m, p) => urls[p]);
  urls[path] = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  visiting.delete(path);
  return urls[path];
};

(async () => {
  let entryURL;
  try {
    entryURL = mint(ENTRY);
  } catch (err) {
    return fail('compile', String(err?.message ?? err), err?.stack);
  }
  try {
    const [mod, React, { createRoot }] = await Promise.all([
      import(entryURL),
      import('react'),
      import('react-dom/client'),
    ]);
    if (typeof mod.default !== 'function') {
      return fail('compile', ENTRY + ' has no default-exported component.');
    }
    createRoot(document.getElementById('root')).render(React.createElement(mod.default));
    post('ready');
  } catch (err) {
    const message = String(err?.message ?? err);
    if (/Failed to fetch|module script failed|dynamically imported module|Importing a module script/i.test(message)) {
      return fail('network', message + '\n\nA dependency could not be loaded from esm.sh. Expected:\n' + DEPENDENCY_LIST);
    }
    fail('runtime', message, err?.stack);
  }
})();

// Height reporting. #root gives the in-flow content height (independent of the iframe's own
// height, unlike documentElement.scrollHeight). Absolutely positioned overflow -- e.g. an open
// date picker popup -- only shows up in body.scrollHeight, and only once it exceeds the viewport.
//
// "slack" is extra room reserved below the content while an input is focused. Without it, a popup
// anchored to an input near the bottom of the example (react-datepicker's calendar, positioned by
// floating-ui) sees no space below inside the iframe viewport and flips upward, where it is clipped
// by the iframe's top edge and appears to hide behind the code block above.
const POPUP_SLACK = 320;
let slack = 0;
const measure = () => {
  const base =
    Math.ceil(document.getElementById('root').getBoundingClientRect().bottom) + 8 + slack;
  const overflow = document.body.scrollHeight > innerHeight ? document.body.scrollHeight : 0;
  return Math.max(base, overflow, 40);
};
let lastHeight = 0;
const report = () => {
  const height = measure();
  if (height !== lastHeight) {
    lastHeight = height;
    post('height', { height });
  }
};
new ResizeObserver(report).observe(document.getElementById('root'));
addEventListener('load', report);
setInterval(report, 250);

let releaseSlack;
addEventListener('focusin', e => {
  if (!e.target.matches('input, textarea')) return;
  clearTimeout(releaseSlack);
  slack = POPUP_SLACK;
  report();
});
addEventListener('focusout', () => {
  // Deferred: clicking a day in an open calendar blurs the input first, and shrinking immediately
  // would move the popup out from under the pointer.
  clearTimeout(releaseSlack);
  releaseSlack = setTimeout(() => {
    slack = 0;
    report();
  }, 300);
});

addEventListener('message', e => {
  if (e.data?.source === 'rqb-live-host' && e.data.type === 'theme') {
    document.documentElement.classList.toggle('dark', e.data.dark);
  }
});
post('mounted');
`;

/** Transform every JS module, rewriting relative specifiers to placeholders. */
const compileModules = (
  files: Record<string, LiveFile>,
  transform: SucraseTransform
): Record<string, CompiledModule> => {
  const modules: Record<string, CompiledModule> = {};
  for (const file of Object.values(files)) {
    if (!isJS(file.path)) continue;
    const source = file.code.replaceAll(CSS_IMPORT, '');
    let transformed: string;
    try {
      transformed = transform(source, {
        transforms: ['typescript', 'jsx'],
        jsxRuntime: 'automatic',
        filePath: file.path,
      }).code;
    } catch (err) {
      const { message } = err as Error;
      throw new CompileError(`${file.path}: ${message}`, file.path);
    }
    const deps: string[] = [];
    const code = transformed.replaceAll(RELATIVE_SPECIFIER, (_m, prefix, quote, specifier) => {
      const target = resolveRelative(specifier, file.path, files);
      deps.push(target);
      return `${prefix}${quote}__RQBMOD:${target}__${quote}`;
    });
    modules[file.path] = { code, deps };
  }
  return modules;
};

/** Collect bare CSS specifiers imported by JS modules, plus any always-on extras. */
const collectCSSLinks = (files: Record<string, LiveFile>, opts: CompileOptions) => {
  const specifiers = new Set(opts.extraCSSImports);
  for (const file of Object.values(files)) {
    if (!isJS(file.path)) continue;
    for (const [, , specifier] of file.code.matchAll(CSS_IMPORT)) {
      if (!specifier.startsWith('.')) specifiers.add(specifier);
    }
  }
  return [...specifiers].map(s => cssURL(s, opts.dependencies));
};

const escapeForScript = (json: string) => json.replaceAll('</', String.raw`<\/`);

/** Compile the module map into a complete `srcdoc` document. */
export const buildSrcDoc = (
  files: Record<string, LiveFile>,
  transform: SucraseTransform,
  opts: CompileOptions
): string => {
  const entry = ['/App.tsx', '/App.js', '/App.jsx', '/App.ts'].find(p => files[p]);
  if (!entry) throw new CompileError('No entry module. Expected /App.tsx or /App.js.');

  const modules = compileModules(files, transform);
  const importMap = buildImportMap(opts.dependencies);
  const links = collectCSSLinks(files, opts);
  const inlineCSS = [
    SANDBOX_CSS,
    ...Object.values(files)
      .filter(f => isCSS(f.path))
      .map(f => f.code),
  ]
    .filter(Boolean)
    .join('\n\n');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<script type="importmap">${escapeForScript(JSON.stringify(importMap))}</script>
${links.map(href => `<link rel="stylesheet" href="${href}">`).join('\n')}
<style>${inlineCSS}</style>
</head>
<body>
<div id="root"></div>
<script type="module">
const ID = ${escapeForScript(JSON.stringify(opts.id))};
const ENTRY = ${JSON.stringify(entry)};
const DEPENDENCY_LIST = ${escapeForScript(
    JSON.stringify(
      Object.entries(importMap.imports)
        .map(([k, v]) => `  ${k} -> ${v}`)
        .join('\n')
    )
  )};
const MODULES = ${escapeForScript(JSON.stringify(modules))};
${BOOTSTRAP}
</script>
</body>
</html>`;
};
