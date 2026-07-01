import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { FullOption, ValueSource, ValueSourceSelectorProps } from 'react-querybuilder';
import { update } from 'react-querybuilder';
import { rhsDefaultNode } from './expressionEditorUtils';
import { useExpressionUI } from './ExpressionUIContext';

/**
 * Value-source selector override. Relabels the `expression` option (core emits a raw,
 * lowercase label) and, when it is selected, atomically seeds `value` with a default
 * function node so the {@link ExpressionValueEditor} has an expression to render. Every
 * other value source delegates to the inherited (or default) selector unchanged.
 */
export const ExpressionValueSourceSelector = (
  props: ValueSourceSelectorProps
): React.JSX.Element => {
  const { meta, translations, inheritedValueSourceSelector } = useExpressionUI();
  const { schema, path, options, handleOnChange } = props;
  const Selector = inheritedValueSourceSelector ?? schema.controls.valueSelector;

  // Value sources are always a flat option list; relabel just the `expression` entry
  // (fresh object, never mutating the incoming options).
  const relabeled = useMemo(
    () =>
      (options as FullOption<ValueSource>[]).map(o =>
        o.value === 'expression'
          ? Object.assign({}, o, { label: translations.valueSourceExpression.label })
          : o
      ),
    [options, translations]
  );

  const onChange = useCallback(
    (v: string) => {
      if (v === 'expression') {
        schema.dispatchQuery(
          update(
            schema.getQuery(),
            { valueSource: 'expression', value: rhsDefaultNode(schema.fields, meta) },
            path
          )
        );
      } else {
        handleOnChange(v);
      }
    },
    [schema, path, meta, handleOnChange]
  );

  return <Selector {...props} options={relabeled} handleOnChange={onChange} />;
};
