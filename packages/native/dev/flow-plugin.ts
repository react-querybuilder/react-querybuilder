/// <reference types="bun-types" />
/* eslint-disable @typescript-eslint/no-var-requires */

import type { BunPlugin } from 'bun';
// import flowRemoveTypesI from 'flow-remove-types';
// import { readFileSync } from 'fs';

export const bunPluginFlowRemoveTypes = {
  name: 'flow',
  setup(build) {
    const flowRemoveTypes = require('flow-remove-types');
    const { readFileSync } = require('fs');
    build.onLoad({ filter: /\.jsx?$/ }, ({ path }) => {
      // const contents = await Bun.file(path).text();
      const contents = readFileSync(path, 'utf-8');
      if (/\/\*(?:[ ^*]|\**[^*/])*@flow(?:[ ^*]|\**[^*/])*\*+\//g.test(contents)) {
        console.log(path);
        return {
          contents: flowRemoveTypes(contents, { pretty: true })
            .toString()
            .replaceAll(
              /require\(['"]\.(.*)['"]\)(;?)/g,
              `require('${path.replace(/\/\w+\.jsx?$/, '')}$1.js')$2`
            ),
          // .replaceAll(/require\(('|")\.\//g, `require($1${path.replace(/\/\w+\.jsx?$/, '/')}`),
          // .split('\n')
          // .filter((s: string) => !s.match(/^(ex|im)port type(of)? /))
          // .join('\n'),
          loader: 'jsx',
        };
      }
      return { contents };
    });
  },
} satisfies BunPlugin;
