import { Fragment, useMemo, useReducer, useState } from 'react';
import { defaultValidator, QueryBuilder, type ExportFormat, type FormatQueryOptions } from '../src';
import {
  defaultOptions,
  fields,
  formatMap,
  initialQuery,
  initialQueryIC,
  optionOrder,
} from './constants';
import './styles.scss';
import type { CommonRQBProps } from './types';
import { getFormatQueryString, optionsReducer } from './utils';

export const App = () => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [optVals, updateOptions] = useReducer(optionsReducer, defaultOptions);

  const commonRQBProps = useMemo(
    (): CommonRQBProps => ({
      fields,
      ...optVals,
      validator: optVals.validateQuery ? defaultValidator : undefined,
    }),
    [optVals]
  );

  const formatQueryResults = useMemo(
    () =>
      formatMap.map(([format]): [ExportFormat, string] => {
        const formatOptions: FormatQueryOptions = {
          format,
          fields: optVals.validateQuery ? fields : undefined,
          parseNumbers: optVals.parseNumbers,
        };
        const q = optVals.independentCombinators ? queryIC : query;
        return [format, getFormatQueryString(q, formatOptions)];
      }),
    [optVals.independentCombinators, optVals.parseNumbers, optVals.validateQuery, query, queryIC]
  );

  const resetOptions = () => updateOptions({ type: 'reset' });
  const allOptions = () => updateOptions({ type: 'all' });
  const clearQuery = () => {
    setQuery({ combinator: 'and', rules: [] });
    setQueryIC({ rules: [] });
  };
  const defaultQuery = () => {
    setQuery(initialQuery);
    setQueryIC(initialQueryIC);
  };

  const actions: [string, () => void][] = [
    ['Default options', resetOptions],
    ['All options', allOptions],
    ['Clear query', clearQuery],
    ['Default query', defaultQuery],
  ];

  return (
    <>
      <div>
        {optionOrder.map(opt => (
          <label key={opt}>
            <input
              type="checkbox"
              checked={optVals[opt]}
              onChange={e =>
                updateOptions({
                  type: 'update',
                  payload: { optionName: opt, value: e.target.checked },
                })
              }
            />
            <code>{opt}</code>
          </label>
        ))}
        {actions.map(([label, action]) => (
          <span key={label}>
            <button type="button" onClick={action}>
              {label}
            </button>
          </span>
        ))}
      </div>
      <div>
        {!optVals.independentCombinators ? (
          <QueryBuilder
            key="query"
            {...commonRQBProps}
            independentCombinators={false}
            query={query}
            onQueryChange={q => setQuery(q)}
          />
        ) : (
          <QueryBuilder
            key="queryIC"
            {...commonRQBProps}
            independentCombinators
            query={queryIC}
            onQueryChange={q => setQueryIC(q)}
          />
        )}
        <div id="exports">
          {formatQueryResults.map(([fmt, result]) => (
            <Fragment key={fmt}>
              <code>{fmt}</code>
              <pre>{result}</pre>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
