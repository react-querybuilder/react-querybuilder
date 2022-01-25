import { useEffect } from 'react';
import type { ValueEditorProps } from '../types';
import { ValueSelector } from './ValueSelector';

export const ValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values,
  fieldData,
  disabled,
  testID,
  ...props
}: ValueEditorProps) => {
  // This side effect blanks out the value if 1) the inputType is "number",
  // 2) the operator is not "between", "notBetween", "in", or "notIn", and
  // 3) the value contains a comma.
  useEffect(() => {
    if (
      inputType === 'number' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      typeof value === 'string' &&
      value.includes(',')
    ) {
      handleOnChange('');
    }
  }, [handleOnChange, inputType, operator, value]);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(operator)
    ? 'text'
    : inputType || 'text';

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
          options={values!}
          multiple={type === 'multiselect'}
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
          {values &&
            values.map(v => (
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
      onChange={e => handleOnChange(e.target.value)}
    />
  );
};

ValueEditor.displayName = 'ValueEditor';
