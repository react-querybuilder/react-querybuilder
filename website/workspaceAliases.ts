/**
 * `resolve.alias` map: workspace package entry points (`exports` subpaths) → `src` files, so docs
 * and demos use live source instead of `dist`. Exact-match keys (`$`), so non-entry paths
 * (`<pkg>/dist/*.css`, `<pkg>/package.json`) still resolve via the package.
 *
 * Runs in Node (Rspress), so `node:fs` instead of Bun APIs.
 */
import fs from 'node:fs';
import path from 'node:path';

const exts = ['.ts', '.tsx'];

// Subpath `./x` → first existing candidate (mirrors per-package `tsdown.config.ts` entries)
const candidates = (x: string) =>
  [`index.${x}`, `fwd/${x}`, `${x}/index`, x, `utils/${x}/index`, `utils/${x}`].flatMap(c =>
    exts.map(e => `${c}${e}`)
  );

export const getWorkspaceAliases = (pkgRoot: string, packages: string[]) => {
  const alias: Record<string, string> = {};
  for (const dir of packages) {
    const pkgDir = path.join(pkgRoot, dir);
    const { name, exports = {} } = JSON.parse(
      fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
    ) as { name: string; exports?: Record<string, unknown> };
    for (const key of Object.keys(exports)) {
      if (key === './package.json' || key.includes('*')) continue;
      const sub = key.replace(/^\.\/?/, '');
      const file = (sub ? candidates(sub) : exts.map(e => `index${e}`))
        .map(c => path.join(pkgDir, 'src', c))
        .find(f => fs.existsSync(f));
      if (!file) throw new Error(`No src entry for "${name}/${sub}" (see workspaceAliases.ts)`);
      alias[`${name}${sub ? `/${sub}` : ''}$`] = file;
    }
  }
  return alias;
};
