import * as React from 'react';
import type { ExpressionNode } from '../types';
import type { ExpressionFunctionRegistry } from '../types';
import type { ExpressionFieldOption, ExpressionNodeKind } from './expressionEditorUtils';
import { changeFunction, coerceNumber, defaultNode } from './expressionEditorUtils';

/** Props for {@link ExpressionEditor}. */
export interface ExpressionEditorProps {
  /** The node to edit. When `undefined`, an empty value node is assumed. */
  node: ExpressionNode | undefined;
  /** Called with the next node on any edit. */
  onChange: (node: ExpressionNode) => void;
  /** Functions selectable for `func` nodes. */
  registry: ExpressionFunctionRegistry;
  /** Fields selectable for `field` nodes. */
  fields: ExpressionFieldOption[];
  /** Test/id prefix for this node (children derive nested ids from it). */
  testID?: string;
}

/**
 * Recursive editor for a single {@link ExpressionNode}. A `kind` selector switches between
 * a field reference, a literal value (with an optional numeric toggle), and a function call
 * whose arguments are themselves {@link ExpressionEditor}s — enabling arbitrary nesting.
 */
export const ExpressionEditor = ({
  node,
  onChange,
  registry,
  fields,
  testID = 'expr',
}: ExpressionEditorProps): React.JSX.Element => {
  const n: ExpressionNode = node ?? { kind: 'value', value: '' };

  return (
    <span className="expr-node" data-testid={testID}>
      <select
        className="expr-kind"
        data-testid={`${testID}-kind`}
        aria-label="Expression kind"
        value={n.kind}
        onChange={e =>
          onChange(defaultNode(e.target.value as ExpressionNodeKind, fields, registry))
        }>
        <option value="field">Field</option>
        <option value="value">Value</option>
        <option value="func">Function</option>
      </select>

      {n.kind === 'field' && (
        <select
          className="expr-field"
          data-testid={`${testID}-field`}
          aria-label="Field"
          value={n.field}
          onChange={e => onChange({ kind: 'field', field: e.target.value })}>
          {fields.map(f => (
            <option key={f.name} value={f.name}>
              {f.label}
            </option>
          ))}
        </select>
      )}

      {n.kind === 'value' && (
        <>
          <input
            className="expr-value"
            data-testid={`${testID}-value`}
            aria-label="Value"
            value={`${n.value ?? ''}`}
            onChange={e =>
              onChange({
                kind: 'value',
                value: n.valueType === 'number' ? coerceNumber(e.target.value) : e.target.value,
                valueType: n.valueType,
              })
            }
          />
          <label className="expr-value-number">
            <input
              type="checkbox"
              data-testid={`${testID}-number`}
              checked={n.valueType === 'number'}
              onChange={e =>
                onChange({
                  kind: 'value',
                  value: e.target.checked ? coerceNumber(n.value) : `${n.value ?? ''}`,
                  valueType: e.target.checked ? 'number' : undefined,
                })
              }
            />
            #
          </label>
        </>
      )}

      {n.kind === 'func' && (
        <span className="expr-func">
          <select
            className="expr-fn"
            data-testid={`${testID}-fn`}
            aria-label="Function"
            value={n.fn}
            onChange={e => onChange(changeFunction(e.target.value, n.args, fields, registry))}>
            {Object.keys(registry).map(key => (
              <option key={key} value={key}>
                {registry[key].label ?? key}
              </option>
            ))}
          </select>
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
              fields={fields}
              testID={`${testID}-arg${i}`}
            />
          ))}
        </span>
      )}
    </span>
  );
};
