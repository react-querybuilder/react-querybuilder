import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { FullField, FullOption, Path, ValueEditorProps } from 'react-querybuilder';
import {
  clsx,
  parseNumber,
  standardClassnames,
  useValueEditor,
  ValueEditor,
} from 'react-querybuilder';
import { DateTimeValueEditor } from './QueryBuilderDateTime';
import type { RelativeDateTimeAnchor, RelativeDateTimeUnit, RelativeDateTimeValue } from './types';
import { isRelativeDateTimeValue } from './utils';

const dummyPath: Path = [];
const dummyFieldData: FullField = { name: '', value: '', label: '' };

/** Default value applied when switching a rule to relative mode. */
export const defaultRelativeDateTimeValue: RelativeDateTimeValue = {
  mode: 'relative',
  anchor: 'now',
  offset: 0,
  unit: 'day',
};

const modeOptions: FullOption<'absolute' | 'relative'>[] = [
  { name: 'absolute', value: 'absolute', label: 'Absolute' },
  { name: 'relative', value: 'relative', label: 'Relative' },
];

const anchorOptions: FullOption<RelativeDateTimeAnchor>[] = [
  { name: 'now', value: 'now', label: 'now' },
  { name: 'startOfDay', value: 'startOfDay', label: 'start of day' },
  { name: 'endOfDay', value: 'endOfDay', label: 'end of day' },
  { name: 'startOfWeek', value: 'startOfWeek', label: 'start of week' },
  { name: 'endOfWeek', value: 'endOfWeek', label: 'end of week' },
  { name: 'startOfMonth', value: 'startOfMonth', label: 'start of month' },
  { name: 'endOfMonth', value: 'endOfMonth', label: 'end of month' },
  { name: 'startOfYear', value: 'startOfYear', label: 'start of year' },
  { name: 'endOfYear', value: 'endOfYear', label: 'end of year' },
];

const unitOptions: FullOption<RelativeDateTimeUnit>[] = [
  { name: 'minute', value: 'minute', label: 'minute(s)' },
  { name: 'hour', value: 'hour', label: 'hour(s)' },
  { name: 'day', value: 'day', label: 'day(s)' },
  { name: 'week', value: 'week', label: 'week(s)' },
  { name: 'month', value: 'month', label: 'month(s)' },
  { name: 'year', value: 'year', label: 'year(s)' },
];

/**
 * Value editor with support for {@link RelativeDateTimeValue relative date/time values}
 * (e.g. "three months ago" or "the beginning of this year"). A mode selector toggles
 * between absolute mode (a normal date/time input via {@link DateTimeValueEditor}) and
 * relative mode (anchor + signed offset + unit). The unit selector is hidden when the
 * offset is `0`. All sub-controls render the schema's themed components, so compat
 * packages style them automatically.
 *
 * @group Components
 */
export const RelativeDateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const { valueListItemClassName } = useValueEditor(props);

  const { className, value, handleOnChange, schema, disabled, title, testID } = props;
  const { suppressStandardClassnames } = schema;

  const SelectorComponent = props.selectorComponent ?? schema.controls.valueSelector;

  const isRelative = isRelativeDateTimeValue(value);
  const relValue: RelativeDateTimeValue = isRelative ? value : defaultRelativeDateTimeValue;

  const numericSchema = useMemo(() => ({ ...schema, parseNumbers: true }), [schema]);

  const handleChangeMode = useCallback(
    (mode: string) => handleOnChange(mode === 'relative' ? defaultRelativeDateTimeValue : ''),
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

  return (
    <span className={outerClassname}>
      <SelectorComponent
        schema={schema}
        testID={testID}
        title={title}
        className={valueListItemClassName}
        handleOnChange={handleChangeMode}
        disabled={disabled}
        value={isRelative ? 'relative' : 'absolute'}
        options={modeOptions}
        multiple={false}
        listsAsArrays={false}
        path={dummyPath}
        level={0}
      />
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
            options={anchorOptions}
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
              options={unitOptions}
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
