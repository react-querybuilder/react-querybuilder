import * as React from 'react';
import { useCallback } from 'react';
import { TextInput } from 'react-native';
import type { MatchMode } from 'react-querybuilder';
import { parseNumber } from 'react-querybuilder';
import type { MatchModeEditorNativeProps } from '../types';

/**
 * Default `matchModeEditor` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const NativeMatchModeEditor = (
  allProps: MatchModeEditorNativeProps
): React.JSX.Element | null => {
  const {
    match,
    options,
    handleOnChange,
    className,
    disabled,
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
