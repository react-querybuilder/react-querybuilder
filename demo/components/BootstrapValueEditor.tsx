import { useEffect } from 'react';
import type { ValueEditorProps } from '../../src/types';

const BootstrapValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
}: ValueEditorProps) => {
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
          className={`${className} form-select form-select-sm`}
          title={title}
          onChange={(e) => handleOnChange(e.target.value)}
          value={value}>
          {values!.map((v) => (
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
          className={`form-check-input ${className}`}
          title={title}
          onChange={(e) => handleOnChange(e.target.checked)}
          checked={!!value}
        />
      );

    case 'radio':
      return (
        <span title={title}>
          {values!.map((v) => (
            <div key={v.name} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                id={v.name}
                value={v.name}
                checked={value === v.name}
                onChange={(e) => handleOnChange(e.target.value)}
              />
              <label className="form-check-label" htmlFor={v.name}>
                {v.label}
              </label>
            </div>
          ))}
        </span>
      );

    default:
      return (
        <input
          type={inputTypeCoerced}
          value={value}
          title={title}
          className={className}
          placeholder={placeHolderText}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

BootstrapValueEditor.displayName = 'ValueEditor';

export default BootstrapValueEditor;
