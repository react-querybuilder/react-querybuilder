import { useValueEditor, ValueSelector, type ValueEditorProps } from 'react-querybuilder';

export const BootstrapValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values,
  disabled,
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
          options={values!}
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
          {values!.map(v => (
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
