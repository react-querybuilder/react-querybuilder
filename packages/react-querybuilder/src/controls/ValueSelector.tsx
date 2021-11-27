import type { ValueSelectorProps } from '../types/props';

const ValueSelector = ({
  className,
  handleOnChange,
  options,
  title,
  value
}: ValueSelectorProps) => (
  <select
    className={className}
    value={value}
    title={title}
    onChange={(e) => handleOnChange(e.target.value)}>
    {options.map((option) => {
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
