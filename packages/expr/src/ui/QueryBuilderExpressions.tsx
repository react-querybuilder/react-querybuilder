import { mergeAnyTranslations } from '@react-querybuilder/core';
import * as React from 'react';
import { useContext, useMemo } from 'react';
import type { QueryBuilderContextProvider } from 'react-querybuilder';
import { getCompatContextProvider, QueryBuilderContext } from 'react-querybuilder';
import { mergeFunctions } from '../registry';
import type { ExpressionFunctionRegistry } from '../types';
import type { TranslationsExpr, TranslationsFullExpr } from './defaults';
import { defaultTranslationsExpr } from './defaults';
import { ExpressionFieldSelector } from './ExpressionFieldSelector';
import { ExpressionUIContext } from './ExpressionUIContext';
import { ExpressionValueEditor } from './ExpressionValueEditor';

const emptyObject = {};

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
  /** Per-key overrides for the expression-toggle labels/titles ({@link defaultTranslationsExpr}). */
  translations?: Partial<TranslationsExpr>;
  /**
   * Whether to show the expression toggle for the field selector.
   *
   * @default false
   */
  showFieldExpressionToggle?: boolean;
  /**
   * Whether to show the expression toggle for the value editor.
   *
   * @default true
   */
  showValueExpressionToggle?: boolean;
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
  translations: translationsProp = emptyObject,
  showFieldExpressionToggle = false,
  showValueExpressionToggle = true,
  children,
}: QueryBuilderExpressionsProps): React.JSX.Element => {
  const inherited = useContext(QueryBuilderContext).controlElements;
  const registry = useMemo(() => mergeFunctions(functions), [functions]);

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
      registry,
      translations,
      showFieldExpressionToggle,
      showValueExpressionToggle,
      inheritedActionElement: inherited?.actionElement ?? null,
      inheritedFieldSelector: inherited?.fieldSelector ?? null,
      inheritedValueEditor: inherited?.valueEditor ?? null,
    }),
    [registry, translations, inherited, showFieldExpressionToggle, showValueExpressionToggle]
  );

  return (
    <ExpressionUIContext.Provider value={value}>
      <QueryBuilderExpressionsContext>{children}</QueryBuilderExpressionsContext>
    </ExpressionUIContext.Provider>
  );
};
