import { readdir } from 'node:fs/promises';

const { version } = await Bun.file('./lerna.json').json();

const packagesDir = `${import.meta.dir}/../packages`;

const packages = (await readdir(packagesDir, { withFileTypes: true })).filter(
  p => p.isDirectory() && p.name !== 'react-querybuilder'
);

await Promise.all(
  packages.map(async ({ name }) => {
    const pkgJsonPath = `${packagesDir}/${name}/package.json`;
    const pkgJson = await Bun.file(pkgJsonPath).text();
    const replacedRqbDeps = pkgJson.replaceAll(
      /(\s+"react-querybuilder":\s+").+(",?)/g,
      `$1^${version}$2`
    );
    return Bun.write(pkgJsonPath, replacedRqbDeps);
  })
);

console.log('Finished updating local `react-querybuilder` dependency versions.');
