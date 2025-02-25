/* eslint-disable unicorn/no-process-exit, unicorn/no-await-expression-member */

import { $, file, Glob, semver, write } from 'bun';
import { version as typeFestVersion } from 'type-fest/package.json';

$.cwd(import.meta.dir);

const checkMode = process.argv.includes('--check');
const forceMode = process.argv.includes('--force');

const srcTypeFestDir = `${import.meta.dir}/../node_modules/type-fest/source`;
const rqbTypeFestDir = `${import.meta.dir}/../packages/react-querybuilder/src/types/type-fest`;

// Capture contents of type-fest/README.md
const rqbTypeFestReadMe = await file(`${rqbTypeFestDir}/README.md`).text();

// Capture contents of current type-fest/index.ts
const rqbTypeFestIndex = file(`${rqbTypeFestDir}/index.ts`);
const rqbTypeFestIndexContents = await rqbTypeFestIndex.text();

// Parse out the version the current files were copied from
const versionRegExp = /^(\/\/ Version) (.*)$/im;
const rqbTypeFestVersion = rqbTypeFestIndexContents.match(versionRegExp)?.[2] ?? '0.0.0';

const semverOrder = semver.order(rqbTypeFestVersion, typeFestVersion);

if (forceMode) {
  console.log('Forcing update of vendored type-fest...');
} else {
  if (semverOrder === 0) {
    if (checkMode) {
      console.log('Vendored type-fest is up to date with latest release.');
    } else {
      console.log('Skipping vendored type-fest update--already up to date with latest release.');
    }
    process.exit(0);
  }

  if (semverOrder > 0) {
    console.error(
      `Error: vendored type-fest version ${rqbTypeFestVersion} is higher than the latest npm version ${typeFestVersion}.`
    );
    process.exit(1);
  }

  if (semverOrder < 0 && checkMode) {
    console.error(
      `Vendored type-fest, copied from ${rqbTypeFestVersion}, is behind latest release ${typeFestVersion}.`
    );
    console.error('Run `bun ./utils/update-type-fest.ts` to update.');
    process.exit(1);
  }
}

console.log(`Updating vendored type-fest from ${rqbTypeFestVersion} to ${typeFestVersion}...`);

const removeCategoryTags = async (filePath: string) =>
  (await file(filePath).text()).replaceAll(/@category .*\n/g, '');

// Get list of files to copy from source
const rqbTypeFestFileList = rqbTypeFestIndexContents
  .matchAll(/'\.\/(.*)'/g)
  .toArray()
  .map(re => re[1]);

// Remove and recreate existing type-fest folder
await $`rm -rf ${rqbTypeFestDir}`;
await $`mkdir -p ${rqbTypeFestDir}/internal`;

// Copy source .d.ts files as .ts
for (const f of rqbTypeFestFileList) {
  await write(`${rqbTypeFestDir}/${f}.ts`, await removeCategoryTags(`${srcTypeFestDir}/${f}.d.ts`));
}

// Copy all source/internal/*.d.ts files as .ts
const dtsGlob = new Glob(`*.d.ts`);
const srcTypeFestInternalFiles = dtsGlob.scan(`${srcTypeFestDir}/internal`);
for await (const f of srcTypeFestInternalFiles) {
  await write(
    `${rqbTypeFestDir}/internal/${f.replace(/\.d\.ts$/, '.ts')}`,
    await removeCategoryTags(`${srcTypeFestDir}/internal/${f}`)
  );
}

// Rebuild type-fest/README.md
await write(`${rqbTypeFestDir}/README.md`, rqbTypeFestReadMe);

// Rebuild type-fest/index.ts with source version number
await write(
  rqbTypeFestIndex,
  rqbTypeFestIndexContents.replace(versionRegExp, `$1 ${typeFestVersion}`)
);

console.log(
  `Completed update of vendored type-fest from ${rqbTypeFestVersion} to ${typeFestVersion}.`
);
