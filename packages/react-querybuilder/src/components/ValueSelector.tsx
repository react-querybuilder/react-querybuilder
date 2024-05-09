import * as React from 'react';
import { useSelectElementChangeHandler, useValueSelector } from '../hooks';
import type { FullOption, ValueSelectorProps } from '../types';
import { toOptions } from '../utils';

/**
 * Default `<select>` component used by {@link QueryBuilder}.
 */
export const ValueSelector = <Opt extends FullOption = FullOption>(
  props: ValueSelectorProps<Opt>
) => {
  const { onChange, val } = useValueSelector(props);

  const selectElementChangeHandler = useSelectElementChangeHandler({
    multiple: props.multiple,
    onChange,
  });

  return (
    <select
      data-testid={props.testID}
      className={props.className}
      value={val}
      title={props.title}
      disabled={props.disabled}
      multiple={!!props.multiple}
      onChange={selectElementChangeHandler}>
      {toOptions(props.options)}
    </select>
  );
};
