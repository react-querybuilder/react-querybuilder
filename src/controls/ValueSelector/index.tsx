import * as React from 'react';
import { NameAndLabel } from '../../types';

type Options = NameAndLabel & { id: string };

export interface ValueSelectorProps {
  value?: string;
  options: Options[];
  className?: string;
  handleOnChange: (val: string) => void;
  title?: string;
}

const ValueSelector = (props: ValueSelectorProps): JSX.Element => {
  // this.displayName = 'ValueSelector';
  const { value, options, className, handleOnChange, title } = props;

  return (
    <select
      className={className}
      value={value}
      title={title}
      onChange={(e) => handleOnChange(e.target.value)}
    >
      {options.map((option) => {
        return (
          <option key={option.id || option.name} value={option.name}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
};

export default ValueSelector;
