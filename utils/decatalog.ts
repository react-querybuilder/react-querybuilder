#!/usr/bin/env bun

import { Glob } from 'bun';
import path from 'node:path';
import { catalog, catalogs } from '../package.json' assert { type: 'json' };

const glob = new Glob('packages/*/package.json');

for await (const pkgPkgJsonPath of glob.scan({ cwd: path.join(import.meta.dir, '..') })) {
  let ppj = await Bun.file(pkgPkgJsonPath).text();

  for (const [dep, ver] of Object.entries(catalog)) {
    const re = new RegExp(`"${dep}":(\\s*)"catalog:"`, 'g');
    ppj = ppj.replaceAll(re, `"${dep}":$1"${ver}"`);
  }

  for (const [name, cat] of Object.entries(catalogs)) {
    for (const [dep, ver] of Object.entries(cat)) {
      const re = new RegExp(`"${dep}":(\\s*)"catalog:${name}"`, 'g');
      ppj = ppj.replaceAll(re, `"${dep}":$1"${ver}"`);
    }
  }

  // console.log(`--- ${pkgPkgJsonPath} ---`);
  // const { dependencies, devDependencies, peerDependencies } = JSON.parse(ppj);
  // console.log(JSON.stringify({ dependencies, devDependencies, peerDependencies }, null, 2));

  await Bun.write(pkgPkgJsonPath, ppj);
}
