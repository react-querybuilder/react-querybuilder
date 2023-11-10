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
import type { ExportFormat, FormatQueryOptions } from 'react-querybuilder';
import {
  QueryBuilder,
  convertToIC,
  defaultValidator,
  formatQuery,
  objectKeys,
  parseCEL,
  parseJsonLogic,
  parseMongoDB,
  parseSQL,
} from 'react-querybuilder';
import rqbPkgJson from 'react-querybuilder/package.json';
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
  getExportDisplayLanguage,
  getFormatQueryString,
  getHashFromState,
  getStateFromHash,
  musicalInstrumentsTsString,
  optionsReducer,
} from '../_constants/utils';
import styles from './Demo.module.css';
import ImportModal from './ImportModal';
import Nav from './Nav';

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
const initialCEL = `firstName.startsWith("Stev") && age > 28`;
const initialJsonLogic = JSON.stringify(formatQuery(initialQuery, 'jsonlogic'), null, 2);

const permalinkText = 'Copy link';
const permalinkCopiedText = 'Copied!';

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
const notesCEL = '';
const notesJsonLogic = (
  <em>
    Only strings that evaluate to JavaScript objects when processed with <code>JSON.parse</code>{' '}
    will translate into queries.
  </em>
);

const defaultQueryWrapper = (props: { children: React.ReactNode }) => <>{props.children}</>;

const ExportInfoLinks = ({ format }: { format: ExportFormat }) => {
  const formatInfo = formatMap.find(([fmt]) => fmt === format);
  return (
    <>
      <Link href={`/docs/utils/export#${formatInfo[3]}`}>Documentation</Link>
      <Link href={formatInfo[2]}>Format info</Link>
    </>
  );
};

const { label: pnlabel, link: pnlink, title: pntitle } = optionsMetadata.parseNumbers;
const ParseNumbersOption = ({
  checked,
  setter,
}: {
  checked: boolean;
  setter: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <>
      <span>&nbsp;</span>
      <div className={styles.demoOption}>
        <label title={pntitle}>
          <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
          {` ${pnlabel} `}
          <Link
            href={`${pnlink}`}
            title="Click for documentation"
            style={{ textDecoration: 'none' }}>
            {infoChar}
          </Link>
        </label>
      </div>
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
  const [options, setOptions] = useReducer(optionsReducer, {
    ...defaultOptions,
    ...initialOptionsFromHash,
  });
  const [isSQLInputVisible, setIsSQLInputVisible] = useState(false);
  const [sql, setSQL] = useState(initialSQL);
  const [sqlParseError, setSQLParseError] = useState('');
  const [isMongoDbInputVisible, setIsMongoDbInputVisible] = useState(false);
  const [mongoDB, setMongoDB] = useState(initialMongoDB);
  const [mongoDbParseError, setMongoDbParseError] = useState('');
  const [isCELInputVisible, setIsCELInputVisible] = useState(false);
  const [cel, setCEL] = useState(initialCEL);
  const [celParseError, setCELParseError] = useState('');
  const [isJsonLogicInputVisible, setIsJsonLogicInputVisible] = useState(false);
  const [jsonLogic, setJsonLogic] = useState(initialJsonLogic);
  const [jsonLogicParseError, setJsonLogicParseError] = useState('');
  const [copyPermalinkText, setCopyPermalinkText] = useState(permalinkText);
  const [styleLanguage, setStyleLanguage] = useState<'css' | 'scss'>('scss');

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
      fields: options.validateQuery ? fields : undefined,
      parseNumbers: options.parseNumbers,
    }),
    [format, options.parseNumbers, options.validateQuery]
  );
  const q = options.independentCombinators ? queryIC : query;
  const formatString = useMemo(() => getFormatQueryString(q, formatOptions), [formatOptions, q]);

  const codeString = useMemo(
    () => getCodeString(options, variant, styleLanguage),
    [options, variant, styleLanguage]
  );

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
        <CodeBlock>
          {`formatQuery(query, ${
            options.parseNumbers ? `{ format: '${format}', parseNumbers: true }` : `'${format}'`
          })`}
        </CodeBlock>
        <h4>Return</h4>
        <CodeBlock language={getExportDisplayLanguage(format)} className={styles.wsPreWrap}>
          {formatString}
        </CodeBlock>
      </>
    ),
    [format, formatString, options.parseNumbers]
  );

  const { setter: pnSetter } = useMemo(
    () => optionsInfo.find(opt => opt.name === 'parseNumbers'),
    [optionsInfo]
  );

  const packageNames = useMemo(
    () => [
      'react-querybuilder',
      ...(options.enableDragAndDrop
        ? [
            '@react-querybuilder/dnd',
            ...objectKeys(peerDependencies.dnd).filter(
              pd => pd !== 'react' && pd !== 'react-querybuilder'
            ),
          ]
        : []),
      ...(variant === 'default'
        ? []
        : [
            `@react-querybuilder/${variant}`,
            ...objectKeys(peerDependencies[variant]).filter(
              pd => pd !== 'react' && pd !== 'react-querybuilder'
            ),
          ]),
    ],
    [options.enableDragAndDrop, variant]
  );

  const loadFromSQL = () => {
    try {
      const q = parseSQL(sql);
      const qIC = parseSQL(sql, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setIsSQLInputVisible(false);
      setSQLParseError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setIsMongoDbInputVisible(false);
      setMongoDbParseError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMongoDbParseError((err as Error).message);
    }
  };
  const loadFromCEL = () => {
    try {
      const q = parseCEL(cel);
      const qIC = parseCEL(cel, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setIsCELInputVisible(false);
      setCELParseError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setCELParseError((err as Error).message);
    }
  };
  const loadFromJsonLogic = () => {
    try {
      const q = parseJsonLogic(jsonLogic);
      const qIC = convertToIC(q);
      setQuery(q);
      setQueryIC(qIC);
      setIsJsonLogicInputVisible(false);
      setJsonLogicParseError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setJsonLogicParseError((err as Error).message);
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

  const commonRQBProps = useMemo(
    (): CommonRQBProps => ({
      fields,
      ...options,
      validator: options.validateQuery ? defaultValidator : undefined,
    }),
    [options]
  );

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
          {optionsInfo
            .filter(opt => opt.name !== 'parseNumbers')
            .map(({ checked, label, link, setter, title }) => (
              <div key={label} className={styles.demoOption}>
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => setter(e.target.checked)}
                  />
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
          <div
            title={
              'Copy a URL that will load this demo with the options set as they are currently'
            }>
            <button type="button" onClick={onClickCopyPermalink}>
              {copyPermalinkText}
            </button>
          </div>
        </div>
        <h3>
          <Link
            href={'/docs/utils/import'}
            title={
              'Use the parse* methods to set the query from SQL/JsonLogic/etc. (click for documentation)'
            }
            className={styles.demoSidebarHeader}>
            <span>Import</span>
            <span>{infoChar}</span>
          </Link>
        </h3>
        <div className={styles.demoImportCommands}>
          <button type="button" onClick={() => setIsSQLInputVisible(true)}>
            Import SQL
          </button>
          <button type="button" onClick={() => setIsMongoDbInputVisible(true)}>
            Import MongoDB
          </button>
          <button type="button" onClick={() => setIsCELInputVisible(true)}>
            Import CEL
          </button>
          <button type="button" onClick={() => setIsJsonLogicInputVisible(true)}>
            Import JsonLogic
          </button>
          <div>
            <code style={{ fontSize: '8pt', marginBottom: 'var(--ifm-global-spacing)' }}>
              react-querybuilder@{rqbVersion}
            </code>
          </div>
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
                  {...commonRQBProps}
                  key={'queryIC'}
                  query={queryIC}
                  onQueryChange={setQueryIC}
                />
              ) : (
                <QueryBuilder
                  {...commonRQBProps}
                  key={'query'}
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
            {
              value: 'sql',
              label: 'SQL',
              attributes: getExportTabAttributes('sql', ['parameterized', 'parameterized_named']),
            },
            {
              value: 'json',
              label: 'JSON',
              attributes: getExportTabAttributes('json_without_ids', ['json']),
            },
            { value: 'mongodb', label: 'MongoDB', attributes: getExportTabAttributes('mongodb') },
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
          ]}>
          <TabItem value="code" label="Code">
            <Details summary={<summary>Dependencies</summary>}>
              <p>
                The selected options require the following package{packageNames.length > 1 && 's'}:
              </p>
              <CodeBlock language="shell">{packageNames.join(' ')}</CodeBlock>
              <p>
                Registry link{packageNames.length > 1 && 's'}:{' '}
                {packageNames.map(packageName => (
                  <span key={packageName}>
                    {' '}
                    <a
                      href={`https://www.npmjs.com/package/${packageName}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.demoNavPackageLink}>
                      {packageName}
                    </a>
                  </span>
                ))}
              </p>
            </Details>
            <CodeBlock language="tsx" title="App.tsx">
              {codeString}
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
                {extraStyles[styleLanguage]}
              </CodeBlock>
            </Details>
            <Details summary={<summary>Other files</summary>}>
              <CodeBlock language="ts" title="fields.ts">
                {fieldsTsString}
              </CodeBlock>
              <CodeBlock language="ts" title="musicalInstruments.ts">
                {musicalInstrumentsTsString}
              </CodeBlock>
            </Details>
          </TabItem>
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
                Essential properties only
              </label>
              <label key="json">
                <input
                  type="radio"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                />{' '}
                Full query object
              </label>
              <ParseNumbersOption checked={options.parseNumbers} setter={pnSetter} />
            </div>
            {exportPresentation}
          </TabItem>
          <TabItem value="sql">
            <div className={styles.exportOptions}>
              <ExportInfoLinks format="sql" />
              <span>&nbsp;</span>
              <label key="sql">
                <input type="radio" checked={format === 'sql'} onChange={() => setFormat('sql')} />{' '}
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
              <ParseNumbersOption checked={options.parseNumbers} setter={pnSetter} />
            </div>
            {exportPresentation}
          </TabItem>
          <TabItem value="mongodb">
            <div className={styles.exportOptions}>
              <ExportInfoLinks format="mongodb" />
              <ParseNumbersOption checked={options.parseNumbers} setter={pnSetter} />
            </div>
            {exportPresentation}
          </TabItem>
          <TabItem value="cel">
            <div className={styles.exportOptions}>
              <ExportInfoLinks format="cel" />
              <ParseNumbersOption checked={options.parseNumbers} setter={pnSetter} />
            </div>
            {exportPresentation}
          </TabItem>
          <TabItem value="spel">
            <div className={styles.exportOptions}>
              <ExportInfoLinks format="spel" />
              <ParseNumbersOption checked={options.parseNumbers} setter={pnSetter} />
            </div>
            {exportPresentation}
          </TabItem>
          <TabItem value="jsonlogic">
            <div className={styles.exportOptions}>
              <ExportInfoLinks format="jsonlogic" />
              <ParseNumbersOption checked={options.parseNumbers} setter={pnSetter} />
            </div>
            {exportPresentation}
          </TabItem>
          <TabItem value="elasticsearch">
            <div className={styles.exportOptions}>
              <ExportInfoLinks format="elasticsearch" />
              <ParseNumbersOption checked={options.parseNumbers} setter={pnSetter} />
            </div>
            {exportPresentation}
          </TabItem>
        </Tabs>
      </div>
      <ImportModal
        heading="Import SQL"
        isOpen={isSQLInputVisible}
        setIsOpen={setIsSQLInputVisible}
        code={sql}
        setCode={setSQL}
        error={sqlParseError}
        loadQueryFromCode={loadFromSQL}
        notes={notesSQL}
      />
      <ImportModal
        heading="Import MongoDB"
        isOpen={isMongoDbInputVisible}
        setIsOpen={setIsMongoDbInputVisible}
        code={mongoDB}
        setCode={setMongoDB}
        error={mongoDbParseError}
        loadQueryFromCode={loadFromMongoDB}
        notes={notesMongoDB}
      />
      <ImportModal
        heading="Import CEL"
        isOpen={isCELInputVisible}
        setIsOpen={setIsCELInputVisible}
        code={cel}
        setCode={setCEL}
        error={celParseError}
        loadQueryFromCode={loadFromCEL}
        notes={notesCEL}
      />
      <ImportModal
        heading="Import JsonLogic"
        isOpen={isJsonLogicInputVisible}
        setIsOpen={setIsJsonLogicInputVisible}
        code={jsonLogic}
        setCode={setJsonLogic}
        error={jsonLogicParseError}
        loadQueryFromCode={loadFromJsonLogic}
        notes={notesJsonLogic}
      />
    </div>
  );
}
