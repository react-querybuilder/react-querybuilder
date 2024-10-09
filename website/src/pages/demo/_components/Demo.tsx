import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import CodeBlock from '@theme/CodeBlock';
import Details from '@theme/Details';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import { clsx } from 'clsx';
import queryString from 'query-string';
import type { KeyboardEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { ExportFormat, FormatQueryOptions, SQLPreset } from 'react-querybuilder';
import { QueryBuilder, convertToIC, defaultValidator, formatQuery } from 'react-querybuilder';
import rqbPkgJson from 'react-querybuilder/package.json';
import { parseCEL } from 'react-querybuilder/parseCEL';
import { parseJSONata } from 'react-querybuilder/parseJSONata';
import { parseJsonLogic } from 'react-querybuilder/parseJsonLogic';
import { parseMongoDB } from 'react-querybuilder/parseMongoDB';
import { parseSpEL } from 'react-querybuilder/parseSpEL';
import { parseSQL } from 'react-querybuilder/parseSQL';
import {
  initialQuery as defaultInitialQuery,
  initialQueryIC as defaultInitialQueryIC,
  defaultOptions,
  formatMap,
  optionOrderByLabel,
  optionsMetadata,
  peerDependencies,
} from '../_constants';
import { fields } from '../_constants/fields';
import type { CommonRQBProps, StyleName } from '../_constants/types';
import {
  extraStyles,
  fieldsTsString,
  getCodeString,
  getExportCall,
  getExportDisplayLanguage,
  getFormatQueryString,
  getHashFromState,
  getStateFromHash,
  musicalInstrumentsTsString,
  optionsReducer,
} from '../_constants/utils';
import styles from './Demo.module.css';
import Nav from './Nav';

// TODO: Find out why this is necessary
import type { TabItemProps, TabsProps } from '@docusaurus/theme-common/lib/internal';
import ImportTab from './ImportTab';
declare module '@theme/TabItem' {
  export default function TabItem(props: TabItemProps): JSX.Element;
}
declare module '@theme/Tabs' {
  export default function Tabs(props: TabsProps): JSX.Element;
}

const { version: rqbVersion } = rqbPkgJson;

const infoChar = 'ⓘ';

// const getDocsPreferredVersionDefault = () => localStorage.getItem('docs-preferred-version-default');

// Initialize options from URL hash
const initialStateFromHash = getStateFromHash(queryString.parse(location.hash));
const initialOptionsFromHash = initialStateFromHash.options;
const initialQuery = initialStateFromHash.query ?? defaultInitialQuery;
const initialQueryIC = initialStateFromHash.queryIC ?? defaultInitialQueryIC;

const initialSQL = `SELECT *\n  FROM my_table\n WHERE ${formatQuery(initialQuery, 'sql')};`;
const initialMongoDB = JSON.stringify(
  { firstName: { $regex: '^Stev' }, age: { $gt: 28 } },
  null,
  2
);
const initialSpEL = `firstName matches "^Stev" && age > 28`;
const initialCEL = `firstName.startsWith("Stev") && age > 28`;
const initialJSONata = `$contains(firstName, "Stev") and age > 28`;
const initialJsonLogic = JSON.stringify(formatQuery(initialQuery, 'jsonlogic'), null, 2);

const permalinkText = 'Copy permalink';
const permalinkCopiedText = 'Copied permalink';

interface DemoProps {
  variant?: StyleName;
  queryWrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

const notesSQL = (
  <em>
    SQL can either be the full <code>SELECT</code> statement or the <code>WHERE</code> clause by
    itself. Trailing semicolon is optional.
  </em>
);
const notesMongoDB = (
  <em>
    Input must conform to the <a href="https://www.json.org/">JSON specification</a>. MongoDB
    queries support an extended JSON format, so you may need to pre-parse query strings with a
    library like{' '}
    <a href="https://www.npmjs.com/package/mongodb-query-parser">
      <code>mongodb-query-parser</code>
    </a>
    before submitting them here or passing them to <code>parseMongoDB</code>.
  </em>
);
const notesSpEL = '';
const notesCEL = '';
const notesJSONata = '';
const notesJsonLogic = (
  <em>
    Only strings that evaluate to JavaScript objects when processed with <code>JSON.parse</code>{' '}
    will translate into queries.
  </em>
);

const defaultQueryWrapper = (props: { children: React.ReactNode }) => <>{props.children}</>;

const ExportInfoLinks = ({ format }: { format: ExportFormat }) => {
  const [_0, _1, formatInfo, exportDocsAnchorName] = formatMap.find(([fmt]) => fmt === format)!;
  return (
    <>
      <Link href={`/docs/utils/export#${exportDocsAnchorName}`}>Documentation</Link>
      <Link href={formatInfo}>Format info</Link>
    </>
  );
};

export default function Demo({
  variant = 'default',
  queryWrapper: QueryWrapper = defaultQueryWrapper,
}: DemoProps) {
  // const docsPreferredVersionDefault = useRef(getDocsPreferredVersionDefault());
  const siteLocation = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [format, setFormat] = useState<ExportFormat>('json_without_ids');
  const [sqlDialect, setSQLDialect] = useState<SQLPreset>('ansi');
  const [options, setOptions] = useReducer(optionsReducer, {
    ...defaultOptions,
    ...initialOptionsFromHash,
  });
  const [parseNumbersInExport, setParseNumbersInExport] = useState(false);
  const [sql, setSQL] = useState(initialSQL);
  const [sqlParseError, setSQLParseError] = useState('');
  const [mongoDB, setMongoDB] = useState(initialMongoDB);
  const [mongoDbParseError, setMongoDbParseError] = useState('');
  const [jsonLogic, setJsonLogic] = useState(initialJsonLogic);
  const [jsonLogicParseError, setJsonLogicParseError] = useState('');
  const [spel, setSpEL] = useState(initialSpEL);
  const [spelParseError, setSpELParseError] = useState('');
  const [cel, setCEL] = useState(initialCEL);
  const [celParseError, setCELParseError] = useState('');
  const [jsonata, setJSONata] = useState(initialJSONata);
  const [jsonataParseError, setJSONataParseError] = useState('');
  const [copyPermalinkText, setCopyPermalinkText] = useState(permalinkText);
  const [styleLanguage, setStyleLanguage] = useState<'css' | 'scss'>('scss');

  const [exportCall, setExportCall] = useState('');
  const [codeStringState, setCodeStringState] = useState('');
  const [extraStylesState, setExtraStylesState] = useState({ css: '', scss: '' });
  const [fieldsTsStringState, setFieldsTsStringState] = useState('');
  const [musicalInstrumentsTsStringState, setMusicalInstrumentsTsStringState] = useState('');

  const permalinkHash = useMemo(() => `#${queryString.stringify(options)}`, [options]);

  const updateOptionsFromHash = useCallback((e: HashChangeEvent) => {
    const stateFromHash = getStateFromHash(
      queryString.parse(
        queryString.parseUrl(e.newURL, { parseFragmentIdentifier: true }).fragmentIdentifier ?? ''
      )
    );
    const payload = { ...defaultOptions, ...stateFromHash.options };
    setOptions({ type: 'replace', payload });
    if (stateFromHash.query) {
      setQuery(stateFromHash.query);
    }
    if (stateFromHash.queryIC) {
      setQueryIC(stateFromHash.queryIC);
    }
    // TODO: handle `style`
  }, []);

  useEffect(() => {
    history.pushState(null, '', permalinkHash);
    window.addEventListener('hashchange', updateOptionsFromHash);

    return () => window.removeEventListener('hashchange', updateOptionsFromHash);
  }, [permalinkHash, updateOptionsFromHash]);

  useEffect(() => {
    Promise.all([extraStyles(), fieldsTsString, musicalInstrumentsTsString]).then(
      ([es, fs, ms]) => {
        setExtraStylesState(es);
        setFieldsTsStringState(fs);
        setMusicalInstrumentsTsStringState(ms);
      }
    );
  }, []);

  useEffect(() => {
    getCodeString(options, variant, styleLanguage).then(cs => setCodeStringState(cs));
  }, [options, styleLanguage, variant]);

  useEffect(() => {
    getExportCall(
      {
        format,
        parseNumbers: parseNumbersInExport,
        preset: sqlDialect,
      },
      { validateQuery: options.validateQuery }
    ).then(ec => setExportCall(ec));
  }, [format, options.validateQuery, parseNumbersInExport, sqlDialect]);

  const optionsInfo = useMemo(
    () =>
      optionOrderByLabel.map(opt => ({
        ...optionsMetadata[opt],
        name: opt,
        default: defaultOptions[opt],
        checked: options[opt],
        setter: (v: boolean) =>
          setOptions({
            type: 'update',
            payload: { optionName: opt, value: v },
          }),
      })),
    [options]
  );

  const formatOptions = useMemo(
    (): FormatQueryOptions => ({
      format,
      fields: options.validateQuery || format === 'natural_language' ? fields : undefined,
      parseNumbers: parseNumbersInExport,
      preset: sqlDialect,
    }),
    [format, options.validateQuery, parseNumbersInExport, sqlDialect]
  );
  const q = options.independentCombinators ? queryIC : query;
  const formatString = useMemo(() => getFormatQueryString(q, formatOptions), [formatOptions, q]);

  const getExportTabAttributes = useCallback(
    (fmt: ExportFormat, others: ExportFormat[] = []) => {
      let func = () => setFormat(fmt);
      if (others.length > 0) {
        func = () => {
          if (format === fmt || others.includes(format)) {
            return;
          }
          setFormat(fmt);
        };
      }
      return {
        onMouseUp: func,
        onKeyUp: (e: KeyboardEvent<HTMLLIElement>) => {
          if (e.key === 'Enter') {
            func();
          }
        },
      };
    },
    [format]
  );

  const exportPresentation = useMemo(
    () => (
      <>
        <h4>Call</h4>
        <CodeBlock>{exportCall}</CodeBlock>
        <h4>Return</h4>
        <CodeBlock language={getExportDisplayLanguage(format)} className={styles.wsPreWrap}>
          {formatString}
        </CodeBlock>
      </>
    ),
    [exportCall, format, formatString]
  );

  const parseNumbersOption = (
    <>
      <span>&nbsp;</span>
      <div className={styles.demoOption}>
        <label title="Parse numbers">
          <input
            type="checkbox"
            disabled={options.disabled}
            checked={parseNumbersInExport}
            onChange={e => !options.disabled && setParseNumbersInExport(e.target.checked)}
          />
          {` Parse numbers `}
          <Link
            href="/docs/utils/export#parse-numbers"
            title="Click for documentation"
            style={{ textDecoration: 'none' }}>
            {infoChar}
          </Link>
        </label>
      </div>
    </>
  );

  const packageNames = useMemo(
    () => [
      'react-querybuilder',
      ...(options.enableDragAndDrop ? ['@react-querybuilder/dnd', ...peerDependencies.dnd] : []),
      ...(variant === 'default'
        ? []
        : [`@react-querybuilder/${variant}`, ...peerDependencies[variant]]),
    ],
    [options.enableDragAndDrop, variant]
  );

  const loadFromSQL = () => {
    try {
      const q = parseSQL(sql);
      const qIC = parseSQL(sql, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setSQLParseError('');
    } catch (err) {
      setSQLParseError((err as Error).message);
    }
  };
  const loadFromMongoDB = () => {
    try {
      const q = parseMongoDB(mongoDB);
      const qIC = convertToIC(q);
      setQuery(q);
      setQueryIC(qIC);
      setMongoDbParseError('');
    } catch (err) {
      setMongoDbParseError((err as Error).message);
    }
  };
  const loadFromJsonLogic = () => {
    try {
      const q = parseJsonLogic(jsonLogic);
      const qIC = convertToIC(q);
      setQuery(q);
      setQueryIC(qIC);
      setJsonLogicParseError('');
    } catch (err) {
      setJsonLogicParseError((err as Error).message);
    }
  };
  const loadFromSpEL = () => {
    try {
      const q = parseSpEL(spel);
      const qIC = parseSpEL(spel, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setSpELParseError('');
    } catch (err) {
      setSpELParseError((err as Error).message);
    }
  };
  const loadFromCEL = () => {
    try {
      const q = parseCEL(cel);
      const qIC = parseCEL(cel, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setCELParseError('');
    } catch (err) {
      setCELParseError((err as Error).message);
    }
  };
  const loadFromJSONata = () => {
    try {
      const q = parseJSONata(jsonata);
      const qIC = parseJSONata(jsonata, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setJSONataParseError('');
    } catch (err) {
      setJSONataParseError((err as Error).message);
    }
  };

  const _getPermalinkUncompressed = () =>
    `${location.origin}${siteLocation.pathname}${permalinkHash}`;

  const getCompressedState = () =>
    encodeURIComponent(
      getHashFromState({
        query,
        queryIC,
        options,
        style: variant,
      })
    );

  const getPermalinkCompressed = () =>
    `${location.origin}${siteLocation.pathname}#s=${getCompressedState()}`;

  const onClickCopyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(getPermalinkCompressed());
      setCopyPermalinkText(permalinkCopiedText);
    } catch (e) {
      console.error('Clipboard error', e);
    }
    setTimeout(() => setCopyPermalinkText(permalinkText), 1214);
  };

  const commonRQBProps = useMemo((): CommonRQBProps => {
    const { independentCombinators: _ic, ...opts } = options;
    return {
      fields,
      ...opts,
      validator: opts.validateQuery ? defaultValidator : undefined,
      parseNumbers: opts.parseNumbers ? 'strict-limited' : false,
    };
  }, [options]);

  const qbWrapperId = `rqb-${variant}`;
  const qbWrapperClassName = useMemo(
    () =>
      clsx(
        {
          validateQuery: options.validateQuery,
          justifiedLayout: options.justifiedLayout,
          'queryBuilder-branches': options.showBranches,
        },
        variant === 'default' ? '' : qbWrapperId
      ),
    [options.justifiedLayout, options.showBranches, options.validateQuery, qbWrapperId, variant]
  );

  return (
    <div className={styles.demoLayout}>
      <div>
        <h3>
          <Link
            href={'/docs/components/querybuilder'}
            title={'Boolean props on the QueryBuilder component (click for documentation)'}
            className={styles.demoSidebarHeader}>
            <span>Options</span>
            <span>{infoChar}</span>
          </Link>
        </h3>
        <div>
          {optionsInfo.map(({ checked, label, link, setter, title }) => (
            <div key={label} className={styles.demoOption}>
              <label>
                <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
                {` ${label}`}
              </label>
              {link ? (
                <Link
                  href={`${link}`}
                  title={`${title} (click for documentation)`}
                  style={{ textDecoration: 'none' }}>
                  {infoChar}
                </Link>
              ) : (
                <span title={title} style={{ cursor: 'pointer' }}>
                  {infoChar}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className={styles.demoOptionCommands}>
          <div title="Reset the options above to their default values">
            <button type="button" onClick={() => setOptions({ type: 'reset' })}>
              Reset
            </button>
          </div>
          <div
            title={`Enable all features except "${optionsMetadata.disabled.label}" and "${optionsMetadata.independentCombinators.label}"`}>
            <button type="button" onClick={() => setOptions({ type: 'all' })}>
              Select all
            </button>
          </div>
          <div title="Copy a URL that will load this demo with the same query and the options as currently set">
            <button type="button" onClick={onClickCopyPermalink}>
              {copyPermalinkText}
            </button>
          </div>
        </div>
        <div>
          <code style={{ fontSize: '8pt', marginBottom: 'var(--ifm-global-spacing)' }}>
            react-querybuilder@{rqbVersion}
          </code>
        </div>
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', rowGap: 'var(--ifm-global-spacing)' }}>
        <Nav variant={variant} compressedState={getCompressedState()} />
        <div id={qbWrapperId} className={qbWrapperClassName}>
          <QueryWrapper>
            <QueryBuilderDnD>
              {options.independentCombinators ? (
                <QueryBuilder
                  key="queryIC"
                  {...commonRQBProps}
                  query={queryIC}
                  onQueryChange={setQueryIC}
                />
              ) : (
                <QueryBuilder
                  key="query"
                  {...commonRQBProps}
                  query={query}
                  onQueryChange={setQuery}
                />
              )}
            </QueryBuilderDnD>
          </QueryWrapper>
        </div>
        <Tabs
          defaultValue="code"
          values={[
            { value: 'code', label: 'Code' },
            { value: 'export', label: 'Export' },
            { value: 'import', label: 'Import' },
          ]}>
          <TabItem value="code" label="Code">
            <Details summary={<summary>Dependencies</summary>}>
              <Tabs>
                <TabItem value="npm" label="npm">
                  <CodeBlock language="shell">npm install {packageNames.join(' ')}</CodeBlock>
                </TabItem>
                <TabItem value="bun" label="Bun">
                  <CodeBlock language="shell">bun add {packageNames.join(' ')}</CodeBlock>
                </TabItem>
                <TabItem value="yarn" label="Yarn">
                  <CodeBlock language="shell">yarn add {packageNames.join(' ')}</CodeBlock>
                </TabItem>
                <TabItem value="pnpm" label="pnpm">
                  <CodeBlock language="shell">pnpm add {packageNames.join(' ')}</CodeBlock>
                </TabItem>
              </Tabs>
            </Details>
            <CodeBlock language="tsx" title="App.tsx">
              {codeStringState}
            </CodeBlock>
            <Details summary={<summary>Styles</summary>}>
              <div className={styles.exportOptions}>
                <label key="scss">
                  <input
                    type="radio"
                    checked={styleLanguage === 'scss'}
                    onChange={() => setStyleLanguage('scss')}
                  />{' '}
                  SCSS
                </label>
                <label key="css">
                  <input
                    type="radio"
                    checked={styleLanguage === 'css'}
                    onChange={() => setStyleLanguage('css')}
                  />{' '}
                  CSS
                </label>
              </div>
              <CodeBlock language={styleLanguage} title={`styles.${styleLanguage}`}>
                {extraStylesState[styleLanguage]}
              </CodeBlock>
            </Details>
            <Details summary={<summary>Other files</summary>}>
              <CodeBlock language="ts" title="fields.ts">
                {fieldsTsStringState}
              </CodeBlock>
              <CodeBlock language="ts" title="musicalInstruments.ts">
                {musicalInstrumentsTsStringState}
              </CodeBlock>
            </Details>
          </TabItem>
          <TabItem value="export" label="Export">
            <Tabs
              defaultValue="json"
              values={[
                {
                  value: 'json',
                  label: 'JSON',
                  attributes: getExportTabAttributes('json_without_ids', ['json']),
                },
                {
                  value: 'sql',
                  label: 'SQL',
                  attributes: getExportTabAttributes('sql', [
                    'parameterized',
                    'parameterized_named',
                  ]),
                },
                {
                  value: 'mongodb',
                  label: 'MongoDB',
                  attributes: getExportTabAttributes('mongodb'),
                },
                { value: 'cel', label: 'CEL', attributes: getExportTabAttributes('cel') },
                { value: 'spel', label: 'SpEL', attributes: getExportTabAttributes('spel') },
                {
                  value: 'jsonlogic',
                  label: 'JsonLogic',
                  attributes: getExportTabAttributes('jsonlogic'),
                },
                {
                  value: 'elasticsearch',
                  label: 'ElasticSearch',
                  attributes: getExportTabAttributes('elasticsearch'),
                },
                {
                  value: 'jsonata',
                  label: 'JSONata',
                  attributes: getExportTabAttributes('jsonata'),
                },
                {
                  value: 'natural_language',
                  label: 'Natural language',
                  attributes: getExportTabAttributes('natural_language'),
                },
              ]}>
              <TabItem value="json">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="json" />
                  <span>&nbsp;</span>
                  <label key="json_without_ids">
                    <input
                      type="radio"
                      checked={format === 'json_without_ids'}
                      onChange={() => setFormat('json_without_ids')}
                    />{' '}
                    Without <code>id</code> or <code>path</code>
                  </label>
                  <label key="json">
                    <input
                      type="radio"
                      checked={format === 'json'}
                      onChange={() => setFormat('json')}
                    />{' '}
                    Full query object
                  </label>
                  {parseNumbersOption}
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="sql">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="sql" />
                  <span>&nbsp;</span>
                  <label key="sql">
                    <input
                      type="radio"
                      checked={format === 'sql'}
                      onChange={() => setFormat('sql')}
                    />{' '}
                    Inline
                  </label>
                  <label key="parameterized">
                    <input
                      type="radio"
                      checked={'parameterized' === format}
                      onChange={() => setFormat('parameterized')}
                    />{' '}
                    Parameterized
                  </label>
                  <label key="parameterized_named">
                    <input
                      type="radio"
                      checked={'parameterized_named' === format}
                      onChange={() => setFormat('parameterized_named')}
                    />{' '}
                    Named parameters
                  </label>
                  <div>
                    <label>
                      Dialect{' '}
                      <Link
                        href="/docs/utils/export#presets"
                        title="Click for documentation"
                        style={{ textDecoration: 'none' }}>
                        {infoChar}
                      </Link>{' '}
                      <select
                        value={sqlDialect}
                        onChange={e => setSQLDialect(e.target.value as SQLPreset)}>
                        <option value="ansi">ANSI (default)</option>
                        <option value="mssql">SQL Server</option>
                        <option value="mysql">MySQL</option>
                        <option value="oracle">Oracle</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="sqlite">SQLite</option>
                      </select>
                    </label>
                  </div>
                  {parseNumbersOption}
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="mongodb">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="mongodb" />
                  {parseNumbersOption}
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="cel">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="cel" />
                  {parseNumbersOption}
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="spel">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="spel" />
                  {parseNumbersOption}
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="jsonlogic">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="jsonlogic" />
                  {parseNumbersOption}
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="elasticsearch">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="elasticsearch" />
                  {parseNumbersOption}
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="jsonata">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="jsonata" />
                </div>
                {exportPresentation}
              </TabItem>
              <TabItem value="natural_language">
                <div className={styles.exportOptions}>
                  <ExportInfoLinks format="natural_language" />
                </div>
                {exportPresentation}
              </TabItem>
            </Tabs>
          </TabItem>
          <TabItem value="import">
            <Tabs
              defaultValue="sql"
              values={[
                { value: 'sql', label: 'SQL' },
                { value: 'mongodb', label: 'MongoDB' },
                { value: 'jsonlogic', label: 'JsonLogic' },
                { value: 'spel', label: 'SpEL' },
                { value: 'cel', label: 'CEL' },
                { value: 'jsonata', label: 'JSONata' },
              ]}>
              <TabItem value="sql">
                <ImportTab
                  heading="Import SQL"
                  code={sql}
                  setCode={setSQL}
                  error={sqlParseError}
                  loadQueryFromCode={loadFromSQL}
                  notes={notesSQL}
                />
              </TabItem>
              <TabItem value="mongodb">
                <ImportTab
                  heading="Import MongoDB"
                  code={mongoDB}
                  setCode={setMongoDB}
                  error={mongoDbParseError}
                  loadQueryFromCode={loadFromMongoDB}
                  notes={notesMongoDB}
                />
              </TabItem>
              <TabItem value="jsonlogic">
                <ImportTab
                  heading="Import JsonLogic"
                  code={jsonLogic}
                  setCode={setJsonLogic}
                  error={jsonLogicParseError}
                  loadQueryFromCode={loadFromJsonLogic}
                  notes={notesJsonLogic}
                />
              </TabItem>
              <TabItem value="spel">
                <ImportTab
                  heading="Import SpEL"
                  code={spel}
                  setCode={setSpEL}
                  error={spelParseError}
                  loadQueryFromCode={loadFromSpEL}
                  notes={notesSpEL}
                />
              </TabItem>
              <TabItem value="cel">
                <ImportTab
                  heading="Import CEL"
                  code={cel}
                  setCode={setCEL}
                  error={celParseError}
                  loadQueryFromCode={loadFromCEL}
                  notes={notesCEL}
                />
              </TabItem>
              <TabItem value="jsonata">
                <ImportTab
                  heading="Import JSONata"
                  code={jsonata}
                  setCode={setJSONata}
                  error={jsonataParseError}
                  loadQueryFromCode={loadFromJSONata}
                  notes={notesJSONata}
                />
              </TabItem>
            </Tabs>
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
}
