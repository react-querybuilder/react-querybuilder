#!/usr/bin/env bun

import { Glob } from 'bun';
import path from 'node:path';
import { catalog, catalogs } from '../package.json' assert { type: 'json' };

const glob = new Glob('packages/*/package.json');
const pkgPaths = await Array.fromAsync(glob.scan({ cwd: path.join(import.meta.dir, '..') }));

const catalogReplacements = Object.entries(catalog).map(([dep, ver]) => ({
  regex: new RegExp(`"${dep}":(\\s*)"catalog:"`, 'g'),
  replacement: `"${dep}":$1"${ver}"`,
}));

const namedCatalogReplacements = Object.entries(catalogs).flatMap(([name, cat]) =>
  Object.entries(cat).map(([dep, ver]) => ({
    regex: new RegExp(`"${dep}":(\\s*)"catalog:${name}"`, 'g'),
    replacement: `"${dep}":$1"${ver}"`,
  }))
);

const allReplacements = [...catalogReplacements, ...namedCatalogReplacements];

await Promise.all(
  pkgPaths.map(async pkgPkgJsonPath => {
    let ppj = await Bun.file(pkgPkgJsonPath).text();

    for (const { regex, replacement } of allReplacements) {
      ppj = ppj.replaceAll(regex, replacement);
    }

    await Bun.write(pkgPkgJsonPath, ppj);
  })
);
