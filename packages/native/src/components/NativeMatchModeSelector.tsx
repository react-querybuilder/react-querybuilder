import * as React from 'react';
import { useCallback } from 'react';
import { TextInput } from 'react-native';
import type { MatchModeName } from 'react-querybuilder';
import { parseNumber } from 'react-querybuilder';
import type { MatchModeSelectorNativeProps } from '../types';

/**
 * Default `matchModeSelector` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const NativeMatchModeSelector = (
  allProps: MatchModeSelectorNativeProps
): React.JSX.Element | null => {
  const {
    matchMode,
    options,
    handleOnChange,
    className,
    disabled,
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
        handleOnChange={handleChange}
        className={className}
        disabled={disabled}
        value={mode}
        options={options}
        listsAsArrays={false}
      />
      {['atleast', 'atmost', 'exactly'].includes(matchModeLC) && (
        <TextInput
          // style={styles.value}
          inputMode="decimal"
          // placeholder={placeHolderText}
          value={`${thresholdNum}`}
          // TODO: disabled={disabled}
          onChangeText={v => handleChange(parseNumber(v, { parseNumbers: true }))}
        />
      )}
    </React.Fragment>
  );
};
