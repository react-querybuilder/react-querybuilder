import {
  standardClassnames,
  toArray,
  useValueEditor,
  ValueSelector,
  type ValueEditorProps,
} from 'react-querybuilder';

export const BootstrapValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values = [],
  listsAsArrays,
  disabled,
  testID,
  ...props
}: ValueEditorProps) => {
  useValueEditor({ handleOnChange, inputType, operator, value });

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
          className={`${className} form-select form-select-sm`}
          title={title}
          handleOnChange={handleOnChange}
          value={value}
          disabled={disabled}
          multiple={type === 'multiselect'}
          options={values}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value}
          title={title}
          className={className}
          disabled={disabled}
          placeholder={placeHolderText}
          onChange={e => handleOnChange(e.target.value)}
        />
      );

    case 'switch':
      return (
        <span className={`custom-control custom-switch ${className}`}>
          <input
            type="checkbox"
            className={`form-check-input custom-control-input`}
            title={title}
            disabled={disabled}
            onChange={e => handleOnChange(e.target.checked)}
            checked={!!value}
          />
        </span>
      );

    case 'checkbox':
      return (
        <input
          type="checkbox"
          className={`form-check-input ${className}`}
          title={title}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.checked)}
          checked={!!value}
        />
      );

    case 'radio':
      return (
        <span title={title}>
          {values.map(v => (
            <div key={v.name} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                id={v.name}
                value={v.name}
                checked={value === v.name}
                disabled={disabled}
                onChange={e => handleOnChange(e.target.value)}
              />
              <label className="form-check-label" htmlFor={v.name}>
                {v.label}
              </label>
            </div>
          ))}
        </span>
      );
  }

  return (
    <input
      type={inputTypeCoerced}
      value={value}
      title={title}
      className={className}
      disabled={disabled}
      placeholder={placeHolderText}
      onChange={e => handleOnChange(e.target.value)}
    />
  );
};

BootstrapValueEditor.displayName = 'BootstrapValueEditor';
