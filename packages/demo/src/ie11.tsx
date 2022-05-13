import 'core-js';
import { useCallback, useMemo, useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import {
  defaultOptions,
  fields,
  initialQuery,
  initialQueryIC,
  optionOrder,
  optionsMetadata,
  optionsReducer,
  type CommonRQBProps,
  type DemoOption,
} from 'react-querybuilder/dev';
import { QueryBuilder, defaultValidator, type QueryBuilderProps } from 'react-querybuilder/src';
import { docsLink } from './constants';

const IE11 = () => {
  const [options, setOptions] = useReducer(optionsReducer, defaultOptions);

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

  const resetOptions = useCallback(() => setOptions({ type: 'reset' }), []);

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

  return (
    <div>
      <div className={qbWrapperClassName}>
        <div style={getQBWrapperStyle(false)}>
          <QueryBuilder
            {...commonRQBProps}
            independentCombinators={false}
            defaultQuery={initialQuery}
            controlClassnames={controlClassnames}
          />
        </div>
        <div style={getQBWrapperStyle(true)}>
          <QueryBuilder
            {...commonRQBProps}
            independentCombinators
            defaultQuery={initialQueryIC}
            controlClassnames={controlClassnames}
          />
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        {optionsInfo.map(({ checked, label, link, setter, title }) => (
          <div key={label}>
            <label>
              <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
              {label}
              {'\u00a0'}
              <a href={`${docsLink}${link}`} title={title} target="_blank" rel="noreferrer">
                (?)
              </a>
            </label>
          </div>
        ))}
        <button type="button" style={{ marginTop: '0.5rem' }} onClick={resetOptions}>
          Default options
        </button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('ie11')!).render(<IE11 />);
