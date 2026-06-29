import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { ActionElement, update, ValueEditor } from 'react-querybuilder';
import { ExprTestID } from './defaults';
import { ExpressionEditor } from './ExpressionEditor';
import { rhsDefaultNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';

/**
 * Value-editor override hosting the rule's right-hand side. A toggle flips the rule's
 * `valueSource` between its normal scalar/field editor and an {@link ExpressionEditor}
 * (`valueSource: 'expression'`, with the node stored in `value`). The inherited (or
 * default) value editor renders for the non-expression case.
 */
export const ExpressionValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const {
    registry,
    translations,
    showValueExpressionToggle,
    inheritedActionElement,
    inheritedValueEditor,
  } = useExpressionUI();
  const ActionButton = inheritedActionElement ?? ActionElement;
  const ValEditor = inheritedValueEditor ?? ValueEditor;
  const { schema, path, value, valueSource, inputType, handleOnChange, level, rule } = props;
  const isExpression = valueSource === 'expression';
  const toggle = isExpression ? translations.exprToggleRHSActive : translations.exprToggleRHS;

  const enable = () => {
    const node = rhsDefaultNode(schema, rule);
    schema.dispatchQuery(
      update(update(schema.getQuery(), 'valueSource', 'expression', path), 'value', node, path)
    );
  };

  const disable = () =>
    schema.dispatchQuery(update(schema.getQuery(), 'valueSource', 'value', path));

  return !showValueExpressionToggle ? (
    <ValEditor {...props} />
  ) : (
    <span className="expr-rhs">
      <ActionButton
        testID={ExprTestID.exprRhsToggle}
        className="expr-toggle"
        label={toggle.label}
        title={toggle.title}
        path={path}
        level={level}
        schema={schema}
        ruleOrGroup={rule}
        handleOnClick={isExpression ? disable : enable}
      />
      {isExpression ? (
        <ExpressionEditor
          node={value}
          onChange={handleOnChange}
          registry={registry}
          schema={schema}
          inputType={inputType}
          testID={ExprTestID.exprRhsEditor}
        />
      ) : (
        <ValEditor {...props} />
      )}
    </span>
  );
};
