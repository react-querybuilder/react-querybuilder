import { useEffect } from 'react';
import type { ValueEditorProps } from '../types';

const ValueEditor = ({
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
      return (
        <select
          className={className}
          title={title}
          onChange={e => handleOnChange(e.target.value)}
          disabled={disabled}
          value={value}>
          {values &&
            values.map(v => (
              <option key={v.name} value={v.name}>
                {v.label}
              </option>
            ))}
        </select>
      );

    case 'checkbox':
      return (
        <input
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
        <span className={className} title={title}>
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

    default:
      return (
        <input
          type={inputTypeCoerced}
          placeholder={placeHolderText}
          value={value}
          title={title}
          className={className}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.value)}
        />
      );
  }
};

ValueEditor.displayName = 'ValueEditor';

export default ValueEditor;
