import React from 'react';
import { ValueSelectorProps } from '../types';

const ValueSelector: React.FC<ValueSelectorProps> = ({
  className,
  handleOnChange,
  options,
  title,
  value
}) => (
  <select
    className={className}
    value={value}
    title={title}
    onChange={(e) => handleOnChange(e.target.value)}>
    {options.map((option) => {
      const key = option.id ? `key-${option.id}` : `key-${option.name}`;
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
