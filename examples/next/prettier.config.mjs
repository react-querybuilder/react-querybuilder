/** @type {import("prettier").Options} */
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: "avoid",
  overrides: [
    {
      files: "app/**/*.{s,}css",
      options: {
        printWidth: 100,
      },
    },
  ],
};
