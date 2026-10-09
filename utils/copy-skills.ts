/**
 * Copies `<repo>/skills/` into `<cwd>/skills/` (package build step). Usage, from a package dir:
 * `bun ../../utils/copy-skills.ts`
 */
import { rm } from 'node:fs/promises';
import path from 'node:path';

const src = path.join(import.meta.dirname, '../skills');
const dest = path.join(process.cwd(), 'skills');

if (path.resolve(src) === path.resolve(dest)) throw new Error('Run from a package directory');

await rm(dest, { recursive: true, force: true });

let count = 0;
for await (const rel of new Bun.Glob('*/**/*').scan({ cwd: src, onlyFiles: true })) {
  // Skip test/dev-only content
  if (rel.split('/').some(p => p.startsWith('__') || p.startsWith('.'))) continue;
  await Bun.write(path.join(dest, rel), Bun.file(path.join(src, rel)));
  count++;
}

console.log(`Copied ${count} skill files to ${path.relative(process.cwd(), dest) || dest}`);
