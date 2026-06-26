import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { FullField, FieldSelectorProps } from 'react-querybuilder';
import { update, ValueSelector } from 'react-querybuilder';
import type { ExpressionNode } from '../types';
import { ExpressionEditor } from './ExpressionEditor';
import { defaultNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';
import { toFieldOptions } from './fieldOptions';

/**
 * Field-selector override hosting the rule's left-hand side. The inherited (or default)
 * field selector still picks the rule's `field` — which drives operator selection and
 * validation (the "sentinel field") — while a toggle reveals an {@link ExpressionEditor}
 * bound to `rule.lhs`. When the toggle is off, `rule.lhs` is cleared and the rule behaves
 * normally.
 */
export const ExpressionFieldSelector = (props: FieldSelectorProps): React.JSX.Element => {
  const { registry, inheritedFieldSelector } = useExpressionUI();
  const FieldSelector = inheritedFieldSelector ?? ValueSelector;
  const { rule, schema, path } = props;
  const lhs = rule.lhs;

  const fields = useMemo(() => toFieldOptions(schema.fields), [schema.fields]);

  // Resolve the sentinel field's input type (same precedence as the core Rule component) so
  // literals inside the LHS expression are parsed like a normal value for that field.
  const inputType = useMemo(() => {
    const fieldData: FullField = schema.fieldMap[rule.field] ?? {
      name: rule.field,
      value: rule.field,
      label: rule.field,
    };
    return fieldData.inputType ?? schema.getInputType(rule.field, rule.operator, { fieldData });
  }, [schema, rule.field, rule.operator]);

  const writeLhs = useCallback(
    (value: ExpressionNode | undefined) =>
      schema.dispatchQuery(update(schema.getQuery(), 'lhs', value, path)),
    [schema, path]
  );

  const toggleLhs = useCallback(
    () => writeLhs(lhs ? undefined : defaultNode('field', fields, registry)),
    [writeLhs, lhs, fields, registry]
  );

  return (
    <span className="expr-lhs">
      <FieldSelector {...props} />
      <button
        type="button"
        className="expr-toggle"
        data-testid="expr-lhs-toggle"
        aria-label="Toggle left-hand side expression"
        aria-pressed={!!lhs}
        onClick={toggleLhs}>
        ƒ(x)
      </button>
      {lhs && (
        <ExpressionEditor
          node={lhs}
          onChange={writeLhs}
          registry={registry}
          fields={fields}
          schema={schema}
          inputType={inputType}
          testID="expr-lhs"
        />
      )}
    </span>
  );
};
