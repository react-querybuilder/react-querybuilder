import { useValueEditor, type ValueEditorProps } from 'react-querybuilder';
import { BulmaValueSelector } from './BulmaValueSelector';

export const BulmaValueEditor = ({
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
        <BulmaValueSelector
          {...props}
          title={title}
          className={className}
          handleOnChange={handleOnChange}
          options={values!}
          value={value}
          disabled={disabled}
          multiple={type === 'multiselect'}
        />
      );

    case 'textarea':
      return (
        <div className={`${className} control`}>
          <textarea
            value={value}
            title={title}
            disabled={disabled}
            className="textarea"
            placeholder={placeHolderText}
            onChange={e => handleOnChange(e.target.value)}
          />
        </div>
      );

    case 'switch':
    case 'checkbox':
      return (
        <label title={title} className={`${className} checkbox`}>
          <input
            type="checkbox"
            checked={!!value}
            disabled={disabled}
            onChange={e => handleOnChange(e.target.checked)}
          />
        </label>
      );

    case 'radio':
      return (
        <div className={`${className} control`} title={title}>
          {values!.map(v => (
            <label key={v.name} className="radio">
              <input
                type="radio"
                value={v.name}
                checked={value === v.name}
                onChange={() => handleOnChange(v.name)}
                disabled={disabled}
              />
              {v.label}
            </label>
          ))}
        </div>
      );
  }

  return (
    <div className={`${className} control`}>
      <input
        type={inputTypeCoerced}
        value={value}
        title={title}
        disabled={disabled}
        className="input is-small"
        placeholder={placeHolderText}
        onChange={e => handleOnChange(e.target.value)}
      />
    </div>
  );
};

BulmaValueEditor.displayName = 'BulmaValueEditor';
