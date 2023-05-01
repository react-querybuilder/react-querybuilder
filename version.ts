/// <reference types="bun-types" />

import { readdir } from 'fs/promises';

const { version } = import.meta.require('./lerna.json');

const packagesDir = `${import.meta.dir}/packages`;

const packages = (await readdir(packagesDir, { withFileTypes: true })).filter(
  p => p.isDirectory() && p.name !== 'react-querybuilder'
);

for (const pkg of packages) {
  const pkgJsonPath = `${packagesDir}/${pkg.name}/package.json`;
  const pkgJson = await Bun.file(pkgJsonPath).text();
  const replacedRqbPeerDep = pkgJson.replaceAll(
    /(\s+"react-querybuilder":\s+").+(")/g,
    `$1^${version}$2`
  );
  await Bun.write(pkgJsonPath, replacedRqbPeerDep);
}

console.log('Finished updating local package dependency versions.');
