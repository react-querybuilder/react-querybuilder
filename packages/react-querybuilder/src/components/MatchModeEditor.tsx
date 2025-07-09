import { lc, parseNumber } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback } from 'react';
import type { FullField, MatchMode, MatchModeEditorProps, Path, RuleType, Schema } from '../types';

const dummyFieldData: FullField = { name: '', value: '', label: '' };
const requiresThreshold = (mm?: string | null | undefined) =>
  ['atleast', 'atmost', 'exactly'].includes(lc(mm) ?? /* istanbul ignore next */ '');
const dummyPath: Path = [];

/**
 * Default `matchModeEditor` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const MatchModeEditor = (props: MatchModeEditorProps): React.JSX.Element | null => {
  const {
    match,
    options,
    title,
    className,
    disabled,
    testID,
    schema,
    selectorComponent: SelectorComponent = props.schema.controls.valueSelector,
    numericEditorComponent: NumericEditorComponent = props.schema.controls.valueEditor,
  } = props;

  const { thresholdNum, thresholdRule, thresholdSchema, handleChangeMode, handleChangeThreshold } =
    useMatchModeEditor(props);

  return (
    <React.Fragment>
      <SelectorComponent
        schema={schema}
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
          testID={testID}
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

export interface UseMatchModeEditor {
  thresholdNum: number;
  thresholdRule: RuleType;
  thresholdSchema: Schema<FullField, string>;
  handleChangeMode: (mode: MatchMode) => void;
  handleChangeThreshold: (threshold: number) => void;
}
export const useMatchModeEditor = (props: MatchModeEditorProps): UseMatchModeEditor => {
  const { match, handleOnChange } = props;

  const thresholdNum = React.useMemo(
    () => (typeof match.threshold === 'number' ? Math.max(0, match.threshold) : 1),
    [match.threshold]
  );
  const thresholdRule = React.useMemo(
    () => ({ field: '', operator: '=', value: thresholdNum }),
    [thresholdNum]
  );
  const thresholdSchema = React.useMemo(
    () => ({ ...props.schema, parseNumbers: true }),
    [props.schema]
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

  return {
    thresholdNum,
    thresholdRule,
    thresholdSchema,
    handleChangeMode,
    handleChangeThreshold,
  };
};
