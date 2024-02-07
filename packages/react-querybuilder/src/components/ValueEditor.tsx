import * as React from 'react';
import { standardClassnames } from '../defaults';
import { useValueEditor } from '../hooks';
import type { ValueEditorProps } from '../types';
import { getFirstOption, parseNumber } from '../utils';

/**
 * Default `valueEditor` component used by {@link QueryBuilder}.
 */
export const ValueEditor = (allProps: ValueEditorProps) => {
  const {
    operator,
    value,
    handleOnChange,
    title,
    className,
    type = 'text',
    inputType = 'text',
    values = [],
    listsAsArrays,
    parseNumbers,
    fieldData,
    disabled,
    separator = null,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    ...props
  } = allProps;

  const { valueAsArray, multiValueHandler } = useValueEditor(allProps);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['in', 'notIn'].includes(operator) ? 'text' : inputType || 'text';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <input
            key={key}
            type={inputTypeCoerced}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={standardClassnames.valueListItem}
            disabled={disabled}
            onChange={e => multiValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <SelectorComponent
          {...props}
          key={key}
          className={standardClassnames.valueListItem}
          handleOnChange={v => multiValueHandler(v, i)}
          disabled={disabled}
          value={valueAsArray[i] ?? getFirstOption(values)}
          options={values}
          listsAsArrays={listsAsArrays}
        />
      );
    });

    return (
      <span data-testid={testID} className={className} title={title}>
        {editors[0]}
        {separator}
        {editors[1]}
      </span>
    );
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <SelectorComponent
          {...props}
          testID={testID}
          className={className}
          title={title}
          handleOnChange={handleOnChange}
          disabled={disabled}
          value={value}
          options={values}
          multiple={type === 'multiselect'}
          listsAsArrays={listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <textarea
          data-testid={testID}
          placeholder={placeHolderText}
          value={value}
          title={title}
          className={className}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.value)}
        />
      );

    case 'switch':
    case 'checkbox':
      return (
        <input
          data-testid={testID}
          type="checkbox"
          className={className}
          title={title}
          onChange={e => handleOnChange(e.target.checked)}
          checked={!!value}
          disabled={disabled}
        />
      );

    case 'radio':
      return (
        <span data-testid={testID} className={className} title={title}>
          {values.map(v => (
            <label key={v.name}>
              <input
                type="radio"
                value={v.name}
                disabled={disabled}
                checked={value === v.name}
                onChange={e => handleOnChange(e.target.value)}
              />
              {v.label}
            </label>
          ))}
        </span>
      );
  }

  return (
    <input
      data-testid={testID}
      type={inputTypeCoerced}
      placeholder={placeHolderText}
      value={value}
      title={title}
      className={className}
      disabled={disabled}
      onChange={e => handleOnChange(parseNumber(e.target.value, { parseNumbers }))}
    />
  );
};

ValueEditor.displayName = 'ValueEditor';
