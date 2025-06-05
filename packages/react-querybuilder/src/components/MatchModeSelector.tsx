import * as React from 'react';
import { useCallback } from 'react';
import type { FullField, MatchModeName, MatchModeSelectorProps, Schema } from '../types';
import { parseNumber } from '../utils';

/**
 * Default `matchModeSelector` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const MatchModeSelector = (allProps: MatchModeSelectorProps): React.JSX.Element | null => {
  const {
    matchMode,
    options,
    handleOnChange,
    title,
    className,
    disabled,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    ...propsForValueSelector
  } = allProps;

  const { mode, threshold } = matchMode;
  const matchModeLC = mode.toLowerCase();
  const thresholdNum = typeof threshold === 'number' ? Math.max(0, threshold) : 1;

  const handleChange = useCallback(
    (value: MatchModeName | number) => {
      if (typeof value === 'number') {
        handleOnChange({ ...matchMode, threshold: value });
      } else {
        handleOnChange({ ...matchMode, mode: value });
      }
    },
    [handleOnChange, matchMode]
  );

  return (
    <React.Fragment>
      <SelectorComponent
        {...propsForValueSelector}
        schema={allProps.schema as unknown as Schema<FullField, string>}
        testID={testID}
        className={className}
        title={title}
        handleOnChange={handleChange}
        disabled={disabled}
        value={mode}
        options={options}
        multiple={false}
        listsAsArrays={false}
      />
      {['atleast', 'atmost', 'exactly'].includes(matchModeLC) && (
        <input
          data-testid={testID}
          type="number"
          // TODO: Implement `matchThresholdPlaceholderText`?
          // placeholder={placeHolderText}
          value={thresholdNum}
          title={title}
          className={className}
          disabled={disabled}
          onChange={e => handleChange(parseNumber(e.target.value, { parseNumbers: true }))}
        />
      )}
    </React.Fragment>
  );
};
