import path from 'node:path';
import { version } from '../lerna.json' with { type: 'json' };

const packagesDir = `${import.meta.dirname}/../packages`;

Bun.$.cwd(path.join(import.meta.dirname, '..'));

const pkgNames = await Bun.$`ls packages`.text();
const pkgJsonPaths = pkgNames
  .split('\n')
  .filter(p => !!p && p !== 'react-querybuilder')
  .map(p => `${packagesDir}/${p}/package.json`);

await Promise.all(
  pkgJsonPaths.map(async pkgJsonPath => {
    const pkgJson = await Bun.file(pkgJsonPath).text();
    const replacedRqbDeps = pkgJson.replaceAll(
      // skip @react-querybuilder/grafeo (versioned independently)
      /^(\s+"@?react-querybuilder(?:\/(?!grafeo")[a-z-]+)?":\s+")[^w].+(",?)$/gm,
      `$1${version}$2`
    );
    return Bun.write(pkgJsonPath, replacedRqbDeps);
  })
);

console.log('Finished updating local `react-querybuilder` dependency versions.');
