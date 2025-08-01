// Adapted from https://gist.github.com/sikanhe/f9ac68dd4c78c914c29cc98e7b875466

import { readFileSync } from 'node:fs';
import * as babel from '@babel/core';
import type { Plugin } from 'esbuild';
import QuickLRU from 'quick-lru';

const BabelPluginReactCompiler = require('babel-plugin-react-compiler');

export const ReactCompilerEsbuildPlugin = ({
  filter,
  sourceMaps,
}: {
  filter: RegExp;
  sourceMaps: boolean;
}): Plugin => ({
  name: 'esbuild-react-compiler-plugin',
  setup(build) {
    // Cache previous outputs for incremental rebuilds
    const buildCache = new QuickLRU<string, string>({ maxSize: 1000 });

    let timings: number[] = [];

    build.onEnd(() => {
      if (timings.length === 0) return;

      const totalTime = timings.reduce((sum, x) => sum + x, 0).toFixed(0);
      console.log(`[⚛️ React Compiler] ${timings.length} files changed in ${totalTime} ms`);

      timings = [];
    });

    build.onLoad({ filter, namespace: '' }, args => {
      const contents = readFileSync(args.path, 'utf8');

      const t0 = performance.now();

      if (buildCache.has(contents)) {
        return {
          contents: buildCache.get(contents),
          loader: 'js',
        };
      }

      const output = build.esbuild.transformSync(contents, {
        loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
        jsx: 'automatic',
        define: build.initialOptions.define,
        target: build.initialOptions.target,
      });

      const transformResult = babel.transformSync(output.code, {
        plugins: [[BabelPluginReactCompiler, { target: '18' }]],
        filename: args.path,
        caller: {
          name: 'esbuild-react-compiler-plugin',
          supportsStaticESM: true,
        },
        // TODO: figure out sourcemap setting and chaining
        sourceMaps,
      });

      timings.push(performance.now() - t0);

      if (transformResult?.code) {
        buildCache.set(contents, transformResult?.code);
      }

      return {
        contents: transformResult?.code ?? undefined,
        loader: 'js',
      };
    });
  },
});
