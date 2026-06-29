import * as React from 'react';
import { useMemo } from 'react';
import type {
  FullField,
  FullOption,
  InputType,
  Path,
  RuleType,
  Schema,
  ValueEditorProps,
} from 'react-querybuilder';
import { ValueEditor } from 'react-querybuilder';
import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import type { ExpressionNodeKind } from './expressionEditorUtils';
import { changeFunction, defaultNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';

// Inert rule-scoped props for the schema-provided controls, which normally live inside a
// rule. The expression editor owns its node state, so these placeholders just satisfy the
// control contract.
const dummyPath: Path = [];
const dummyFieldData: FullField = { name: '', value: '', label: '' };
const dummyRule: RuleType = { field: '', operator: '=', value: '' };

// Static options for the node-`kind` selector.
const kindOptions: FullOption[] = [
  { name: 'field', value: 'field', label: 'Field' },
  { name: 'value', value: 'value', label: 'Value' },
  { name: 'func', value: 'func', label: 'Function' },
];

/** Props for {@link ExpressionEditor}. */
export interface ExpressionEditorProps {
  /** The node to edit. When `undefined`, an empty value node is assumed. */
  node: ExpressionNode | undefined;
  /** Called with the next node on any edit. */
  onChange: (node: ExpressionNode) => void;
  /** Functions selectable for `func` nodes. */
  registry: ExpressionFunctionRegistry;
  /**
   * Query builder schema. The nested selectors render via `schema.controls.valueSelector`
   * (and the literal editor via the inherited value editor) so they inherit the active
   * theme (Bootstrap, MUI, etc.).
   */
  schema: Schema<FullField, string>;
  /**
   * Input type inherited from the rule's field configuration. Threaded to the literal value
   * editor (driving the rendered input `type` and, with `parseNumbers`, number coercion) and
   * down to nested function-argument editors — so expression literals are parsed the same way
   * as the base configuration would parse a value for that field.
   */
  inputType?: InputType | null;
  /** Test/id prefix for this node (children derive nested ids from it). */
  testID?: string;
}

/**
 * Recursive editor for a single {@link ExpressionNode}. A `kind` selector switches between
 * a field reference, a literal value (parsed as a number when the host's `parseNumbers` is
 * enabled), and a function call whose arguments are themselves {@link ExpressionEditor}s —
 * enabling arbitrary nesting.
 *
 * Selectors render via `schema.controls.valueSelector` and the literal editor via the
 * _inherited_ value editor (the compat editor captured before {@link QueryBuilderExpressions}
 * overrides it), so nested controls match the host theme without re-entering the expression
 * wrapper.
 */
export const ExpressionEditor = ({
  node,
  onChange,
  registry,
  schema,
  inputType,
  testID = 'expr',
}: ExpressionEditorProps): React.JSX.Element => {
  const { inheritedValueEditor } = useExpressionUI();
  const n: ExpressionNode = node ?? { kind: 'value', value: '' };
  const ValueSelectorControl = schema.controls.valueSelector;
  // `schema.controls.valueEditor` is the expression override itself; use the inherited
  // (or default) editor for the literal so it stays themed and doesn't recurse.
  const ValueEditorControl: React.ComponentType<ValueEditorProps> =
    inheritedValueEditor ?? ValueEditor;

  const fnOptions = useMemo<FullOption[]>(
    () =>
      Object.keys(registry).map(key => ({
        name: key,
        value: key,
        label: registry[key].label ?? key,
      })),
    [registry]
  );

  return (
    <span className="expr-node" data-testid={testID}>
      <ValueSelectorControl
        testID={`${testID}-kind`}
        className="expr-kind"
        title="Expression kind"
        schema={schema}
        path={dummyPath}
        level={0}
        value={n.kind}
        options={kindOptions}
        multiple={false}
        listsAsArrays={false}
        handleOnChange={v =>
          onChange(defaultNode(v as ExpressionNodeKind, schema.fields, registry))
        }
      />

      {n.kind === 'field' && (
        <ValueSelectorControl
          testID={`${testID}-field`}
          className="expr-field"
          title="Field"
          schema={schema}
          path={dummyPath}
          level={0}
          value={n.field}
          options={schema.fields}
          multiple={false}
          listsAsArrays={false}
          handleOnChange={v => onChange({ kind: 'field', field: `${v}` })}
        />
      )}

      {n.kind === 'value' && (
        <ValueEditorControl
          skipHook
          testID={`${testID}-value`}
          className="expr-value"
          title="Value"
          schema={schema}
          path={dummyPath}
          level={0}
          field=""
          operator="="
          fieldData={dummyFieldData}
          rule={dummyRule}
          valueSource="value"
          value={n.value ?? ''}
          inputType={inputType}
          parseNumbers={schema.parseNumbers}
          handleOnChange={v => onChange({ kind: 'value', value: v })}
        />
      )}

      {n.kind === 'func' && (
        <span className="expr-func">
          <ValueSelectorControl
            testID={`${testID}-fn`}
            className="expr-fn"
            title="Function"
            schema={schema}
            path={dummyPath}
            level={0}
            value={n.fn}
            options={fnOptions}
            multiple={false}
            listsAsArrays={false}
            handleOnChange={v => onChange(changeFunction(`${v}`, n.args, schema.fields, registry))}
          />
          {n.args.map((arg, i) => (
            <ExpressionEditor
              // Positional function args: their index *is* the stable identity.
              // oxlint-disable-next-line react/no-array-index-key
              key={`${testID}-arg${i}`}
              node={arg}
              onChange={next =>
                onChange({ ...n, args: n.args.map((a, j) => (j === i ? next : a)) })
              }
              registry={registry}
              schema={schema}
              inputType={inputType}
              testID={`${testID}-arg${i}`}
            />
          ))}
        </span>
      )}
    </span>
  );
};
