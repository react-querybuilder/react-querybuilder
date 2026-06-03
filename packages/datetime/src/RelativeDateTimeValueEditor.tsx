import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { FullField, Path, ValueEditorProps, ValueSelectorProps } from 'react-querybuilder';
import {
  clsx,
  parseNumber,
  standardClassnames,
  toArray,
  useValueEditor,
  ValueEditor,
} from 'react-querybuilder';
import { DateTimeValueEditor } from './QueryBuilderDateTime';
import type { ResolvedRelativeDateTimeConfig } from './RelativeDateTimeConfigContext';
import { useRelativeDateTimeConfig } from './RelativeDateTimeConfigContext';
import { defaultRelativeDateTimeValue } from './relativeDateTimeConstants';
import type { RelativeDateTimeAnchor, RelativeDateTimeUnit, RelativeDateTimeValue } from './types';
import { isRelativeDateTimeValue } from './utils';

const dummyPath: Path = [];
const dummyFieldData: FullField = { name: '', value: '', label: '' };

/** Splits a value into the from/to pair used by between/notBetween, object-safe. */
const toBetweenArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : isRelativeDateTimeValue(value) ? [value] : toArray(value);

interface RelativeDateTimeSingleValueEditorProps {
  /** The original value editor props (for mode derivation and absolute rendering). */
  baseProps: ValueEditorProps;
  /** The value for this slot (the whole value, or one element of a between pair). */
  value: unknown;
  /** Emits a new value for this slot. */
  onChange: (value: unknown) => void;
  /** Operator passed to the absolute editor (forced to `=` for between slots). */
  absoluteOperator: string;
  config: ResolvedRelativeDateTimeConfig;
  SelectorComponent: React.ComponentType<ValueSelectorProps>;
  valueListItemClassName?: string;
  numericSchema: ValueEditorProps['schema'];
}

/**
 * Renders a single absolute-or-relative date/time value: a mode affordance (per the
 * controller) plus either an absolute date input or anchor + signed offset + unit
 * selectors. Reused once per slot so between/notBetween can mix bounds (e.g. an absolute
 * "from" and a relative "to").
 */
const RelativeDateTimeSingleValueEditor = ({
  baseProps,
  value,
  onChange,
  absoluteOperator,
  config,
  SelectorComponent,
  valueListItemClassName,
  numericSchema,
}: RelativeDateTimeSingleValueEditorProps): React.JSX.Element => {
  const { schema, disabled, title, testID } = baseProps;
  const { modeController, anchors, units, toggleLabels } = config;

  const isRelative = modeController.isRelative({ ...baseProps, value });
  const relValue: RelativeDateTimeValue = isRelativeDateTimeValue(value)
    ? value
    : defaultRelativeDateTimeValue;

  const handleSetMode = useCallback(
    (mode: 'absolute' | 'relative') =>
      onChange(mode === 'relative' ? defaultRelativeDateTimeValue : ''),
    [onChange]
  );

  const handleChangeAnchor = useCallback(
    (anchor: string) => onChange({ ...relValue, anchor: anchor as RelativeDateTimeAnchor }),
    [onChange, relValue]
  );

  const handleChangeOffset = useCallback(
    (offset: unknown) =>
      onChange({
        ...relValue,
        offset: (parseNumber(offset, { parseNumbers: true }) as number) || 0,
      }),
    [onChange, relValue]
  );

  const handleChangeUnit = useCallback(
    (unit: string) => onChange({ ...relValue, unit: unit as RelativeDateTimeUnit }),
    [onChange, relValue]
  );

  const { ModeControl } = modeController;

  return (
    <React.Fragment>
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
        <DateTimeValueEditor
          {...baseProps}
          operator={absoluteOperator}
          value={value}
          handleOnChange={onChange}
          className={standardClassnames.value}
        />
      )}
    </React.Fragment>
  );
};

/**
 * Value editor with support for {@link RelativeDateTimeValue relative date/time values}
 * (e.g. "three months ago" or "the beginning of this year"). How the user switches
 * between absolute and relative modes is delegated to a pluggable
 * {@link RelativeDateTimeModeController} (default: a compact toggle), supplied via
 * {@link QueryBuilderDateTime}. In relative mode it renders anchor + signed offset + unit
 * selectors; the unit selector is hidden when the offset is `0`.
 *
 * For the `between`/`notBetween` operators it renders two independent value editors (each
 * with its own mode affordance) and stores the bounds as a two-element array, so the from
 * and to bounds can independently be absolute or relative.
 *
 * @group Components
 */
export const RelativeDateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const { valueListItemClassName } = useValueEditor(props);

  const { className, value, handleOnChange, schema, operator, separator } = props;
  const { suppressStandardClassnames } = schema;

  const SelectorComponent = props.selectorComponent ?? schema.controls.valueSelector;

  const config = useRelativeDateTimeConfig();

  const numericSchema = useMemo(() => ({ ...schema, parseNumbers: true }), [schema]);

  const outerClassname = useMemo(
    () => clsx(suppressStandardClassnames || standardClassnames.valueDateTimeRelative, className),
    [suppressStandardClassnames, className]
  );

  const isBetween = operator === 'between' || operator === 'notBetween';

  // For between/notBetween, store the bounds as a two-element array. Relative values are
  // objects (which can't survive comma-joining), so the array is emitted directly,
  // regardless of `listsAsArrays`.
  const valueAsArray = useMemo(() => toBetweenArray(value), [value]);

  const handleChangeBound = useCallback(
    (index: number) => (boundValue: unknown) => {
      const next = [valueAsArray[0], valueAsArray[1]];
      next[index] = boundValue;
      handleOnChange(next);
    },
    [valueAsArray, handleOnChange]
  );

  if (isBetween) {
    return (
      <span className={outerClassname}>
        <RelativeDateTimeSingleValueEditor
          baseProps={props}
          value={valueAsArray[0]}
          onChange={handleChangeBound(0)}
          absoluteOperator="="
          config={config}
          SelectorComponent={SelectorComponent}
          valueListItemClassName={valueListItemClassName}
          numericSchema={numericSchema}
        />
        {separator}
        <RelativeDateTimeSingleValueEditor
          baseProps={props}
          value={valueAsArray[1]}
          onChange={handleChangeBound(1)}
          absoluteOperator="="
          config={config}
          SelectorComponent={SelectorComponent}
          valueListItemClassName={valueListItemClassName}
          numericSchema={numericSchema}
        />
      </span>
    );
  }

  return (
    <span className={outerClassname}>
      <RelativeDateTimeSingleValueEditor
        baseProps={props}
        value={value}
        onChange={handleOnChange}
        absoluteOperator={operator}
        config={config}
        SelectorComponent={SelectorComponent}
        valueListItemClassName={valueListItemClassName}
        numericSchema={numericSchema}
      />
    </span>
  );
};
