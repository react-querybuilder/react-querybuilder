import { ValueEditorProps } from '../../src/types';

const BootstrapValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
}: ValueEditorProps) => {
  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  switch (type) {
    case 'select':
      return (
        <select
          className={`${className} form-select form-select-sm`}
          title={title}
          onChange={(e) => handleOnChange(e.target.value)}
          value={value}
        >
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
          className="form-check-input"
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
          type={inputType || 'text'}
          value={value}
          title={title}
          className={className}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

BootstrapValueEditor.displayName = 'ValueEditor';

export default BootstrapValueEditor;
