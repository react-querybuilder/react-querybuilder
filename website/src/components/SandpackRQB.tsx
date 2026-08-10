/**
 * `SandpackRQB` — interactive docs examples.
 *
 * Despite the name (renaming is a separate concern), this no longer uses Sandpack. It compiles the
 * MDX code fences in the browser with Sucrase and runs them in a sandboxed iframe against esm.sh.
 *
 * ## Authoring contract (unchanged)
 *
 * Each child must be an MDX code fence. The fence's meta string determines the virtual file path:
 *
 * ```md
 * ```tsx CustomValueEditor.tsx active
 * ```
 *
 * - First meta token is the filename (`/` is prepended). Remaining tokens are flags:
 *   `hidden` (compiled but not displayed) and `active` (the initially selected tab).
 * - With no meta string, the language decides: `tsx` -> `/App.tsx`, `js` -> `/App.js`,
 *   `css` -> `/styles.css`. Anything else is an error, as are duplicate paths.
 * - `/App.tsx` (or `/App.js`) is the entry module and must default-export a component.
 *
 * ## Runtime
 *
 * See `LiveExample/runtime.ts` for the module map, transform, import map, and iframe contract.
 * In short: relative imports resolve against the fences; bare imports resolve through a native
 * import map pointing at esm.sh (versions from `rqbVersion` + `customSetup.dependencies`); the
 * example runs in `<iframe sandbox="allow-scripts">` with `srcdoc`, so it has an opaque origin and
 * no access to this document.
 *
 * Sucrase is lazy-loaded on mount and the whole component is `BrowserOnly`, so docs pages without
 * examples never pay for it and SSR never touches it.
 */

import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import * as React from 'react';
import type { LiveFile } from './LiveExample/runtime';

export interface SandpackRQBProps {
  children: React.ReactNode;
  rqbVersion?: 4 | 5 | 6 | 7 | 8;
  customSetup?: { dependencies?: Record<string, string> };
}

const RQB_CSS = 'react-querybuilder/dist/query-builder.css';
const RQB_CSS_IMPORT = /^\s*import\s+(['"])react-querybuilder\/dist\/query-builder\.s?css\1;?\s*$/m;

const DEFAULT_PATHS: Record<string, string> = {
  'language-tsx': '/App.tsx',
  'language-js': '/App.js',
  'language-css': '/styles.css',
};

/** Port of the original fence-parsing logic. */
const parseFences = (children: React.ReactNode): LiveFile[] => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const codeSnippets = React.Children.toArray(children) as React.ReactElement<any>[];
  const files: LiveFile[] = [];

  for (const codeSnippet of codeSnippets) {
    const { props } = codeSnippet.props.children;
    let path: string;
    let hidden = false;
    let active = false;

    if (props.metastring) {
      const [name, ...params] = props.metastring.split(' ');
      path = '/' + name;
      hidden = params.includes('hidden');
      active = params.includes('active');
    } else {
      path = DEFAULT_PATHS[props.className as string];
      if (!path) {
        throw new Error(`Code block is missing a filename: ${props.children}`);
      }
    }

    if (files.some(f => f.path === path)) {
      throw new Error(
        `File ${path} was defined multiple times. Each file snippet should have a unique path name.`
      );
    }

    files.push({
      path,
      code: props.children,
      lang: (props.className as string | undefined)?.replace('language-', '') ?? 'tsx',
      hidden,
      active,
    });
  }

  return files;
};

const LiveExample = React.lazy(() =>
  import('./LiveExample/LiveExample').then(m => ({ default: m.LiveExample }))
);

export const SandpackRQB = ({
  children,
  customSetup,
  rqbVersion = 8,
}: SandpackRQBProps): React.JSX.Element => {
  const dark = useColorMode().colorMode === 'dark';

  // These recompute whenever MDX hands over fresh identities. That is fine — nothing downstream is
  // identity-sensitive; see the note on `srcDoc` in `LiveExample.tsx`.
  const files = React.useMemo(() => parseFences(children), [children]);

  const dependencies = React.useMemo(
    () => ({ ...customSetup?.dependencies, 'react-querybuilder': `^${rqbVersion}` }),
    [customSetup?.dependencies, rqbVersion]
  );

  // The original implementation prepended an `@import` of the RQB stylesheet unless App.tsx already
  // imported it. Here it becomes a `<link>` instead.
  const extraCSSImports = React.useMemo(() => {
    const app = files.find(f => f.path === '/App.tsx' || f.path === '/App.js');
    return app && RQB_CSS_IMPORT.test(app.code) ? [] : [RQB_CSS];
  }, [files]);

  return (
    <div key={`v${rqbVersion}`} className="sandpackrqb">
      {/* BrowserOnly + React.lazy keep Sucrase and the runtime out of the SSR module graph. */}
      <BrowserOnly>
        {() => (
          <React.Suspense fallback={null}>
            <LiveExample
              files={files}
              dependencies={dependencies}
              extraCSSImports={extraCSSImports}
              dark={dark}
            />
          </React.Suspense>
        )}
      </BrowserOnly>
    </div>
  );
};
