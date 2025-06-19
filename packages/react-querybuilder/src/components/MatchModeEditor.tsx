import * as React from 'react';
import { useCallback } from 'react';
import type { FullField, MatchMode, MatchModeEditorProps, Path, Schema } from '../types';
import { parseNumber } from '../utils';

const dummyFieldData: FullField = { name: '', value: '', label: '' };
const requiresThreshold = (mm?: string | null | undefined) =>
  ['atleast', 'atmost', 'exactly'].includes(mm?.toLowerCase() ?? /* istanbul ignore next */ '');
const dummyPath: Path = [];

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

  const thresholdNum = React.useMemo(
    () => (typeof match.threshold === 'number' ? Math.max(0, match.threshold) : 1),
    [match.threshold]
  );
  const thresholdRule = React.useMemo(
    () => ({ field: '', operator: '=', value: thresholdNum }),
    [thresholdNum]
  );
  const thresholdSchema = React.useMemo(
    () => ({ ...allProps.schema, parseNumbers: true }),
    [allProps.schema]
  );

  const handleChangeMode = useCallback(
    (mode: MatchMode) => {
      if (requiresThreshold(mode) && typeof match.threshold !== 'number') {
        handleOnChange({ ...match, mode, threshold: 1 });
      } else {
        handleOnChange({ ...match, mode });
      }
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
        path={dummyPath}
        level={0}
      />
      {requiresThreshold(match.mode) && (
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
          schema={thresholdSchema}
          path={dummyPath}
          level={0}
          rule={thresholdRule}
        />
      )}
    </React.Fragment>
  );
};
