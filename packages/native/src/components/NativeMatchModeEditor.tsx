import * as React from 'react';
import { lc, useMatchModeEditor, type FullField, type Path } from 'react-querybuilder';
import type { MatchModeEditorNativeProps } from '../types';

const dummyFieldData: FullField = { name: '', value: '', label: '' };
const requiresThreshold = (mm?: string | null) =>
  ['atleast', 'atmost', 'exactly'].includes(lc(mm) ?? /* istanbul ignore next */ '');
const dummyPath: Path = [];

/**
 * Default `matchModeEditor` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const NativeMatchModeEditor = (
  props: MatchModeEditorNativeProps
): React.JSX.Element | null => {
  const {
    match,
    testID,
    options,
    className,
    disabled,
    title,
    schema,
    selectorComponent: SelectorComponent = props.schema.controls.valueSelector,
    numericEditorComponent: NumericEditorComponent = props.schema.controls.valueEditor,
  } = props;

  const { thresholdNum, thresholdRule, thresholdSchema, handleChangeMode, handleChangeThreshold } =
    useMatchModeEditor(props);

  return (
    <React.Fragment>
      <SelectorComponent
        testID={testID}
        schema={schema}
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
          value={`${thresholdNum}`}
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
