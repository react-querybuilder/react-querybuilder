// import { useLocation } from '@docusaurus/router';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import Layout from '@theme/Layout';
import React, { useCallback, useMemo, useReducer, useState } from 'react';
import type { ExportFormat, FormatQueryOptions } from 'react-querybuilder';
import {
  convertToIC,
  defaultValidator,
  formatQuery,
  parseCEL,
  parseJsonLogic,
  parseSQL,
  QueryBuilder,
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
import { getFormatQueryString, optionsReducer } from './_utils';

const docsPreferredVersionDefault = localStorage.getItem('docs-preferred-version-default');

const initialSQL = `SELECT *\n  FROM my_table\n WHERE ${formatQuery(initialQuery, 'sql')};`;
const initialCEL = `firstName.startsWith("Stev") && age > 28`;
const initialJsonLogic = JSON.stringify(formatQuery(initialQuery, 'jsonlogic'), null, 2);

export default function ReactQueryBuilder() {
  // const dsCtx = useDocusaurusContext();
  // const location = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [format, setFormat] = useState<ExportFormat>('json_without_ids');
  const [options, setOptions] = useReducer(optionsReducer, {
    ...defaultOptions,
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

  const commonRQBProps = useMemo(
    (): CommonRQBProps => ({
      fields,
      ...options,
      validator: options.validateQuery ? defaultValidator : undefined,
    }),
    [options]
  );

  return (
    <Layout description="React Query Builder Demo">
      <div
        style={{
          padding: 'var(--ifm-heading-margin-bottom)',
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          columnGap: 'var(--ifm-heading-margin-bottom)',
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
              columnGap: 'var(--ifm-heading-margin-bottom)',
              margin: 'var(--ifm-heading-margin-bottom) auto',
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
          </div>
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
        </div>
        <div style={{ marginBottom: 'var(--ifm-heading-margin-bottom)' }}>
          <div style={{ marginBottom: 'var(--ifm-heading-margin-bottom)' }}>
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
    </Layout>
  );
}
