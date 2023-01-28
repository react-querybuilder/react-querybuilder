/** @ts-check */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

/** @type {import("webpack").ConfigurationFactory} */
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          'react-querybuilder',
          '@react-querybuilder/ctx',
          '@react-querybuilder/native',
        ],
      },
    },
    argv
  );
  return config;
};
