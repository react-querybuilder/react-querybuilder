import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import {
  getFirstOption,
  standardClassnames,
  useValueEditor,
  ValueEditor,
  ValueSelector,
} from 'react-querybuilder';

export const BootstrapValueEditor = (props: ValueEditorProps) => {
  const { valueAsArray, multiValueHandler } = useValueEditor({
    handleOnChange: props.handleOnChange,
    inputType: props.inputType,
    operator: props.operator,
    value: props.value,
    type: props.type,
    listsAsArrays: props.listsAsArrays,
    parseNumbers: props.parseNumbers,
    values: props.values,
  });

  const { selectorComponent: SelectorComponent = ValueSelector } = props;

  if (props.operator === 'null' || props.operator === 'notNull') {
    return null;
  }

  const placeHolderText = props.fieldData?.placeholder ?? '';

  if (
    (props.operator === 'between' || props.operator === 'notBetween') &&
    (props.type === 'select' || props.type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (props.type === 'text') {
        return (
          <input
            key={key}
            type={props.inputType || 'text'}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={`${standardClassnames.valueListItem} form-control form-control-sm`}
            disabled={props.disabled}
            onChange={e => multiValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <SelectorComponent
          {...props}
          key={key}
          className={`${standardClassnames.valueListItem} form-select form-select-sm`}
          handleOnChange={v => multiValueHandler(v, i)}
          disabled={props.disabled}
          value={valueAsArray[i] ?? getFirstOption(props.values)}
          options={props.values ?? []}
          listsAsArrays={props.listsAsArrays}
        />
      );
    });

    return (
      <span data-testid={props.testID} className={standardClassnames.value} title={props.title}>
        {editors[0]}
        {props.separator}
        {editors[1]}
      </span>
    );
  }

  switch (props.type) {
    case 'select':
    case 'multiselect':
      return (
        <ValueEditor
          skipHook
          {...props}
          className={`${props.className} form-select form-select-sm`}
        />
      );

    case 'switch':
      return (
        <span className={`custom-control custom-switch ${props.className}`}>
          <input
            type="checkbox"
            className="form-check-input custom-control-input"
            title={props.title}
            disabled={props.disabled}
            onChange={e => props.handleOnChange(e.target.checked)}
            checked={!!props.value}
          />
        </span>
      );

    case 'checkbox':
      return <ValueEditor skipHook {...props} className={`form-check-input ${props.className}`} />;

    case 'radio':
      return (
        <span title={props.title} className={standardClassnames.value}>
          {props.values?.map(v => (
            <div key={v.name} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                id={v.name}
                value={v.name}
                checked={props.value === v.name}
                disabled={props.disabled}
                onChange={e => props.handleOnChange(e.target.value)}
              />
              <label className="form-check-label" htmlFor={v.name}>
                {v.label}
              </label>
            </div>
          ))}
        </span>
      );
  }

  return <ValueEditor skipHook {...props} />;
};

BootstrapValueEditor.displayName = 'BootstrapValueEditor';
