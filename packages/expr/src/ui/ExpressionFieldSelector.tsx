import { toFullOption } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { FieldSelectorProps, FullField } from 'react-querybuilder';
import { ActionElement, update, ValueSelector } from 'react-querybuilder';
import type { ExpressionNode } from '../types';
import { ExprTestID } from './defaults';
import { ExpressionEditor } from './ExpressionEditor';
import { defaultNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';

/**
 * Field-selector override hosting the rule's left-hand side. The inherited (or default)
 * field selector still picks the rule's `field` — which drives operator selection and
 * validation (the "sentinel field") — while a toggle reveals an {@link ExpressionEditor}
 * bound to `rule.lhs`. When the toggle is off, `rule.lhs` is cleared and the rule behaves
 * normally.
 */
export const ExpressionFieldSelector = (props: FieldSelectorProps): React.JSX.Element => {
  const {
    registry,
    translations,
    showFieldExpressionToggle,
    inheritedActionElement,
    inheritedFieldSelector,
  } = useExpressionUI();
  const ActionButton = inheritedActionElement ?? ActionElement;
  const FieldSelector = inheritedFieldSelector ?? ValueSelector;
  const {
    rule: { field, lhs, operator },
    schema,
    path,
    level,
    rule,
  } = props;

  // Resolve the sentinel field's input type (same precedence as the core Rule component) so
  // literals inside the LHS expression are parsed like a normal value for that field.
  const inputType = useMemo(() => {
    const fieldData: FullField = schema.fieldMap[field] ?? toFullOption(field);
    return fieldData.inputType ?? schema.getInputType(field, operator, { fieldData });
  }, [schema, field, operator]);

  const writeLhs = useCallback(
    (value: ExpressionNode | undefined) =>
      schema.dispatchQuery(update(schema.getQuery(), 'lhs', value, path)),
    [schema, path]
  );

  const toggleLhs = useCallback(
    () => writeLhs(lhs ? undefined : defaultNode('field', schema.fields, registry)),
    [writeLhs, lhs, registry, schema]
  );

  const toggle = lhs ? translations.exprToggleLHSActive : translations.exprToggleLHS;

  return !showFieldExpressionToggle ? (
    <FieldSelector {...props} />
  ) : (
    <span className="expr-lhs">
      <FieldSelector {...props} />
      <ActionButton
        path={path}
        level={level}
        schema={schema}
        testID={ExprTestID.exprLhsToggle}
        className="expr-toggle"
        label={toggle.label}
        title={toggle.title}
        ruleOrGroup={rule}
        handleOnClick={toggleLhs}
      />
      {lhs && (
        <ExpressionEditor
          node={lhs}
          onChange={writeLhs}
          registry={registry}
          schema={schema}
          inputType={inputType}
          testID={ExprTestID.exprLhsEditor}
        />
      )}
    </span>
  );
};
