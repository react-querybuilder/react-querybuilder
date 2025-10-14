import type { BunPlugin } from 'bun';
import { compileAsync } from 'sass';

export const sassPlugin: BunPlugin = {
  name: 'sass',
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, async ({ path }) => {
      const { css } = await compileAsync(path, {
        // loadPaths: [`${import.meta.dir}/../../packages/`],
      });
      return {
        contents: css,
        loader: 'css',
      };
    });
  },
};

export default sassPlugin;
