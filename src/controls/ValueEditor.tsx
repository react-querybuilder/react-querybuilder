import { useEffect } from 'react';
import { ValueEditorProps } from '../types';

const ValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values,
  fieldData
}: ValueEditorProps) => {
  // This side effect blanks out the value if the inputType is "number",
  // the operator is not "between" and not "notBetween",
  // and the value contains a comma.
  useEffect(() => {
    if (
      inputType === 'number' &&
      !['between', 'notBetween'].includes(operator) &&
      typeof value === 'string' &&
      value.includes(',')
    ) {
      handleOnChange('');
    }
  }, [inputType, operator, value, handleOnChange]);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween'].includes(operator)
    ? 'text'
    : inputType || 'text';

  switch (type) {
    case 'select':
      return (
        <select
          className={className}
          title={title}
          onChange={(e) => handleOnChange(e.target.value)}
          value={value}>
          {values &&
            values.map((v) => (
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
          onChange={(e) => handleOnChange(e.target.checked)}
          checked={!!value}
        />
      );

    case 'radio':
      return (
        <span className={className} title={title}>
          {values &&
            values.map((v) => (
              <label key={v.name}>
                <input
                  type="radio"
                  value={v.name}
                  checked={value === v.name}
                  onChange={(e) => handleOnChange(e.target.value)}
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
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

ValueEditor.displayName = 'ValueEditor';

export default ValueEditor;
