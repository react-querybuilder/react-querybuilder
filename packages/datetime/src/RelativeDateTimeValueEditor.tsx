import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { FullField, Path, ValueEditorProps } from 'react-querybuilder';
import {
  clsx,
  parseNumber,
  standardClassnames,
  useValueEditor,
  ValueEditor,
} from 'react-querybuilder';
import { DateTimeValueEditor } from './QueryBuilderDateTime';
import { useRelativeDateTimeConfig } from './RelativeDateTimeConfigContext';
import { defaultRelativeDateTimeValue } from './relativeDateTimeConstants';
import type { RelativeDateTimeAnchor, RelativeDateTimeUnit, RelativeDateTimeValue } from './types';
import { isRelativeDateTimeValue } from './utils';

const dummyPath: Path = [];
const dummyFieldData: FullField = { name: '', value: '', label: '' };

/**
 * Value editor with support for {@link RelativeDateTimeValue relative date/time values}
 * (e.g. "three months ago" or "the beginning of this year"). How the user switches
 * between absolute and relative modes is delegated to a pluggable
 * {@link RelativeDateTimeModeController} (default: a compact toggle), supplied via
 * {@link QueryBuilderDateTime}. In relative mode it renders anchor + signed offset + unit
 * selectors; the unit selector is hidden when the offset is `0`. All sub-controls render
 * the schema's themed components, so compat packages style them automatically.
 *
 * @group Components
 */
export const RelativeDateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const { valueListItemClassName } = useValueEditor(props);

  const { className, value, handleOnChange, schema, disabled, title, testID } = props;
  const { suppressStandardClassnames } = schema;

  const SelectorComponent = props.selectorComponent ?? schema.controls.valueSelector;

  const { modeController, anchors, units, toggleLabels } = useRelativeDateTimeConfig();

  const isRelative = modeController.isRelative(props);
  const relValue: RelativeDateTimeValue = isRelativeDateTimeValue(value)
    ? value
    : defaultRelativeDateTimeValue;

  const numericSchema = useMemo(() => ({ ...schema, parseNumbers: true }), [schema]);

  const handleSetMode = useCallback(
    (mode: 'absolute' | 'relative') =>
      handleOnChange(mode === 'relative' ? defaultRelativeDateTimeValue : ''),
    [handleOnChange]
  );

  const handleChangeAnchor = useCallback(
    (anchor: string) => handleOnChange({ ...relValue, anchor: anchor as RelativeDateTimeAnchor }),
    [handleOnChange, relValue]
  );

  const handleChangeOffset = useCallback(
    (offset: unknown) =>
      handleOnChange({
        ...relValue,
        offset: (parseNumber(offset, { parseNumbers: true }) as number) || 0,
      }),
    [handleOnChange, relValue]
  );

  const handleChangeUnit = useCallback(
    (unit: string) => handleOnChange({ ...relValue, unit: unit as RelativeDateTimeUnit }),
    [handleOnChange, relValue]
  );

  const outerClassname = useMemo(
    () => clsx(suppressStandardClassnames || standardClassnames.valueDateTimeRelative, className),
    [suppressStandardClassnames, className]
  );

  const { ModeControl } = modeController;

  return (
    <span className={outerClassname}>
      {ModeControl && (
        <ModeControl
          isRelative={isRelative}
          setMode={handleSetMode}
          schema={schema}
          disabled={disabled}
          className={valueListItemClassName}
          title={title}
          testID={testID}
          labels={toggleLabels}
        />
      )}
      {isRelative ? (
        <React.Fragment>
          <SelectorComponent
            schema={schema}
            testID={testID}
            title={title}
            className={valueListItemClassName}
            handleOnChange={handleChangeAnchor}
            disabled={disabled}
            value={relValue.anchor}
            options={anchors}
            multiple={false}
            listsAsArrays={false}
            path={dummyPath}
            level={0}
          />
          <ValueEditor
            skipHook
            testID={testID}
            inputType="number"
            title={title}
            className={valueListItemClassName}
            disabled={disabled}
            handleOnChange={handleChangeOffset}
            field={''}
            operator={''}
            value={relValue.offset}
            valueSource={'value'}
            fieldData={dummyFieldData}
            schema={numericSchema}
            path={dummyPath}
            level={0}
            rule={{ field: '', operator: '=', value: relValue.offset }}
          />
          {relValue.offset !== 0 && (
            <SelectorComponent
              schema={schema}
              testID={testID}
              title={title}
              className={valueListItemClassName}
              handleOnChange={handleChangeUnit}
              disabled={disabled}
              value={relValue.unit}
              options={units}
              multiple={false}
              listsAsArrays={false}
              path={dummyPath}
              level={0}
            />
          )}
        </React.Fragment>
      ) : (
        <DateTimeValueEditor {...props} className={standardClassnames.value} />
      )}
    </span>
  );
};
