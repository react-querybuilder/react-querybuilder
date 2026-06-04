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

/**
 * Builds an operator-driven {@link RelativeDateTimeModeController} that derives the mode
 * from the rule's operator. Pass the operator name(s) (or a predicate) that should put the
 * editor in relative mode. No toggle is rendered — the operator selector is the mode
 * affordance.
 *
 * NOTE: the chosen operators only signal _mode_; the rule's value remains a
 * {@link RelativeDateTimeValue}. For these operators to export correctly, map each one to a
 * real comparison operator via `context.relativeOperatorMap` when calling `formatQuery`
 * (e.g. `{ relativeEq: '=' }`). See the documentation.
 */
export const createOperatorModeController = (
  relativeOperators: string[] | ((operator: string) => boolean)
): RelativeDateTimeModeController => ({
  isRelative: props =>
    typeof relativeOperators === 'function'
      ? relativeOperators(props.operator)
      : relativeOperators.includes(props.operator),
});

interface FieldWithOperators {
  operators?: FullOperator[];
  [key: string]: unknown;
}

/**
 * Appends the given `operators` to each field's `operators` list, so the operator-driven
 * controller (see {@link createOperatorModeController}) has an operator to switch into
 * relative mode. Fields without an explicit `operators` list fall back to the core
 * `defaultOperators`.
 */
export const withRelativeOperators = <F extends FieldWithOperators>(
  fields: F[],
  operators: FullOperator[]
): F[] =>
  fields.map(field => ({
    ...field,
    operators: [...(field.operators ?? (defaultOperators as FullOperator[])), ...operators],
  }));
