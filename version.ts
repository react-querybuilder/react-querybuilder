export {};

const { version } = await Bun.file('./lerna.json').json();

const packagesDir = `${import.meta.dir}/packages`;

const pkgJsonPaths = (await Bun.$`ls packages`.text())
  .split('\n')
  .filter(Boolean)
  .filter(p => p !== 'react-querybuilder')
  .map(p => `${packagesDir}/${p}/package.json`);

pkgJsonPaths.push(`${import.meta.dir}/website/package.json`);

await Promise.all([
  ...pkgJsonPaths.map(async pkgJsonPath => {
    const pkgJson = await Bun.file(pkgJsonPath).text();
    const replacedRqbDeps = pkgJson.replaceAll(
      /(\s+"@?react-querybuilder(?:\/\w+)?":\s+").+(",?)/g,
      `$1${version}$2`
    );
    return Bun.write(pkgJsonPath, replacedRqbDeps);
  }),
]);

console.log('Finished updating local `react-querybuilder` dependency versions.');
