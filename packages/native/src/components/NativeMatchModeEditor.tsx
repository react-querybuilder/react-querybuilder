import * as React from 'react';
import { useCallback } from 'react';
import type { FullField, MatchMode } from 'react-querybuilder';
import { parseNumber } from 'react-querybuilder';
import type { MatchModeEditorNativeProps } from '../types';

const dummyFieldData: FullField = { name: '', value: '', label: '' };

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
    title,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    numericEditorComponent: NumericEditorComponent = allProps.schema.controls.valueEditor,
    ...propsForValueSelector
  } = allProps;

  const { mode, threshold } = match;
  const matchModeLC = mode.toLowerCase();
  const thresholdNum = typeof threshold === 'number' ? Math.max(0, threshold) : 1;

  const handleChangeMode = useCallback(
    (mode: MatchMode) => {
      handleOnChange({ ...match, mode });
    },
    [handleOnChange, match]
  );

  const handleChangeThreshold = useCallback(
    (threshold: number) => {
      handleOnChange({ ...match, threshold: parseNumber(threshold, { parseNumbers: true }) });
    },
    [handleOnChange, match]
  );

  return (
    <React.Fragment>
      <SelectorComponent
        {...propsForValueSelector}
        handleOnChange={handleChangeMode}
        className={className}
        disabled={disabled}
        value={mode}
        options={options}
        listsAsArrays={false}
      />
      {['atleast', 'atmost', 'exactly'].includes(matchModeLC) && (
        <NumericEditorComponent
          skipHook
          inputType="decimal"
          // TODO: Implement `matchThresholdPlaceholderText`?
          // placeholder={placeHolderText}
          title={title}
          className={className}
          disabled={disabled}
          handleOnChange={handleChangeThreshold}
          field={''}
          operator={''}
          value={thresholdNum}
          valueSource={'value'}
          fieldData={dummyFieldData}
          schema={{ ...allProps.schema, parseNumbers: true }}
          path={[]}
          level={0}
          rule={{ field: '', operator: '=', value: thresholdNum }}
        />
      )}
    </React.Fragment>
  );
};
