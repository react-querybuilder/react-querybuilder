import 'core-js';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  defaultOptions,
  fields,
  formatMap,
  getFormatQueryString,
  initialQuery,
  initialQueryIC,
  optionOrder,
  optionsMetadata,
  optionsReducer,
  type CommonRQBProps,
  type DemoOption,
} from 'react-querybuilder/dev';
import {
  defaultValidator,
  QueryBuilder,
  type ExportFormat,
  type QueryBuilderProps,
} from 'react-querybuilder/src';
import { docsLink } from './constants';

const IE11 = () => {
  const [options, setOptions] = useReducer(optionsReducer, defaultOptions);
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [format, setFormat] = useState<ExportFormat>('sql');

  const optionSetter = useCallback(
    (opt: DemoOption) => (v: boolean) =>
      setOptions({ type: 'update', payload: { optionName: opt, value: v } }),
    []
  );

  const optionsInfo = useMemo(
    () =>
      optionOrder.map(opt => ({
        ...optionsMetadata[opt],
        default: defaultOptions[opt],
        checked: options[opt],
        setter: optionSetter(opt),
      })),
    [options, optionSetter]
  );

  const qbWrapperClassName = options.validateQuery ? 'validateQuery' : '';

  const commonRQBProps = useMemo(
    (): CommonRQBProps => ({
      fields,
      ...options,
      validator: options.validateQuery ? defaultValidator : undefined,
    }),
    [options]
  );

  const getQBWrapperStyle = useCallback(
    (icQueryBuilder: boolean) => ({
      display: icQueryBuilder !== !!options.independentCombinators ? 'none' : 'block',
    }),
    [options.independentCombinators]
  );

  const controlClassnames: QueryBuilderProps['controlClassnames'] = {
    queryBuilder: commonRQBProps.enableDragAndDrop ? '' : 'dnd-disabled',
  };

  const generateOptionsJSX = ({ checked, label, link, setter, title }: typeof optionsInfo[0]) => (
    <label key={label}>
      <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
      {label}
      {'\u00a0'}
      <a href={`${docsLink}${link}`} title={title} target="_blank" rel="noreferrer">
        (?)
      </a>
    </label>
  );

  return (
    <div>
      <div className={qbWrapperClassName}>
        <div style={getQBWrapperStyle(false)}>
          <QueryBuilder
            {...commonRQBProps}
            independentCombinators={false}
            query={initialQuery}
            onQueryChange={q => setQuery(q)}
            controlClassnames={controlClassnames}
          />
        </div>
        <div style={getQBWrapperStyle(true)}>
          <QueryBuilder
            {...commonRQBProps}
            independentCombinators
            query={initialQueryIC}
            onQueryChange={q => setQueryIC(q)}
            controlClassnames={controlClassnames}
          />
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="options-list">
          <div>{optionsInfo.slice(0, 5).map(generateOptionsJSX)}</div>
          <div>{optionsInfo.slice(5, 10).map(generateOptionsJSX)}</div>
          <div>{optionsInfo.slice(10).map(generateOptionsJSX)}</div>
        </div>
        <button type="button" onClick={() => setOptions({ type: 'reset' })}>
          Default options
        </button>
        <button type="button" onClick={() => setOptions({ type: 'all' })}>
          All options
        </button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <span style={{ marginRight: '0.5rem' }}>Export format:</span>
        <select value={format} onChange={e => setFormat(e.target.value as ExportFormat)}>
          {formatMap.map(([fmt, lbl]) => (
            <option key={fmt} value={fmt}>
              {lbl}
            </option>
          ))}
        </select>
        <pre>
          {getFormatQueryString(options.independentCombinators ? queryIC : query, {
            format,
            parseNumbers: options.parseNumbers,
          })}
        </pre>
      </div>
    </div>
  );
};

createRoot(document.getElementById('ie11')!).render(<IE11 />);
