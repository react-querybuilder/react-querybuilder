// import { useLocation } from '@docusaurus/router';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import queryString from 'query-string';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { ExportFormat, FormatQueryOptions } from 'react-querybuilder';
import {
  convertToIC,
  defaultValidator,
  formatQuery,
  parseCEL,
  parseJsonLogic,
  parseSQL,
  QueryBuilder,
  version as rqbVersion,
} from 'react-querybuilder';
import {
  defaultOptions,
  fields,
  formatMap,
  initialQuery,
  initialQueryIC,
  optionOrder,
  optionsMetadata,
} from './_constants';
import type { CommonRQBProps } from './_types';
import { getFormatQueryString, getOptionsFromHash, optionsReducer } from './_utils';

// TODO: show Bootstrap compatibility package
// const QueryBuilderBootstrap = lazy(() => import('./_QueryBuilderBootstrap'));

const lsKey_docsPreferredVersionDefault = 'docs-preferred-version-default';

const initialSQL = `SELECT *\n  FROM my_table\n WHERE ${formatQuery(initialQuery, 'sql')};`;
const initialCEL = `firstName.startsWith("Stev") && age > 28`;
const initialJsonLogic = JSON.stringify(formatQuery(initialQuery, 'jsonlogic'), null, 2);

// Initialize options from URL hash
const initialOptionsFromHash = getOptionsFromHash(queryString.parse(location.hash));

const permalinkText = 'Copy link';
const permalinkCopiedText = 'Copied!';

export default function Demo() {
  // const dsCtx = useDocusaurusContext();
  // const location = useLocation();
  const [docsPreferredVersionDefault, setDocsPreferredVersionDefault] = useState('');
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
  const [isCELInputVisible, setIsCELInputVisible] = useState(false);
  const [cel, setCEL] = useState(initialCEL);
  const [celParseError, setCELParseError] = useState('');
  const [isJsonLogicInputVisible, setIsJsonLogicInputVisible] = useState(false);
  const [jsonLogic, setJsonLogic] = useState(initialJsonLogic);
  const [jsonLogicParseError, setJsonLogicParseError] = useState('');
  const [copyPermalinkText, setCopyPermalinkText] = useState(permalinkText);

  // TODO: debounce this by ~1s?
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => {
  //   const dpvd = localStorage.getItem(lsKey_docsPreferredVersionDefault);
  //   if (dpvd && dpvd !== docsPreferredVersionDefault) setDocsPreferredVersionDefault(dpvd);
  // });

  const permalinkHash = useMemo(() => `#${queryString.stringify(options)}`, [options]);

  const updateOptionsFromHash = useCallback((e: HashChangeEvent) => {
    const optionsFromHash = getOptionsFromHash(
      queryString.parse(
        queryString.parseUrl(e.newURL, { parseFragmentIdentifier: true }).fragmentIdentifier ?? ''
      )
    );
    const payload = { ...defaultOptions, ...optionsFromHash };

    setOptions({ type: 'replace', payload });
  }, []);

  useEffect(() => {
    history.pushState(null, '', permalinkHash);
    window.addEventListener('hashchange', updateOptionsFromHash);

    return () => window.removeEventListener('hashchange', updateOptionsFromHash);
  }, [permalinkHash, updateOptionsFromHash]);

  const optionsInfo = useMemo(
    () =>
      optionOrder.map(opt => ({
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

  const loadFromSQL = useCallback(() => {
    try {
      const q = parseSQL(sql);
      const qIC = parseSQL(sql, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setIsSQLInputVisible(false);
      setSQLParseError('');
    } catch (err) {
      setSQLParseError((err as Error).message);
    }
  }, [sql]);
  const loadFromCEL = useCallback(() => {
    try {
      const q = parseCEL(cel);
      const qIC = parseCEL(cel, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setIsCELInputVisible(false);
      setCELParseError('');
    } catch (err) {
      setCELParseError((err as Error).message);
    }
  }, [cel]);
  const loadFromJsonLogic = useCallback(() => {
    try {
      const q = parseJsonLogic(jsonLogic);
      const qIC = convertToIC(q);
      setQuery(q);
      setQueryIC(qIC);
      setIsJsonLogicInputVisible(false);
      setJsonLogicParseError('');
    } catch (err) {
      setJsonLogicParseError((err as Error).message);
    }
  }, [jsonLogic]);

  const onClickCopyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${permalinkHash}`);
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

  return (
    <div
      style={{
        padding: 'var(--ifm-global-spacing)',
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        columnGap: 'var(--ifm-global-spacing)',
      }}>
      <div>
        <h3>
          <Link
            href={'/docs/api/querybuilder'}
            title={'Boolean props on the QueryBuilder component (click for documentation)'}
            style={{ textDecoration: 'none' }}>
            Options
          </Link>
        </h3>
        {optionsInfo.map(({ checked, label, link, setter, title }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}>
            <label>
              <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
              {label}
            </label>
            <Link
              href={`${link}`}
              title={`${title} (click for documentation)`}
              style={{ textDecoration: 'none' }}>
              ⓘ
            </Link>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            columnGap: 'var(--ifm-global-spacing)',
            margin: 'var(--ifm-global-spacing) auto',
          }}>
          <div title="Reset the options above to their default values">
            <button type="button" onClick={() => setOptions({ type: 'reset' })}>
              Reset
            </button>
          </div>
          <div title={`Enable all features except "${optionsMetadata.disabled.label}"`}>
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
        <hr />
        <h3>
          <Link
            href={'/docs/api/export'}
            title={'The export format of the formatQuery function (click for documentation)'}
            style={{ textDecoration: 'none' }}>
            Export
          </Link>
        </h3>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}>
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
                ⓘ
              </Link>
            </div>
          ))}
        </div>
        <hr />
        <h3>
          <Link
            href={'/docs/api/import'}
            title={
              'Use the parse* methods to set the query from SQL/JsonLogic/etc. (click for documentation)'
            }
            style={{ textDecoration: 'none' }}>
            Import
          </Link>
        </h3>
        <button type="button" onClick={() => setIsSQLInputVisible(true)}>
          Import SQL
        </button>
        <button type="button" onClick={() => setIsCELInputVisible(true)}>
          Import CEL
        </button>
        <button type="button" onClick={() => setIsJsonLogicInputVisible(true)}>
          Import JsonLogic
        </button>
        <hr />
        <code style={{ fontSize: '8pt', marginBottom: 'var(--ifm-global-spacing)' }}>
          react-querybuilder@{rqbVersion}
        </code>
      </div>
      <div style={{ marginBottom: 'var(--ifm-global-spacing)' }}>
        <div style={{ marginBottom: 'var(--ifm-global-spacing)' }}>
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
        </div>
        <hr />
        <pre style={{ whiteSpace: 'pre-wrap' }}>{formatString}</pre>
      </div>
    </div>
  );
}
