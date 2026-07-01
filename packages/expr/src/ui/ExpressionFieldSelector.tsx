import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type {
  FieldSelectorProps,
  FullOption,
  MatchModeOptions,
  ValueSourceFullOptions,
} from 'react-querybuilder';
import { update } from 'react-querybuilder';
import type { ExpressionNode } from '../types';
import { ExprTestID } from './defaults';
import { isUnaryArity } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';

/** Sentinel value for the wrapper selector's "no function" option. */
const NONE = '';

/**
 * Field-selector override hosting the rule's left-hand side. The inherited (or default)
 * field selector still picks the rule's `field` — which drives operator selection and
 * validation — while an optional wrapper selector in front of it applies a _unary_ function
 * around that field, stored as `rule.lhs = fn(field)`. Selecting "no function" clears
 * `rule.lhs`. Field changes re-wrap (or drop) the LHS atomically so the stored expression
 * always references the current field.
 *
 * The wrapper is shown only when {@link QueryBuilderExpressionsProps.allowFunctionsOnLHS}
 * permits it for the current field/operator; otherwise the plain field selector renders.
 */
export const ExpressionFieldSelector = (props: FieldSelectorProps): React.JSX.Element => {
  const { meta, translations, allowFunctionsOnLHS, inheritedFieldSelector } = useExpressionUI();
  const { rule, schema, path, level } = props;
  const { field, lhs, operator } = rule;
  const ValueSelectorControl = schema.controls.valueSelector;
  const FieldSelector = inheritedFieldSelector ?? ValueSelectorControl;

  const allow = useCallback(
    (f: string, op: string): boolean =>
      typeof allowFunctionsOnLHS === 'function' ? allowFunctionsOnLHS(f, op) : allowFunctionsOnLHS,
    [allowFunctionsOnLHS]
  );

  // The "no function" option plus every registered unary function.
  const fnOptions = useMemo<FullOption[]>(
    () => [
      { name: NONE, value: NONE, label: translations.exprLhsNone.label },
      ...Object.keys(meta)
        .filter(key => isUnaryArity(meta[key].arity))
        .map(key => ({ name: key, value: key, label: meta[key].label ?? key })),
    ],
    [meta, translations]
  );

  // Mirrors the core `onPropChange` reset cascade so a field change applied alongside
  // `lhs` resets operator/value/valueSource exactly as a normal field change would.
  const updateOptions = useMemo(
    () => ({
      resetOnFieldChange: schema.resetOnFieldChange,
      resetOnOperatorChange: schema.resetOnOperatorChange,
      getRuleDefaultOperator: schema.getRuleDefaultOperator,
      getValueSources: schema.getValueSources as unknown as (
        field: string,
        operator: string
      ) => ValueSourceFullOptions,
      getRuleDefaultValue: schema.getRuleDefaultValue,
      getMatchModes: schema.getMatchModes as unknown as (field: string) => MatchModeOptions,
    }),
    [schema]
  );

  // Wrap the field in the chosen unary function (or clear the wrapper).
  const onFnChange = useCallback(
    (v: string) =>
      schema.dispatchQuery(
        update(
          schema.getQuery(),
          'lhs',
          v === NONE
            ? undefined
            : ({ kind: 'func', fn: v, args: [{ kind: 'field', field }] } satisfies ExpressionNode),
          path
        )
      ),
    [schema, path, field]
  );

  // Re-point the LHS wrapper's inner field on field change (or drop it if the new field
  // disallows functions), applied atomically with the field update so reducers see one change.
  const onFieldChange = useCallback(
    (v: string) => {
      const nextField = `${v}`;
      const stillAllowed = allow(nextField, schema.getRuleDefaultOperator(nextField));
      const nextLhs: ExpressionNode | undefined =
        stillAllowed && lhs?.kind === 'func'
          ? { kind: 'func', fn: lhs.fn, args: [{ kind: 'field', field: nextField }] }
          : undefined;
      schema.dispatchQuery(
        update(schema.getQuery(), { field: nextField, lhs: nextLhs }, path, updateOptions)
      );
    },
    [schema, path, lhs, allow, updateOptions]
  );

  if (!allowFunctionsOnLHS) {
    return <FieldSelector {...props} />;
  }

  const currentFn = lhs?.kind === 'func' ? lhs.fn : NONE;

  return (
    <span className="expr-lhs">
      {allow(field, operator) && (
        <ValueSelectorControl
          testID={ExprTestID.exprLhsFnSelector}
          className="expr-fn"
          title={translations.exprLhsFunction.title}
          schema={schema}
          path={path}
          level={level}
          value={currentFn}
          options={fnOptions}
          multiple={false}
          listsAsArrays={false}
          handleOnChange={onFnChange}
        />
      )}
      <FieldSelector {...props} handleOnChange={onFieldChange} />
    </span>
  );
};
