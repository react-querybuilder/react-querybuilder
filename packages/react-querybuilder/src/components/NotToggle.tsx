import * as React from 'react';
import type { NotToggleProps } from '../types';

/**
 * Default `notToggle` (aka inversion) component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const NotToggle = (props: NotToggleProps): React.JSX.Element => (
  <label data-testid={props.testID} className={props.className} title={props.title}>
    <input
      type="checkbox"
      onChange={e => props.handleOnChange(e.target.checked)}
      checked={!!props.checked}
      disabled={props.disabled}
    />
    {props.label}
  </label>
);
