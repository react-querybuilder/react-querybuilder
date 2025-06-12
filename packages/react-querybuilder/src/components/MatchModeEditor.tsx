import * as React from 'react';
import { useCallback } from 'react';
import type { FullField, MatchMode, MatchModeEditorProps, Schema } from '../types';
import { parseNumber } from '../utils';

const dummyFieldData: FullField = { name: '', value: '', label: '' };

/**
 * Default `matchModeEditor` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const MatchModeEditor = (allProps: MatchModeEditorProps): React.JSX.Element | null => {
  const {
    match,
    options,
    handleOnChange,
    title,
    className,
    disabled,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    numericEditorComponent: NumericEditorComponent = allProps.schema.controls.valueEditor,
    // fieldData: _fieldData,
    // ...propsForValueSelector
  } = allProps;

  const thresholdNum = typeof match.threshold === 'number' ? Math.max(0, match.threshold) : 1;

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
        // {...propsForValueSelector}
        schema={allProps.schema as unknown as Schema<FullField, string>}
        testID={testID}
        className={className}
        title={title}
        handleOnChange={handleChangeMode}
        disabled={disabled}
        value={match.mode}
        options={options}
        multiple={false}
        listsAsArrays={false}
        path={[]}
        level={0}
      />
      {['atleast', 'atmost', 'exactly'].includes(match.mode?.toLowerCase()) && (
        <NumericEditorComponent
          skipHook
          data-testid={testID}
          inputType="number"
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
