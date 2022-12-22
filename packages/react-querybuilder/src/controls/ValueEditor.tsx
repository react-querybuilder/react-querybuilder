import type { ValueEditorProps } from '@react-querybuilder/ts';
import { standardClassnames } from '../defaults';
import { getFirstOption, parseNumber, useValueEditor } from '../utils';
import { ValueSelector } from './ValueSelector';

export const ValueEditor = ({
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
  skipHook = false,
  testID,
  ...props
}: ValueEditorProps) => {
  const { valArray, betweenValueHandler } = useValueEditor({
    skipHook,
    handleOnChange,
    inputType,
    operator,
    value,
    type,
    listsAsArrays,
    parseNumbers,
    values,
  });

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
            type={inputType || 'text'}
            placeholder={placeHolderText}
            value={valArray[i] ?? ''}
            className={standardClassnames.valueListItem}
            disabled={disabled}
            onChange={e => betweenValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <ValueSelector
          key={key}
          {...props}
          className={standardClassnames.valueListItem}
          handleOnChange={v => betweenValueHandler(v, i)}
          disabled={disabled}
          value={valArray[i] ?? getFirstOption(values)}
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
        <ValueSelector
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
