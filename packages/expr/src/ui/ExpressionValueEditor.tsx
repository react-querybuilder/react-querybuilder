import * as React from 'react';
import { useMemo } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { update, ValueEditor } from 'react-querybuilder';
import { ExpressionEditor } from './ExpressionEditor';
import { defaultNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';
import { toFieldOptions } from './fieldOptions';

/**
 * Value-editor override hosting the rule's right-hand side. A toggle flips the rule's
 * `valueSource` between its normal scalar/field editor and an {@link ExpressionEditor}
 * (`valueSource: 'expression'`, with the node stored in `value`). The inherited (or
 * default) value editor renders for the non-expression case.
 */
export const ExpressionValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const { registry, inheritedValueEditor } = useExpressionUI();
  const InheritedEditor = inheritedValueEditor;
  const { schema, path, value, valueSource, inputType, handleOnChange } = props;
  const isExpression = valueSource === 'expression';

  const fields = useMemo(() => toFieldOptions(schema.fields), [schema.fields]);

  const enable = () => {
    const node = defaultNode('value', fields, registry);
    schema.dispatchQuery(
      update(update(schema.getQuery(), 'valueSource', 'expression', path), 'value', node, path)
    );
  };

  const disable = () =>
    schema.dispatchQuery(update(schema.getQuery(), 'valueSource', 'value', path));

  return (
    <span className="expr-rhs">
      <button
        type="button"
        className="expr-toggle"
        data-testid="expr-rhs-toggle"
        aria-label="Toggle right-hand side expression"
        aria-pressed={isExpression}
        onClick={isExpression ? disable : enable}>
        ƒ(x)
      </button>
      {isExpression ? (
        <ExpressionEditor
          node={value}
          onChange={handleOnChange}
          registry={registry}
          fields={fields}
          schema={schema}
          inputType={inputType}
          testID="expr-rhs"
        />
      ) : InheritedEditor ? (
        <InheritedEditor {...props} />
      ) : (
        <ValueEditor {...props} />
      )}
    </span>
  );
};
