import { useEffect } from 'react';
import { standardClassnames } from '../defaults';
import type { ValueEditorProps } from '../types';
import { toArray } from '../utils';
import { ValueSelector } from './ValueSelector';

export const ValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values = [],
  listsAsArrays,
  fieldData,
  disabled,
  testID,
  ...props
}: ValueEditorProps) => {
  // The Effect below trims the value if all of the following are true:
  //   - `inputType` is "number"
  //   - `operator` is not one of ("between", "notBetween", "in", "notIn")
  //   - `value` is an array OR the value is a string containing a comma
  // For example, if a rule is "f1 between '1' and '2'" and its operator changes to
  // "=", the value will be reset to "1" since the "number" input type can't handle
  // arrays or strings with commas.
  useEffect(() => {
    if (
      inputType === 'number' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      ((typeof value === 'string' && value.includes(',')) || Array.isArray(value))
    ) {
      handleOnChange(toArray(value)[0] ?? '');
    }
  }, [handleOnChange, inputType, operator, value]);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(operator)
    ? 'text'
    : inputType || 'text';

  if ((operator === 'between' || operator === 'notBetween') && type === 'select') {
    const valArray = toArray(value);
    const selector1handler = (v: string) => {
      const val = [v, valArray[1] ?? values[0]?.name, ...valArray.slice(2)];
      handleOnChange(listsAsArrays ? val : val.join(','));
    };
    const selector2handler = (v: string) => {
      const val = [valArray[0], v, ...valArray.slice(2)];
      handleOnChange(listsAsArrays ? val : val.join(','));
    };
    return (
      <span data-testid={testID} className={className} title={title}>
        <ValueSelector
          {...props}
          className={standardClassnames.valueListItem}
          handleOnChange={selector1handler}
          disabled={disabled}
          value={valArray[0]}
          options={values}
          listsAsArrays={listsAsArrays}
        />
        <ValueSelector
          {...props}
          className={standardClassnames.valueListItem}
          handleOnChange={selector2handler}
          disabled={disabled}
          value={valArray[1]}
          options={values}
          listsAsArrays={listsAsArrays}
        />
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
      onChange={e => handleOnChange(e.target.value)}
    />
  );
};

ValueEditor.displayName = 'ValueEditor';
