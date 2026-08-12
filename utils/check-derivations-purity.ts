/**
 * Asserts that the `@react-querybuilder/core/derivations` subpath stays pure.
 *
 * The subpath exists so framework adapters that own their own state can import the pure
 * derivations without pulling `QueryManager` (or the formatter/parser surfaces) into their bundle.
 * That guarantee is a property of the module graph, not of the bundler's mood, so it gets a gate:
 * without one, the first `import { ... } from './QueryManager'` added to a derivation module would
 * silently undo it.
 *
 * Both the ESM and CJS builds are checked, following relative chunk imports transitively. Two
 * signals are used:
 *
 * 1. rolldown's `//#region <source path>` markers, which name every source module that survived
 *    tree-shaking into a chunk. Checked against {@link forbiddenModuleRE}.
 * 2. A scan for forbidden identifiers in comment-stripped code, which catches a bundler that stops
 *    emitting region markers.
 *
 * Run via `bun check-derivations-purity` (after `bun run build`).
 */
/* oxlint-disable no-await-in-loop -- sequential by nature: chunk graph traversal */
import { dirname, join, normalize, relative } from 'node:path';

const distDir = join(import.meta.dirname, '../packages/core/dist');

const entryPoints = ['derivations.mjs', 'derivations.js'];

/**
 * Source modules that must never reach the subpath. `formatQuery/utils.ts` is deliberately
 * allowed: `processMatchMode` lives there but is a pure helper that `prepareQueryObjects` depends
 * on, and it drags in none of the formatter.
 */
const forbiddenModuleRE =
  /^src\/utils\/(?:QueryManager\.ts|parse[A-Z]\w*\/|formatQuery\/(?!utils\.ts))/;

/** Identifiers that must not appear in executable code. */
const forbiddenIdentifierRE = /\b(?:QueryManager|QueryManagerError|formatQuery)\b/;

const regionRE = /^\/\/#region (?<mod>.+)$/gm;
const importRE = /^\s*(?:import|export)\b[^;]*?\bfrom\s*["'](?<spec>[^"']+)["']/gm;
const sideEffectImportRE = /^\s*import\s*["'](?<spec>[^"']+)["']/gm;
const dynamicImportRE = /\bimport\(\s*["'](?<spec>[^"']+)["']\s*\)/g;
const requireRE = /\brequire\(\s*["'](?<spec>[^"']+)["']\s*\)/g;

/** Good enough to defeat doc comments; false positives here would only be extra strictness. */
const stripComments = (code: string) =>
  code.replaceAll(/\/\*[^]*?\*\//g, '').replaceAll(/^\s*\/\/.*$/gm, '');

/** Files reachable from `entry` through relative specifiers, including `entry` itself. */
const moduleGraph = async (entry: string): Promise<Map<string, string>> => {
  const seen = new Map<string, string>();
  const queue = [normalize(entry)];

  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;

    const code = await Bun.file(file).text();
    seen.set(file, code);

    for (const match of [
      ...code.matchAll(importRE),
      ...code.matchAll(sideEffectImportRE),
      ...code.matchAll(dynamicImportRE),
      ...code.matchAll(requireRE),
    ]) {
      const spec = match.groups!.spec;
      if (spec.startsWith('.')) queue.push(normalize(join(dirname(file), spec)));
    }
  }

  return seen;
};

let failed = false;

for (const entryPoint of entryPoints) {
  const graph = await moduleGraph(join(distDir, entryPoint));

  for (const [file, code] of graph) {
    const where = `dist/${relative(distDir, file)}`;

    for (const match of code.matchAll(regionRE)) {
      const mod = match.groups!.mod;
      if (!forbiddenModuleRE.test(mod)) continue;
      failed = true;
      console.error(`${entryPoint}: ${mod} was bundled into ${where}.`);
    }

    const identifier = forbiddenIdentifierRE.exec(stripComments(code));
    if (identifier) {
      failed = true;
      console.error(`${entryPoint}: "${identifier[0]}" appears in the code of ${where}.`);
    }
  }

  if (!failed) {
    console.log(`${entryPoint}: clean (${graph.size} module${graph.size === 1 ? '' : 's'}).`);
  }
}

if (failed) {
  console.error(
    '\nThe /derivations subpath must not reach QueryManager, formatQuery, or the parsers. Either ' +
      'drop the offending import from packages/core/src/derivations.ts (and the modules it ' +
      're-exports), or move the shared code into a module of its own, as was done for ' +
      '`strictAbortReasons`.'
  );
  process.exit(1);
}
