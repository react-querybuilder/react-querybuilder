import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useSelectElementChangeHandler } from '../hooks/useSelectElementChangeHandler';
import type { FullOption, ValueSelectorProps } from '../types';
import { joinWith, toArray, toOptions } from '../utils';

/**
 * Default `<select>` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const ValueSelector = <Opt extends FullOption = FullOption>(
  props: ValueSelectorProps<Opt>
): React.JSX.Element => {
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

export type UseValueSelectorParams = Pick<
  ValueSelectorProps,
  'handleOnChange' | 'listsAsArrays' | 'multiple' | 'value'
>;

/**
 * Transforms a value into an array when appropriate and provides a memoized change handler.
 *
 * @group Hooks
 */
export const useValueSelector = (
  props: UseValueSelectorParams
): {
  /**
   * Memoized change handler for value selectors
   */
  onChange: (v: string | string[]) => void;
  /**
   * The value as provided or, if appropriate, as an array
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  val: string | any[] | undefined;
} => {
  const { handleOnChange, listsAsArrays = false, multiple = false, value } = props;

  const onChange = useCallback(
    (v: string | string[]) => {
      if (multiple) {
        const valueAsArray = toArray(v);
        handleOnChange(listsAsArrays ? valueAsArray : joinWith(valueAsArray, ','));
      } else {
        handleOnChange(v);
      }
    },
    [handleOnChange, listsAsArrays, multiple]
  );

  const val = useMemo(() => (multiple ? toArray(value) : value), [multiple, value]);

  return {
    onChange,
    val,
  };
};
