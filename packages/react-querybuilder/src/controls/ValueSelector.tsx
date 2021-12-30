import { toOptions } from '../utils';
import type { ValueSelectorProps } from '../types';

export const ValueSelector = ({
  className,
  handleOnChange,
  options,
  title,
  value,
  disabled,
  testID,
}: ValueSelectorProps) => (
  <select
    data-testid={testID}
    className={className}
    value={value}
    title={title}
    disabled={disabled}
    onChange={e => handleOnChange(e.target.value)}>
    {toOptions(options)}
  </select>
);

ValueSelector.displayName = 'ValueSelector';
