import type { ValueSelectorProps } from '../types';

const ValueSelector = ({
  className,
  handleOnChange,
  options,
  title,
  value,
  disabled,
}: ValueSelectorProps) => (
  <select
    className={className}
    value={value}
    title={title}
    disabled={disabled}
    onChange={e => handleOnChange(e.target.value)}>
    {options.map(option => {
      const key = `key-${option.id ?? option.name}`;
      return (
        <option key={key} value={option.name}>
          {option.label}
        </option>
      );
    })}
  </select>
);

ValueSelector.displayName = 'ValueSelector';

export default ValueSelector;
