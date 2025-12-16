import * as prettierPluginOxc from '@prettier/plugin-oxc';

/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: 'avoid',
  plugins: [prettierPluginOxc, 'prettier-plugin-organize-imports'],
};
