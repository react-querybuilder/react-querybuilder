import type { ValueSelectorProps } from 'react-querybuilder';

export const BulmaValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
}: ValueSelectorProps) => (
  <div title={title} className={`${className} select is-small`}>
    <select value={value} disabled={disabled} onChange={e => handleOnChange(e.target.value)}>
      {options.map(option => {
        const key = `key-${option.id ?? option.name}`;
        return (
          <option key={key} value={option.name}>
            {option.label}
          </option>
        );
      })}
    </select>
  </div>
);

BulmaValueSelector.displayName = 'BulmaValueSelector';
