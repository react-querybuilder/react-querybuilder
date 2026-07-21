import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { ValueEditor } from 'react-querybuilder';
import type { ExpressionNode } from '../types';
import { ExprTestID } from './defaults';
import { ExpressionEditor } from './ExpressionEditor';
import { rhsDefaultNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';

const BETWEEN_OPERATORS = new Set(['between', 'notBetween']);

/**
 * Value-editor override hosting the rule's right-hand side. When `valueSource` is
 * `expression`, the rule's `value` holds an {@link ExpressionNode} (rooted at a function
 * call) edited by {@link ExpressionEditor}. For `between`/`notBetween` the `value` is a
 * 2-tuple of nodes `[lower, upper]`, rendered as two editors flanking the `separator`. Every
 * other value source renders the inherited (or default) value editor unchanged. The
 * `expression` source is offered by {@link ExpressionValueSourceSelector}, which seeds the
 * initial node(s).
 */
export const ExpressionValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const { meta, inheritedValueEditor } = useExpressionUI();
  const ValEditor = inheritedValueEditor ?? ValueEditor;
  const {
    schema,
    value,
    valueSource,
    operator,
    inputType,
    separator,
    className,
    title,
    handleOnChange,
  } = props;

  if (valueSource !== 'expression') {
    return <ValEditor {...props} />;
  }

  if (BETWEEN_OPERATORS.has(operator)) {
    // Between stores a 2-tuple of expression nodes; seed empty slots with a default node so
    // any single edit persists a complete pair (mirroring the core "between fix" that
    // back-fills the untouched bound).
    const bounds: ExpressionNode[] = Array.isArray(value) ? value : [value];
    const fromNode = bounds[0] ?? rhsDefaultNode(schema.fields, meta);
    const toNode = bounds[1] ?? rhsDefaultNode(schema.fields, meta);
    return (
      <span data-testid={ExprTestID.exprRhsEditor} className={className} title={title}>
        <ExpressionEditor
          node={fromNode}
          onChange={next => handleOnChange([next, toNode])}
          meta={meta}
          schema={schema}
          inputType={inputType}
          hideKindSelector
          testID={`${ExprTestID.exprRhsEditor}-from`}
        />
        {separator}
        <ExpressionEditor
          node={toNode}
          onChange={next => handleOnChange([fromNode, next])}
          meta={meta}
          schema={schema}
          inputType={inputType}
          hideKindSelector
          testID={`${ExprTestID.exprRhsEditor}-to`}
        />
      </span>
    );
  }

  // A stray array (e.g. after switching away from between) collapses to its lower bound.
  const node = Array.isArray(value) ? value[0] : value;
  return (
    <ExpressionEditor
      node={node}
      onChange={handleOnChange}
      meta={meta}
      schema={schema}
      inputType={inputType}
      hideKindSelector
      testID={ExprTestID.exprRhsEditor}
    />
  );
};
