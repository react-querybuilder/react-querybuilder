import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { clsx } from 'clsx';
import queryString from 'query-string';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { ExportFormat, FormatQueryOptions } from 'react-querybuilder';
import {
  convertToIC,
  defaultValidator,
  formatQuery,
  parseCEL,
  parseJsonLogic,
  parseMongoDB,
  parseSQL,
  QueryBuilder,
  version as rqbVersion,
} from 'react-querybuilder';
import {
  defaultOptions,
  fields,
  formatMap,
  initialQuery as defaultInitialQuery,
  initialQueryIC as defaultInitialQueryIC,
  optionOrderByLabel,
  optionsMetadata,
} from '../_constants';
import type { CommonRQBProps, StyleName } from '../_constants/types';
import {
  getFormatQueryString,
  getHashFromState,
  getStateFromHash,
  optionsReducer,
} from '../_constants/utils';
import styles from './Demo.module.css';
import ImportModal from './ImportModal';
import Nav from './Nav';

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
        { validateQuery: options.validateQuery, justifiedLayout: options.justifiedLayout },
        variant === 'default' ? '' : `rqb-${variant}`
      ),
    [options.justifiedLayout, options.validateQuery, variant]
  );

  return (
    <div className={styles.demoLayout}>
      <div>
        <h3>
          <Link
            href={'/docs/api/querybuilder'}
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
                {label}
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
            href={'/docs/api/export'}
            title={'The export format of the formatQuery function (click for documentation)'}
            className={styles.demoSidebarHeader}>
            <span>Export</span>
            <span>{infoChar}</span>
          </Link>
        </h3>
        <div style={{ marginBottom: 'var(--ifm-heading-margin-bottom)' }}>
          {formatMap.map(([fmt, lbl, lnk]) => (
            <div
              key={fmt}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}>
              <label>
                <input type="radio" checked={format === fmt} onChange={() => setFormat(fmt)} />
                {lbl}
              </label>
              <Link
                href={lnk}
                title={`formatQuery(query, "${fmt}") (click for information)`}
                style={{ textDecoration: 'none' }}>
                {infoChar}
              </Link>
            </div>
          ))}
        </div>
        <h3>
          <Link
            href={'/docs/api/import'}
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
        <Nav
          variant={variant}
          dnd={options.enableDragAndDrop}
          compressedState={getCompressedState()}
        />
        <div id={qbWrapperId} className={qbWrapperClassName}>
          <QueryWrapper>
            <QueryBuilderDnD>
              {options.independentCombinators ? (
                <QueryBuilder
                  {...commonRQBProps}
                  independentCombinators
                  key={'queryIC'}
                  query={queryIC}
                  onQueryChange={q => setQueryIC(q)}
                />
              ) : (
                <QueryBuilder
                  {...commonRQBProps}
                  independentCombinators={false}
                  key={'query'}
                  query={query}
                  onQueryChange={q => setQuery(q)}
                />
              )}
            </QueryBuilderDnD>
          </QueryWrapper>
        </div>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{formatString}</pre>
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
