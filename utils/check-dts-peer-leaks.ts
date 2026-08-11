/**
 * Reports optional peer dependencies referenced from a package's *default* published type entry.
 *
 * Consumers that typecheck with `skipLibCheck: false` get TS2307 for every such reference unless
 * they install the optional peer, which defeats the point of it being optional. See
 * https://github.com/react-querybuilder/react-querybuilder/issues/940.
 *
 * Only the `"."` export condition (and the relative declaration chunks it pulls in transitively) is
 * checked -- subpath entry points like `@react-querybuilder/dnd/dnd-kit` are expected to reference
 * their peer, since importing that subpath implies the peer is installed.
 *
 * Not gated in CI yet -- run manually via `bun check-dts-peer-leaks`. `knownLeaks` is now empty, so
 * this is ready to be added to `checkall` whenever we want to enforce it.
 */
/* oxlint-disable no-await-in-loop -- sequential by nature: per-package scan, then chunk graph traversal */
import { dirname, join, normalize } from 'node:path';

/** Leaks that are known/accepted for now. Add entries only with cause; empty is the goal state. */
const knownLeaks: Record<string, string[]> = {};

const importRE = /^\s*(?:import|export)\b[^;]*?\bfrom\s*["'](?<spec>[^"']+)["']/gm;
/** Inline `import("...")` type references */
const inlineImportRE = /\bimport\(\s*["'](?<spec>[^"']+)["']\s*\)/g;

/** Package name for a specifier, or `undefined` for relative/builtin/subpath-import ones */
const pkgNameOf = (spec: string): string | undefined => {
  if (spec.startsWith('.') || spec.startsWith('#') || spec.startsWith('node:')) return undefined;
  return spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
};

interface PackageJson {
  name: string;
  types?: string;
  imports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  exports?: Record<string, unknown>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
}

/** Declaration file(s) for the `"."` export condition */
const defaultTypeEntries = (pkg: PackageJson): string[] => {
  const found = new Set<string>();
  const walk = (node: unknown, inTypes: boolean) => {
    if (typeof node === 'string') {
      if (inTypes) found.add(node);
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      walk(value, inTypes || key === 'types' || key === 'typings');
    }
  };
  walk(pkg.exports?.['.'], false);
  if (found.size === 0 && pkg.types) found.add(pkg.types);
  return [...found];
};

/** First string leaf in an exports/imports subtree */
const firstStringLeaf = (node: unknown): string | undefined => {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return undefined;
  for (const value of Object.values(node)) {
    const found = firstStringLeaf(value);
    if (found) return found;
  }
  return undefined;
};

/** Resolve a declaration path that may be missing its extension or use a JS one */
const resolveDts = async (base: string): Promise<string | undefined> => {
  // Declaration files reference sibling chunks by their JS specifier (`./chunk.mjs`)
  const jsExt = /\.(?<ext>[mc]?js)$/.exec(base);
  const stem = jsExt ? base.slice(0, -jsExt[0].length) : base;
  const dtsExts = jsExt
    ? [`.d.${jsExt.groups!.ext.replace('js', 'ts')}`]
    : ['.d.ts', '.d.mts', '.d.cts'];
  const candidates = [
    ...(jsExt ? [] : [base]),
    ...dtsExts.map(ext => `${stem}${ext}`),
    ...['index.d.ts', 'index.d.mts', 'index.d.cts'].map(f => join(stem, f)),
  ];
  for (const candidate of candidates) {
    if (await Bun.file(candidate).exists()) return candidate;
  }
  return undefined;
};

let failed = false;

const pkgJsonPaths = [...new Bun.Glob('packages/*/package.json').scanSync('.')].toSorted();

for (const pkgJsonPath of pkgJsonPaths) {
  const pkgDir = dirname(pkgJsonPath);
  const pkg: PackageJson = await Bun.file(pkgJsonPath).json();
  // An optional peer whose `@types/*` counterpart is a real dependency still resolves for
  // consumers who don't install it, so references to it aren't leaks.
  const deps = new Set(Object.keys(pkg.dependencies ?? {}));
  const optionalPeers = new Set(
    Object.entries(pkg.peerDependenciesMeta ?? {})
      .filter(([, meta]) => meta?.optional)
      .map(([name]) => name)
      .filter(name => !deps.has(`@types/${name.replace('@', '').replace('/', '__')}`))
  );
  if (optionalPeers.size === 0) continue;

  /** peer name -> set of declaration files referencing it */
  const leaks = new Map<string, Set<string>>();
  const seen = new Set<string>();
  const queue = defaultTypeEntries(pkg).map(entry => normalize(join(pkgDir, entry)));

  while (queue.length > 0) {
    const dtsPath = queue.pop()!;
    if (seen.has(dtsPath)) continue;
    seen.add(dtsPath);
    const resolved = await resolveDts(dtsPath);
    if (!resolved) {
      console.log(`[unresolved] ${pkg.name} -> ${dtsPath}`);
      continue;
    }
    const text = await Bun.file(resolved).text();
    for (const re of [importRE, inlineImportRE]) {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) {
        const spec = m.groups!.spec;
        const name = pkgNameOf(spec);
        if (!name) {
          // Follow relative declaration chunks and subpath imports
          if (spec.startsWith('.')) {
            queue.push(normalize(join(dirname(resolved), spec)));
          } else if (spec.startsWith('#')) {
            const target = firstStringLeaf(pkg.imports?.[spec]);
            if (target) queue.push(normalize(join(pkgDir, target)));
            else console.log(`[unresolved] ${pkg.name} -> ${spec}`);
          }
          continue;
        }
        if (!optionalPeers.has(name)) continue;
        if (!leaks.has(name)) leaks.set(name, new Set());
        leaks.get(name)!.add(resolved);
      }
    }
  }

  for (const [name, files] of [...leaks].toSorted(([a], [b]) => a.localeCompare(b))) {
    const known = knownLeaks[name]?.includes(pkg.name);
    if (!known) failed = true;
    console.log(`[${known ? 'known' : 'LEAK'}] ${pkg.name} -> ${name} (${files.size} file(s))`);
    if (!known) for (const f of [...files].toSorted()) console.log(`         ${f}`);
  }
}

if (failed) {
  console.log(
    "\nOptional peer deps must not appear in a package's default type entry. Replace the imported " +
      'types with local structural stand-ins, or infer them from caller-supplied arguments.'
  );
  process.exit(1);
}
