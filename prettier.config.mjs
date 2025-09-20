/** @type {import("prettier").Options} */
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
  plugins: ['prettier-plugin-organize-imports'],
  overrides: [
    {
      files: 'examples/*/**/*.!(css|scss)*',
      options: {
        printWidth: 80,
      },
    },
  ],
};
