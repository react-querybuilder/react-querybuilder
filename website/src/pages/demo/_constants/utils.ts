// import justifiedStylesCSS from '!!raw-loader!@site/src/css/justified.css';
import demoStylesCSS from '!!raw-loader!@site/src/pages/demo/_styles/demo.css';
// @ts-expect-error !!raw-loader!
import fieldsCode from '!!raw-loader!@site/src/pages/demo/_constants/fields';
// @ts-expect-error !!raw-loader!
import musicalInstrumentsCode from '!!raw-loader!@site/src/pages/demo/_constants/musicalInstruments';
// oxlint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer';
import clsx from 'clsx';
import pako from 'pako';
import prettierPluginEstree from 'prettier/plugins/estree';
import * as parserPostCSS from 'prettier/plugins/postcss.js';
import * as parserTypeScript from 'prettier/plugins/typescript.js';
import * as prettier from 'prettier/standalone.js';
import type { ExportFormat, FormatQueryOptions, RuleGroupTypeAny } from 'react-querybuilder';
import {
  bigIntJsonParseReviver,
  bigIntJsonStringifyReplacer,
  defaultOperators,
  formatQuery,
  standardClassnames,
} from 'react-querybuilder';
import { defaultOptions, optionOrder } from './index';
import type { DemoOption, DemoOptions, DemoOptionsHash, DemoState, StyleName } from './types';

// const extraStylesCSS = `${demoStylesCSS}\n\n${justifiedStylesCSS}`;
const extraStylesCSS = demoStylesCSS;

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
  Buffer.from(pako.deflate(JSON.stringify(s, bigIntJsonStringifyReplacer))).toString('base64');

export const unzip = (b64string: string) => {
  const buff = Buffer.from(b64string, 'base64');
  const result = pako.inflate(buff, { to: 'string' });
  return JSON.parse(result, bigIntJsonParseReviver);
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
  switch (action.type) {
    case 'reset': {
      return defaultOptions;
    }
    case 'all': {
      const allSelected: DemoOptions = { ...defaultOptions };
      for (const opt of optionOrder) {
        allSelected[opt] =
          opt !== 'disabled' &&
          opt !== 'independentCombinators' &&
          opt !== 'suppressStandardClassnames';
      }
      return allSelected;
    }
    case 'replace': {
      return action.payload;
    }
  }
  const { optionName, value } = action.payload;
  return { ...state, [optionName]: value };
};

// Cache for expensive formatting operations
const formatQueryCache = new Map();

const stringify = (o: unknown) =>
  JSON.stringify(o, bigIntJsonStringifyReplacer, 2).replaceAll(
    /\{\s*"\$bigint":\s*"(\d+)"\s*\}/gm,
    '$1n'
  );

export const getFormatQueryString = (query: RuleGroupTypeAny, options: FormatQueryOptions) => {
  const cacheKey = JSON.stringify([query, options]);

  if (formatQueryCache.has(cacheKey)) {
    return formatQueryCache.get(cacheKey);
  }

  const result = formatQueryUncached(query, options);

  // Limit cache size to prevent memory leaks
  if (formatQueryCache.size > 50) {
    const firstKey = formatQueryCache.keys().next().value;
    formatQueryCache.delete(firstKey);
  }

  formatQueryCache.set(cacheKey, result);
  return result;
};

// Rename existing function
const formatQueryUncached = (query: RuleGroupTypeAny, options: FormatQueryOptions) => {
  const formatQueryResult = formatQuery(
    query,
    options.format === 'jsonata'
      ? { ...options, parseNumbers: true }
      : options.format === 'natural_language'
        ? { ...options, parseNumbers: true, getOperators: () => defaultOperators }
        : options
  );

  switch (options.format) {
    case 'json':
    case 'json_without_ids':
    case 'ldap':
    case 'mongodb':
    case 'natural_language': {
      return `\`${JSON.stringify(formatQueryResult)
        .replaceAll(String.raw`\n`, '\n')
        .replaceAll(String.raw`\"`, '"')
        .replaceAll('`', '\\`')
        .slice(1, -1)}\``;
    }
    case 'mongodb_query':
    case 'parameterized':
    case 'parameterized_named':
    case 'jsonlogic':
    case 'elasticsearch':
    case 'prisma':
      return stringify(formatQueryResult);
  }

  return formatQueryResult;
};

export const getExportCall = async (
  { format, parseNumbers, preset, placeholderValueName }: FormatQueryOptions,
  { validateQuery }: Pick<DemoOptions, 'validateQuery'>
) => {
  const rqbImports = ['formatQuery'];
  if (format === 'natural_language') {
    rqbImports.push('defaultOperators');
  }
  const fqOpts: FormatQueryOptions = { format };

  if (
    (format === 'sql' || format === 'parameterized' || format === 'parameterized_named') &&
    preset !== 'ansi'
  ) {
    fqOpts.preset = preset;
  }

  if (parseNumbers || format === 'jsonata') {
    fqOpts.parseNumbers = true;
  }

  if (placeholderValueName !== undefined) {
    fqOpts.placeholderValueName = placeholderValueName;
  }

  let optionsString = Object.keys(fqOpts).length > 1 ? JSON.stringify(fqOpts) : `'${format}'`;

  if (validateQuery || format === 'natural_language') {
    optionsString = optionsString.replace('}', ', fields }');
  }

  if (format === 'natural_language') {
    optionsString = optionsString.replace('}', ', getOperators: () => defaultOperators }');
  }

  return prettier.format(
    `import { ${rqbImports.join(', ')} } from 'react-querybuilder';
${validateQuery || format === 'natural_language' ? `import { fields } from './fields';\n` : ''}
formatQuery(query, ${optionsString})`,
    {
      filepath: 'exportCall.ts',
      plugins: [parserTypeScript, prettierPluginEstree],
      singleQuote: true,
    }
  );
};

export const getExportDisplayLanguage = (format: ExportFormat) => {
  switch (format) {
    case 'sql':
    case 'cel':
    case 'spel':
    case 'jsonata':
      return format;

    case 'mongodb_query':
      return 'mongodb';

    case 'json':
    case 'json_without_ids':
    case 'ldap':
    case 'mongodb':
    case 'natural_language':
      return 'js';
  }

  return 'json';
};

const getCompatWrapper = (style?: StyleName): [string, string, string] => {
  switch (style) {
    case 'antd': {
      return [
        `import { QueryBuilderAntD } from '@react-querybuilder/antd';`,
        '<QueryBuilderAntD>',
        '</QueryBuilderAntD>',
      ];
    }
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
    prop === 'autoSelectField' ||
    prop === 'autoSelectOperator' ||
    prop === 'autoSelectValue' ||
    prop === 'resetOnFieldChange'
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
    getPropText('autoSelectValue'),
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
    getPropText('showShiftActions'),
    getPropText('suppressStandardClassnames'),
    getPropText('useDateTimePackage'),
    options.validateQuery ? 'validator={defaultValidator}' : '',
    options.showBranches || options.justifiedLayout
      ? `controlClassnames={{ queryBuilder: '${clsx({
          [standardClassnames.branches]: options.showBranches,
          [standardClassnames.justified]: options.justifiedLayout,
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
import * as ReactDndTouchBackend from 'react-dnd-touch-backend';
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
      ? '<QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend, ...ReactDndTouchBackend }}>'
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

export const extraStyles = () =>
  prettier.format(extraStylesCSS, {
    filepath: 'styles.css',
    plugins: [parserPostCSS],
    printWidth: 100,
  });

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
