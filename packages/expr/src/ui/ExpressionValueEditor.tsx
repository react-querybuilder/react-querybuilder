import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { ValueEditor } from 'react-querybuilder';
import { ExprTestID } from './defaults';
import { ExpressionEditor } from './ExpressionEditor';
import { useExpressionUI } from './ExpressionUIContext';

/**
 * Value-editor override hosting the rule's right-hand side. When `valueSource` is
 * `expression`, the rule's `value` holds an {@link ExpressionNode} (rooted at a function
 * call) edited by {@link ExpressionEditor}. Every other value source renders the inherited
 * (or default) value editor unchanged. The `expression` source is offered by
 * {@link ExpressionValueSourceSelector}, which seeds the initial node.
 */
export const ExpressionValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const { registry, inheritedValueEditor } = useExpressionUI();
  const ValEditor = inheritedValueEditor ?? ValueEditor;
  const { schema, value, valueSource, inputType, handleOnChange } = props;

  return valueSource === 'expression' ? (
    <ExpressionEditor
      node={value}
      onChange={handleOnChange}
      registry={registry}
      schema={schema}
      inputType={inputType}
      hideKindSelector
      testID={ExprTestID.exprRhsEditor}
    />
  ) : (
    <ValEditor {...props} />
  );
};
