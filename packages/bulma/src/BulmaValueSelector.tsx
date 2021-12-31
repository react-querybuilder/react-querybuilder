import type { ValueSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';

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
      {toOptions(options)}
    </select>
  </div>
);

BulmaValueSelector.displayName = 'BulmaValueSelector';
