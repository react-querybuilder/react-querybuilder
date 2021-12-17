import { Form } from 'react-bulma-components';
import type { ValueSelectorProps } from 'react-querybuilder';

const { Select } = Form;

const BulmaValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
}: ValueSelectorProps) => (
  <Select
    className={className}
    title={title}
    value={value}
    size="small"
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
  </Select>
);

BulmaValueSelector.displayName = 'BulmaValueSelector';

export default BulmaValueSelector;
