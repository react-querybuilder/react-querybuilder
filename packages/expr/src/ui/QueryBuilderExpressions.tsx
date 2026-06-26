import * as React from 'react';
import { useContext, useMemo } from 'react';
import type {
  FieldSelectorProps,
  QueryBuilderContextProvider,
  ValueEditorProps,
} from 'react-querybuilder';
import { getCompatContextProvider, QueryBuilderContext } from 'react-querybuilder';
import { mergeFunctions } from '../registry';
import type { ExpressionFunctionRegistry } from '../types';
import { ExpressionFieldSelector } from './ExpressionFieldSelector';
import { ExpressionUIContext } from './ExpressionUIContext';
import { ExpressionValueEditor } from './ExpressionValueEditor';

const QueryBuilderExpressionsContext: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: {
    fieldSelector: ExpressionFieldSelector,
    valueEditor: ExpressionValueEditor,
  },
});

/** Props for {@link QueryBuilderExpressions}. */
export interface QueryBuilderExpressionsProps {
  /** Custom functions merged over the built-in {@link defaultFunctions}. */
  functions?: ExpressionFunctionRegistry;
  children?: React.ReactNode;
}

/**
 * Context provider enabling arithmetic/function expression support for a wrapped
 * {@link react-querybuilder!QueryBuilder QueryBuilder}: overrides the field selector and
 * value editor to host left- and right-hand side expressions, and supplies the function
 * registry. Any value editor / field selector inherited from an outer compat provider is
 * captured first so non-expression rules continue to render with it.
 *
 * @group Components
 */
export const QueryBuilderExpressions = ({
  functions,
  children,
}: QueryBuilderExpressionsProps): React.JSX.Element => {
  const registry = useMemo(() => mergeFunctions(functions), [functions]);

  // Capture inherited controls _before_ QueryBuilderExpressionsContext overrides them.
  const inherited = useContext(QueryBuilderContext).controlElements;
  const inheritedFieldSelector = (inherited?.fieldSelector ??
    null) as React.ComponentType<FieldSelectorProps> | null;
  const inheritedValueEditor = (inherited?.valueEditor ??
    null) as React.ComponentType<ValueEditorProps> | null;

  const value = useMemo(
    () => ({ registry, inheritedFieldSelector, inheritedValueEditor }),
    [registry, inheritedFieldSelector, inheritedValueEditor]
  );

  return (
    <ExpressionUIContext.Provider value={value}>
      <QueryBuilderExpressionsContext>{children}</QueryBuilderExpressionsContext>
    </ExpressionUIContext.Provider>
  );
};
