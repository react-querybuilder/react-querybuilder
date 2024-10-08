import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslintParser from '@typescript-eslint/parser';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactCompiler from 'eslint-plugin-react-compiler';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

export default [
  {
    ignores: ['**/dist/', '**/*Parser.js'],
  },
  ...fixupConfigRules(compat.extends('plugin:react-hooks/recommended')),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginUnicorn.configs['flat/recommended'],
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
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/display-name': 'off',
      'react/jsx-key': ['warn', { checkKeyMustBeforeSpread: true }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unstable-nested-components': 'error',
      'react-compiler/react-compiler': 'error',
      'unicorn/catch-error-name': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-export-from': ['error', { ignoreUsedVariables: true }],
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-number-properties': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/consistent-existence-index-check': 'off',
    },
  },
];
