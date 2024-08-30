// @ts-expect-error !!raw-loader!
import demoStylesSCSS from '!!raw-loader!@site/src/pages/demo/_styles/demo.scss';
// @ts-expect-error !!raw-loader!
import justifiedStylesSCSS from '!!raw-loader!@site/src/css/justified.scss';
// @ts-expect-error !!raw-loader!
import fieldsCode from '!!raw-loader!@site/src/pages/demo/_constants/fields';
// @ts-expect-error !!raw-loader!
import musicalInstrumentsCode from '!!raw-loader!@site/src/pages/demo/_constants/musicalInstruments';
import { Buffer } from 'buffer';
import pako from 'pako';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as parserPostCSS from 'prettier/plugins/postcss.js';
import * as parserTypeScript from 'prettier/plugins/typescript.js';
import * as prettierStandalone from 'prettier/standalone.js';
import type { ExportFormat, FormatQueryOptions, RuleGroupTypeAny } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { defaultOptions, optionOrder } from './index';
import type { DemoOption, DemoOptions, DemoOptionsHash, DemoState, StyleName } from './types';
import clsx from 'clsx';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const prettier = prettierStandalone as typeof import('prettier');

const extraStylesSCSS = `${demoStylesSCSS}\n\n${justifiedStylesSCSS}`;

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
  const formatQueryResult = formatQuery(
    query,
    options.format === 'jsonata' ? { ...options, parseNumbers: true } : options
  );
  if (options.format === 'json_without_ids' || options.format === 'mongodb') {
    return JSON.stringify(JSON.parse(formatQueryResult), null, 2);
  } else if (
    options.format === 'parameterized' ||
    options.format === 'parameterized_named' ||
    options.format === 'jsonlogic' ||
    options.format === 'elasticsearch'
  ) {
    return JSON.stringify(formatQueryResult, null, 2);
  }
  return formatQueryResult;
};

export const getExportDisplayLanguage = (format: ExportFormat) =>
  format === 'sql' ||
  format === 'cel' ||
  format === 'spel' ||
  format === 'mongodb' ||
  format === 'jsonata'
    ? format
    : 'json';

const getCompatWrapper = (style?: StyleName): [string, string, string] => {
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
    case 'mantine':
      return [
        `import { MantineProvider } from '@mantine/core';
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import '@mantine/core/styles.css';`,
        '<MantineProvider>\n<QueryBuilderMantine>',
        '</QueryBuilderMantine>\n</MantineProvider>',
      ];
    case 'tremor':
      return [
        `import { QueryBuilderTremor } from '@react-querybuilder/tremor';`,
        '<QueryBuilderTremor>',
        '</QueryBuilderTremor>',
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

  const getPropText = (prop: keyof DemoOptions) =>
    prop === 'autoSelectField' || prop === 'autoSelectOperator' || prop === 'resetOnFieldChange'
      ? options[prop]
        ? ''
        : `${prop}={false}`
      : prop === 'parseNumbers'
        ? options[prop]
          ? `${prop}="strict-limited"`
          : ''
        : options[prop]
          ? prop
          : '';

  const props = [
    'fields={fields}',
    'query={query}',
    'onQueryChange={setQuery}',
    getPropText('addRuleToNewGroups'),
    getPropText('autoSelectField'),
    getPropText('autoSelectOperator'),
    getPropText('debugMode'),
    getPropText('disabled'),
    getPropText('listsAsArrays'),
    getPropText('parseNumbers'),
    getPropText('resetOnFieldChange'),
    getPropText('resetOnOperatorChange'),
    getPropText('showCloneButtons'),
    getPropText('showCombinatorsBetweenRules'),
    getPropText('showLockButtons'),
    getPropText('showNotToggle'),
    options.validateQuery ? 'validator={defaultValidator}' : '',
    options.showBranches || options.justifiedLayout
      ? `controlClassnames={{ queryBuilder: '${clsx({
          'queryBuilder-branches': options.showBranches,
          justifiedLayout: options.justifiedLayout,
        })}' }}`
      : '',
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
    plugins: [parserTypeScript, prettierPluginEstree],
    singleQuote: true,
  });
};

export const extraStyles = async () => {
  const { compileString } = await import('sass');
  return Promise.all([
    prettier.format(compileString(extraStylesSCSS).css, {
      filepath: 'styles.css',
      plugins: [parserPostCSS],
      printWidth: 100,
    }),
    prettier.format(extraStylesSCSS, {
      filepath: 'styles.scss',
      plugins: [parserPostCSS],
      printWidth: 100,
    }),
  ]).then(([css, scss]) => ({ css, scss }));
};

export const fieldsTsString = prettier.format(fieldsCode, {
  filepath: 'fields.ts',
  plugins: [parserTypeScript, prettierPluginEstree],
  singleQuote: true,
});

export const musicalInstrumentsTsString = prettier.format(musicalInstrumentsCode, {
  filepath: 'musicalInstrumentsCode.ts',
  plugins: [parserTypeScript, prettierPluginEstree],
  singleQuote: true,
});
