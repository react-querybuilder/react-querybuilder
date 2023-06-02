/// <reference types="bun-types" />

import { readdir } from 'fs/promises';

const { version } = import.meta.require('./lerna.json');

const packagesDir = `${import.meta.dir}/packages`;

const packages = (await readdir(packagesDir, { withFileTypes: true })).filter(
  p => p.isDirectory() && p.name !== 'react-querybuilder'
);

for (const { name } of packages) {
  const pkgJsonPath = `${packagesDir}/${name}/package.json`;
  const pkgJson = await Bun.file(pkgJsonPath).text();
  const replacedRqbDeps = pkgJson.replaceAll(
    /(\s+"react-querybuilder":\s+").+(")/g,
    `$1^${version}$2`
  );
  await Bun.write(pkgJsonPath, replacedRqbDeps);
}

console.log('Finished updating local package dependency versions.');
