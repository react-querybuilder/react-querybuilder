// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import extraStylesCSS from '!!raw-loader!@site/src/pages/demo/_styles/demo.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import extraStylesSCSS from '!!raw-loader!@site/src/pages/demo/_styles/demo.scss';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fieldsCode from '!!raw-loader!@site/src/pages/demo/_constants/fields';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import musicalInstrumentsCode from '!!raw-loader!@site/src/pages/demo/_constants/musicalInstruments';
import { Buffer } from 'buffer';
import pako from 'pako';
import parserPostCSS from 'prettier/esm/parser-postcss.mjs';
import parserTypeScript from 'prettier/esm/parser-typescript.mjs';
import prettier from 'prettier/esm/standalone.mjs';
import type { ExportFormat, FormatQueryOptions, RuleGroupTypeAny } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { defaultOptions, optionOrder } from './index';
import type { DemoOption, DemoOptions, DemoOptionsHash, DemoState, StyleName } from './types';

type OptionsAction =
  | { type: 'all' }
  | { type: 'reset' }
  | {
      type: 'update';
      payload: {
        optionName: DemoOption;
        value: boolean;
      };
    }
  | {
      type: 'replace';
      payload: DemoOptions;
    };

export const getHashFromState = (s: DemoState) =>
  Buffer.from(pako.deflate(JSON.stringify(s))).toString('base64');

export const unzip = (b64string: string) => {
  const buff = Buffer.from(b64string, 'base64');
  const result = pako.inflate(buff, { to: 'string' });
  return JSON.parse(result);
};

export const getStateFromHash = ({ s, ...hash }: DemoOptionsHash): DemoState => {
  let state: DemoState | null = null;
  if (s) {
    state = unzip(s);
  }
  const hashOptions = Object.fromEntries(
    Object.entries(hash).map(([opt, val]) => [opt, val === 'true'])
  );
  return { ...state, options: { ...state?.options, ...hashOptions } };
};

export const optionsReducer = (state: DemoOptions, action: OptionsAction): DemoOptions => {
  if (action.type === 'reset') {
    return defaultOptions;
  } else if (action.type === 'all') {
    const allSelected: DemoOptions = { ...defaultOptions };
    for (const opt of optionOrder) {
      allSelected[opt] = opt !== 'disabled' && opt !== 'independentCombinators';
    }
    return allSelected;
  } else if (action.type === 'replace') {
    return action.payload;
  }
  const { optionName, value } = action.payload;
  return { ...state, [optionName]: value };
};

export const getFormatQueryString = (query: RuleGroupTypeAny, options: FormatQueryOptions) => {
  const formatQueryResult = formatQuery(query, options);
  if (options.format === 'json_without_ids' || options.format === 'mongodb') {
    return JSON.stringify(JSON.parse(formatQueryResult), null, 2);
  } else if (
    options.format === 'parameterized' ||
    options.format === 'parameterized_named' ||
    options.format === 'jsonlogic'
  ) {
    return JSON.stringify(formatQueryResult, null, 2);
  }
  return formatQueryResult;
};

export const getExportDisplayLanguage = (format: ExportFormat) =>
  format === 'sql' || format === 'cel' || format === 'spel' ? format : 'json';

const getCompatWrapper = (style: StyleName): [string, string, string] => {
  switch (style) {
    case 'antd':
      return [
        `import { QueryBuilderAntD } from '@react-querybuilder/antd';`,
        '<QueryBuilderAntD>',
        '</QueryBuilderAntD>',
      ];
    case 'bootstrap':
      return [
        `import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.scss';
import 'bootstrap/scss/bootstrap.scss';`,
        '<QueryBuilderBootstrap>',
        '</QueryBuilderBootstrap>',
      ];
    case 'bulma':
      return [
        `import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import 'bulma/bulma.sass';`,
        '<QueryBuilderBulma>',
        '</QueryBuilderBulma>',
      ];
    case 'chakra':
      return [
        `import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const chakraTheme = extendTheme();`,
        '<ChakraProvider theme={chakraTheme}>\n<QueryBuilderChakra>',
        '</QueryBuilderChakra>\n</ChakraProvider>',
      ];
    case 'fluent':
      return [
        `import { QueryBuilderFluent } from '@react-querybuilder/fluent';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';`,
        '<FluentProvider theme={webLightTheme}>\n<QueryBuilderFluent>',
        '</QueryBuilderFluent>\n</FluentProvider>',
      ];
    case 'material':
      return [
        `import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';

const muiTheme = createTheme();
`,
        '<ThemeProvider theme={muiTheme}>\n<QueryBuilderMaterial>',
        '</QueryBuilderMaterial>\n</ThemeProvider>',
      ];
  }
  return ['', '', ''];
};

export const getCodeString = (
  options: DemoOptions,
  style?: StyleName,
  styleLanguage: 'css' | 'scss' = 'scss'
) => {
  const queryType = `RuleGroupType${options.independentCombinators ? 'IC' : ''}`;
  const dndIndent = options.enableDragAndDrop ? '  ' : '';
  const styleIndent = style && style !== 'default' ? '  ' : '';
  const [styleImport, styleWrapperPrefix, styleWrapperSuffix] = getCompatWrapper(style);

  const getPropText = (prop: keyof DemoOptions) => {
    if (
      prop === 'autoSelectField' ||
      prop === 'autoSelectOperator' ||
      prop === 'resetOnFieldChange'
    ) {
      return options[prop] ? '' : `${prop}={false}`;
    }
    return options[prop] ? prop : '';
  };

  const props = [
    'fields={fields}',
    'query={query}',
    'onQueryChange={q => setQuery(q)}',
    getPropText('addRuleToNewGroups'),
    getPropText('autoSelectField'),
    getPropText('autoSelectOperator'),
    getPropText('debugMode'),
    getPropText('disabled'),
    getPropText('independentCombinators'),
    getPropText('listsAsArrays'),
    getPropText('resetOnFieldChange'),
    getPropText('resetOnOperatorChange'),
    getPropText('showCloneButtons'),
    getPropText('showCombinatorsBetweenRules'),
    getPropText('showLockButtons'),
    getPropText('showNotToggle'),
    options.validateQuery ? 'validator={defaultValidator}' : '',
    options.showBranches ? `controlClassnames={{ queryBuilder: 'queryBuilder-branches' }}` : '',
  ]
    .filter(Boolean)
    .map(opt => `\n      ${dndIndent}${styleIndent}${opt}`)
    .join('');

  const rawCode = `import { useState } from 'react';
${
  options.enableDragAndDrop
    ? `import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
`
    : ''
}import type { ${queryType} } from 'react-querybuilder';
import {${
    options.validateQuery ? 'defaultValidator, ' : ''
  } QueryBuilder } from 'react-querybuilder';
import { fields } from './fields';
import 'react-querybuilder/dist/query-builder.${styleLanguage}';
import './styles.${styleLanguage}';${styleImport ? `\n${styleImport}` : ''}

const initialQuery: ${queryType} = {${
    options.independentCombinators ? '' : ` combinator: 'and',`
  } rules: [] };

export const App = () => {
  const [query, setQuery] = useState(initialQuery);

  return (${
    options.enableDragAndDrop
      ? '<QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>'
      : ''
  }${styleWrapperPrefix}<QueryBuilder ${props} />${styleWrapperSuffix}${
    options.enableDragAndDrop ? '</QueryBuilderDnD>' : ''
  }
  );
}`;

  return prettier.format(rawCode, {
    filepath: 'App.tsx',
    plugins: [parserTypeScript],
    singleQuote: true,
  });
};

export const extraStyles = {
  css: prettier.format(extraStylesCSS, {
    filepath: 'styles.css',
    plugins: [parserPostCSS],
    printWidth: 100,
  }),
  scss: prettier.format(extraStylesSCSS, {
    filepath: 'styles.scss',
    plugins: [parserPostCSS],
    printWidth: 100,
  }),
};

export const fieldsTsString = prettier.format(fieldsCode, {
  filepath: 'fields.ts',
  plugins: [parserTypeScript],
  singleQuote: true,
});

export const musicalInstrumentsTsString = prettier.format(musicalInstrumentsCode, {
  filepath: 'musicalInstrumentsCode.ts',
  plugins: [parserTypeScript],
  singleQuote: true,
});
