import * as React from 'react';
import { useCallback } from 'react';
import type { FullField, MatchMode, MatchModeSelectorProps, Schema } from '../types';
import { parseNumber } from '../utils';

/**
 * Default `matchModeSelector` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const MatchModeSelector = (allProps: MatchModeSelectorProps): React.JSX.Element | null => {
  const {
    match,
    options,
    handleOnChange,
    title,
    className,
    disabled,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    ...propsForValueSelector
  } = allProps;

  const { mode, threshold } = match;
  const matchModeLC = mode.toLowerCase();
  const thresholdNum = typeof threshold === 'number' ? Math.max(0, threshold) : 1;

  const handleChange = useCallback(
    (value: MatchMode | number) => {
      if (typeof value === 'number') {
        handleOnChange({ ...match, threshold: value });
      } else {
        handleOnChange({ ...match, mode: value });
      }
    },
    [handleOnChange, match]
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
