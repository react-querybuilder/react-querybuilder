import { mergeAnyTranslations } from '@react-querybuilder/core';
import * as React from 'react';
import { useContext, useMemo } from 'react';
import type { QueryBuilderContextProvider } from 'react-querybuilder';
import { getCompatContextProvider, QueryBuilderContext } from 'react-querybuilder';
import { mergeFunctionMeta } from '../registry';
import type { ExpressionFunctionMetaRegistry } from '../types';
import type { TranslationsExpr, TranslationsFullExpr } from './defaults';
import { defaultTranslationsExpr } from './defaults';
import { ExpressionFieldSelector } from './ExpressionFieldSelector';
import type { AllowFunctionsOnLHS } from './ExpressionUIContext';
import { ExpressionUIContext } from './ExpressionUIContext';
import { ExpressionValueEditor } from './ExpressionValueEditor';
import { ExpressionValueSourceSelector } from './ExpressionValueSourceSelector';

const emptyObject = {};

const QueryBuilderExpressionsContext: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: {
    fieldSelector: ExpressionFieldSelector,
    valueEditor: ExpressionValueEditor,
    valueSourceSelector: ExpressionValueSourceSelector,
  },
});

/** Props for {@link QueryBuilderExpressions}. */
export interface QueryBuilderExpressionsProps {
  /**
   * Custom function metadata (label/arity), merged over the built-in
   * {@link defaultFunctionMeta}, describing which functions appear in the expression UI.
   * Serialization is configured separately on the export rule processors.
   */
  functions?: ExpressionFunctionMetaRegistry;
  /** Per-key overrides for the expression UI labels/titles ({@link defaultTranslationsExpr}). */
  translations?: Partial<TranslationsExpr>;
  /**
   * Whether the left-hand side may wrap its field in a unary function. `false` (default)
   * hides the wrapper selector entirely; `true` always offers it; a predicate gates it
   * per field/operator.
   *
   * @default false
   */
  allowFunctionsOnLHS?: AllowFunctionsOnLHS;
  children?: React.ReactNode;
}

/**
 * Context provider enabling arithmetic/function expression support for a wrapped
 * {@link react-querybuilder!QueryBuilder QueryBuilder}: overrides the field selector,
 * value-source selector, and value editor to host left- and right-hand side expressions,
 * and supplies the function registry. Any control inherited from an outer compat provider
 * is captured first so non-expression rules continue to render with it.
 *
 * @group Components
 */
export const QueryBuilderExpressions = ({
  functions,
  translations: translationsProp = emptyObject,
  allowFunctionsOnLHS = false,
  children,
}: QueryBuilderExpressionsProps): React.JSX.Element => {
  const inherited = useContext(QueryBuilderContext).controlElements;
  const meta = useMemo(() => mergeFunctionMeta(functions), [functions]);

  const translations = useMemo(
    () =>
      mergeAnyTranslations(
        defaultTranslationsExpr,
        translationsProp as Partial<TranslationsFullExpr>
      ) as TranslationsFullExpr,
    [translationsProp]
  );

  const value = useMemo(
    () => ({
      meta,
      translations,
      allowFunctionsOnLHS,
      inheritedFieldSelector: inherited?.fieldSelector ?? null,
      inheritedValueEditor: inherited?.valueEditor ?? null,
      inheritedValueSourceSelector: inherited?.valueSourceSelector ?? null,
    }),
    [meta, translations, allowFunctionsOnLHS, inherited]
  );

  return (
    <ExpressionUIContext.Provider value={value}>
      <QueryBuilderExpressionsContext>{children}</QueryBuilderExpressionsContext>
    </ExpressionUIContext.Provider>
  );
};
