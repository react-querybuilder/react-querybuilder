import * as React from 'react';
import type { FullOperator } from 'react-querybuilder';
import { clsx, defaultOperators } from 'react-querybuilder';
import { relativeDateTimeToggleClassName } from './relativeDateTimeConstants';
import type { RelativeDateTimeModeController, RelativeDateTimeModeControlProps } from './types';
import { isRelativeDateTimeValue } from './utils';

/**
 * Compact absolute/relative toggle rendered by {@link toggleModeController}. A
 * `role="switch"` button whose default glyph is supplied by CSS (keyed on
 * `aria-checked`); override via the `toggleLabels` config.
 *
 * @group Components
 */
export const RelativeDateTimeModeToggle = ({
  isRelative,
  setMode,
  disabled,
  className,
  labels,
}: RelativeDateTimeModeControlProps): React.JSX.Element => {
  const onClick = React.useCallback(
    () => setMode(isRelative ? 'absolute' : 'relative'),
    [setMode, isRelative]
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isRelative}
      aria-label={labels.label}
      title={isRelative ? labels.relativeTitle : labels.absoluteTitle}
      disabled={disabled}
      className={clsx(relativeDateTimeToggleClassName, className)}
      onClick={onClick}>
      {isRelative ? labels.relativeContent : labels.absoluteContent}
    </button>
  );
};

/**
 * Zero-config default {@link RelativeDateTimeModeController}: derives the mode from the
 * value shape and renders a compact toggle button to switch between absolute and
 * relative entry.
 */
export const toggleModeController: RelativeDateTimeModeController = {
  isRelative: props => isRelativeDateTimeValue(props.value),
  ModeControl: RelativeDateTimeModeToggle,
};

/** Default operator name treated as "relative" by {@link operatorModeController}. */
export const defaultRelativeOperatorName = 'relative';

/**
 * Operators registered by {@link withRelativeOperators} to trigger relative mode in the
 * operator-driven controller. These signal mode only; the rule's value remains a
 * {@link RelativeDateTimeValue}.
 */
export const relativeDateTimeOperators: FullOperator[] = [
  { name: defaultRelativeOperatorName, value: defaultRelativeOperatorName, label: 'relative to' },
];

/**
 * Builds a {@link RelativeDateTimeModeController} that derives the mode from the rule's
 * operator. Pass a list of operator names (or a predicate) that should put the editor in
 * relative mode. No toggle is rendered — the operator selector is the mode affordance.
 */
export const createOperatorModeController = (
  relativeOperators: string[] | ((operator: string) => boolean)
): RelativeDateTimeModeController => ({
  isRelative: props =>
    typeof relativeOperators === 'function'
      ? relativeOperators(props.operator)
      : relativeOperators.includes(props.operator),
});

/**
 * Operator-driven {@link RelativeDateTimeModeController} preconfigured to treat the
 * {@link defaultRelativeOperatorName} operator as relative. Pair with
 * {@link withRelativeOperators} to register the operator on date fields.
 *
 * NOTE: operator names that are not standard comparison operators require matching
 * processor support for export — see the documentation.
 */
export const operatorModeController: RelativeDateTimeModeController = createOperatorModeController([
  defaultRelativeOperatorName,
]);

interface FieldWithOperators {
  operators?: FullOperator[];
  [key: string]: unknown;
}

/**
 * Appends {@link relativeDateTimeOperators} (or a custom set) to each field's `operators`
 * list, so the operator-driven controller has an operator to switch into relative mode.
 * Fields without an explicit `operators` list fall back to the core `defaultOperators`.
 */
export const withRelativeOperators = <F extends FieldWithOperators>(
  fields: F[],
  operators: FullOperator[] = relativeDateTimeOperators
): F[] =>
  fields.map(field => ({
    ...field,
    operators: [...(field.operators ?? (defaultOperators as FullOperator[])), ...operators],
  }));
