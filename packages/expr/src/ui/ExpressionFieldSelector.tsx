import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type {
  FieldSelectorProps,
  FullField,
  FullOption,
  MatchModeOptions,
  ValueSourceFullOptions,
} from 'react-querybuilder';
import { update } from 'react-querybuilder';
import type { ExpressionNode } from '../types';
import { ExprTestID } from './defaults';
import { ExpressionEditor, type ExpressionEditorProps } from './ExpressionEditor';
import { admitsLHSArg, lhsFuncNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';

/** Sentinel value for the wrapper selector's "no function" option. */
const NONE = '';

/** Props for {@link LhsArgEditor}. */
interface LhsArgEditorProps extends Pick<
  ExpressionEditorProps,
  'node' | 'meta' | 'schema' | 'inputType' | 'testID'
> {
  /** Position of this operand within the wrapper's `args` (always `>= 1`; arg 0 is the field). */
  index: number;
  /** The wrapper function name, threaded through so arg 0 is preserved on write-back. */
  fn: string;
  /** The wrapper's current argument list, rebuilt (with this operand replaced) on change. */
  args: ExpressionNode[];
  /** Commits an edited operand back to `rule.lhs`. */
  onArgChange: (fn: string, args: ExpressionNode[], index: number, next: ExpressionNode) => void;
}

/**
 * Memoized wrapper around {@link ExpressionEditor} for a single extra LHS operand. Owns a
 * stable `onChange` bound to its fixed `index`, so re-renders of the parent field selector do
 * not create a new function per operand.
 */
const LhsArgEditor = React.memo(function LhsArgEditor({
  index,
  fn,
  args,
  node,
  meta,
  schema,
  inputType,
  testID,
  onArgChange,
}: LhsArgEditorProps): React.JSX.Element {
  const onChange = useCallback(
    (next: ExpressionNode) => onArgChange(fn, args, index, next),
    [onArgChange, fn, args, index]
  );
  return (
    <ExpressionEditor
      node={node}
      onChange={onChange}
      meta={meta}
      schema={schema}
      inputType={inputType}
      testID={testID}
    />
  );
});

/**
 * Field-selector override hosting the rule's left-hand side. The inherited (or default)
 * field selector still picks the rule's `field` — the _governing field_, which drives
 * operator selection and validation — while an optional wrapper selector in front of it
 * applies a function around that field, stored as `rule.lhs = fn(field, …args)`. The
 * governing field always occupies argument 0; any further arguments of a multi-argument
 * function are edited by nested {@link ExpressionEditor}s and may themselves be fields,
 * literals, or further function calls. Selecting "no function" clears `rule.lhs`. Field
 * changes re-point arg 0 (or drop the wrapper) atomically so the stored expression always
 * references the current field, preserving the extra arguments.
 *
 * The wrapper (and its argument editors) render only when
 * {@link QueryBuilderExpressionsProps.allowFunctionsOnLHS} permits it for the current
 * field/operator; otherwise the plain field selector renders.
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

  // The "no function" option plus every function that can take the governing field as an
  // argument (i.e. accepts at least one operand).
  const fnOptions = useMemo<FullOption[]>(
    () => [
      { name: NONE, value: NONE, label: translations.exprLhsNone.label },
      ...Object.keys(meta)
        .filter(key => admitsLHSArg(meta[key].arity))
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

  // Wrap the field in the chosen function (or clear the wrapper), preserving any extra
  // operands already entered when switching between multi-argument functions.
  const onFnChange = useCallback(
    (v: string) =>
      schema.dispatchQuery(
        update(
          schema.getQuery(),
          'lhs',
          v === NONE
            ? undefined
            : lhsFuncNode(v, field, lhs?.kind === 'func' ? lhs.args : [], schema.fields, meta),
          path
        )
      ),
    [schema, path, field, lhs, meta]
  );

  // Re-point the wrapper's governing field (arg 0) on field change — keeping the function and
  // its extra operands — or drop the wrapper if the new field disallows functions. Applied
  // atomically with the field update so reducers see a single change.
  const onFieldChange = useCallback(
    (v: string) => {
      const nextField = `${v}`;
      const stillAllowed = allow(nextField, schema.getRuleDefaultOperator(nextField));
      const nextLhs: ExpressionNode | undefined =
        stillAllowed && lhs?.kind === 'func'
          ? lhsFuncNode(lhs.fn, nextField, lhs.args, schema.fields, meta)
          : undefined;
      schema.dispatchQuery(
        update(schema.getQuery(), { field: nextField, lhs: nextLhs }, path, updateOptions)
      );
    },
    [schema, path, lhs, allow, updateOptions, meta]
  );

  // Write an edited extra operand back into the stored wrapper node. The current `fn`/`args`
  // are threaded in from render so arg 0 (the governing field) is never disturbed.
  const onArgChange = useCallback(
    (fn: string, args: ExpressionNode[], index: number, next: ExpressionNode) =>
      schema.dispatchQuery(
        update(
          schema.getQuery(),
          'lhs',
          { kind: 'func', fn, args: args.map((a, j) => (j === index ? next : a)) },
          path
        )
      ),
    [schema, path]
  );

  if (!allowFunctionsOnLHS) {
    return <FieldSelector {...props} />;
  }

  const wrapping = allow(field, operator);
  const wrapper = wrapping && lhs?.kind === 'func' ? lhs : undefined;
  const wrapperFn = wrapper?.fn ?? NONE;

  // The governing field's input type, resolved exactly as the rule would, threaded to nested
  // literal argument editors so their inputs match the field configuration. A field absent
  // from the map (e.g. a saved rule referencing a since-removed field) falls back to a stub.
  const fieldData: FullField = schema.fieldMap[field] ?? {
    name: field,
    value: field,
    label: field,
  };
  const inputType = fieldData.inputType ?? schema.getInputType(field, operator, { fieldData });

  return (
    <span className="expr-lhs">
      {wrapping && (
        <ValueSelectorControl
          testID={ExprTestID.exprLhsFnSelector}
          className="expr-fn"
          title={translations.exprLhsFunction.title}
          schema={schema}
          path={path}
          level={level}
          value={wrapperFn}
          options={fnOptions}
          multiple={false}
          listsAsArrays={false}
          handleOnChange={onFnChange}
        />
      )}
      <FieldSelector {...props} handleOnChange={onFieldChange} />
      {wrapper &&
        // Arg 0 is the governing field (in the plain selector above); extra operands start at 1.
        // `wrapper` is the stable `lhs` node, so `wrapper.args` is not a fresh array in render.
        wrapper.args.slice(1).map((arg, i) => {
          const argIndex = i + 1;
          const testID = `${ExprTestID.exprLhsArgEditor}-${argIndex}`;
          return (
            <LhsArgEditor
              key={testID}
              index={argIndex}
              fn={wrapper.fn}
              args={wrapper.args}
              node={arg}
              meta={meta}
              schema={schema}
              inputType={inputType}
              testID={testID}
              onArgChange={onArgChange}
            />
          );
        })}
    </span>
  );
};
