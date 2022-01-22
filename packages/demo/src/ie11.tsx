import 'core-js';
import { useCallback, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import QueryBuilder, { defaultValidator } from 'react-querybuilder';
import {
  CommonRQBProps,
  defaultOptions,
  DemoOptions,
  docsLink,
  fields,
  initialQuery,
  initialQueryIC,
  optionsMetadata,
} from './constants';

const IE11 = () => {
  const [options, setOptions] = useState(defaultOptions);

  const optionSetter = useCallback(
    (opt: keyof DemoOptions) => (v: boolean) => setOptions(opts => ({ ...opts, [opt]: v })),
    []
  );

  const optionsInfo = useMemo(
    () =>
      (
        [
          'showCombinatorsBetweenRules',
          'showNotToggle',
          'showCloneButtons',
          'showLockButtons',
          'resetOnFieldChange',
          'resetOnOperatorChange',
          'autoSelectField',
          'addRuleToNewGroups',
          'validateQuery',
          'independentCombinators',
          'enableDragAndDrop',
          'disabled',
        ] as (keyof DemoOptions)[]
      ).map(opt => ({
        ...optionsMetadata[opt],
        default: defaultOptions[opt],
        checked: options[opt],
        setter: optionSetter(opt),
      })),
    [options, optionSetter]
  );

  const resetOptions = useCallback(
    () =>
      optionsInfo.forEach(opt => (opt.checked !== opt.default ? opt.setter(opt.default) : null)),
    [optionsInfo]
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

  const qbClassname = commonRQBProps.enableDragAndDrop ? '' : 'dnd-disabled';

  return (
    <div>
      <div className={qbWrapperClassName}>
        <div style={getQBWrapperStyle(false)}>
          <QueryBuilder
            {...commonRQBProps}
            independentCombinators={false}
            defaultQuery={initialQuery}
            controlClassnames={{
              queryBuilder: qbClassname,
            }}
          />
        </div>
        <div style={getQBWrapperStyle(true)}>
          <QueryBuilder {...commonRQBProps} independentCombinators defaultQuery={initialQueryIC} />
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

ReactDOM.render(<IE11 />, document.getElementById('ie11'));
