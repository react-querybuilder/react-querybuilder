import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslintParser from '@typescript-eslint/parser';
import eslintPluginOxlint from 'eslint-plugin-oxlint';
import eslintPluginReactCompiler from 'eslint-plugin-react-compiler';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

export default [
  {
    ignores: [
      'packages/*/dist/',
      'packages/react-querybuilder/src/utils/**/*Parser.js',
      'packages/react-querybuilder/src/types/type-fest/',
    ],
  },
  ...fixupConfigRules(compat.extends('plugin:react-hooks/recommended')),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-compiler': eslintPluginReactCompiler,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslintParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
  ...eslintPluginOxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
];
