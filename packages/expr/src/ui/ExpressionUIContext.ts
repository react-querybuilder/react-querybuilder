import type { Context } from 'react';
import { createContext, useContext } from 'react';
import type {
  FieldSelectorProps,
  ValueEditorProps,
  ValueSourceSelectorProps,
} from 'react-querybuilder';
import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry } from '../types';
import { defaultTranslationsExpr } from './defaults';
import type { TranslationsFullExpr } from './defaults';

/**
 * Whether (and when) the left-hand side may wrap its field in a unary function. `boolean`
 * applies globally; a predicate decides per field/operator.
 */
export type AllowFunctionsOnLHS = boolean | ((field: string, operator: string) => boolean);

/** Value carried by {@link ExpressionUIContext}. */
export interface ExpressionUIContextValue {
  /** Function registry available to the expression editors. */
  registry: ExpressionFunctionRegistry;
  /** Titles and labels for expression UI elements. */
  translations: TranslationsFullExpr;
  /**
   * Whether the left-hand side may wrap its field in a unary function. `false` (default)
   * hides the wrapper selector entirely; a predicate gates it per field/operator.
   */
  allowFunctionsOnLHS: AllowFunctionsOnLHS;
  /**
   * Field selector inherited from an outer (compat) provider, captured _before_
   * {@link QueryBuilderExpressions} overrides it. `null` = none (use the default).
   */
  inheritedFieldSelector: React.ComponentType<FieldSelectorProps> | null;
  /**
   * Value editor inherited from an outer (compat) provider, captured _before_
   * {@link QueryBuilderExpressions} overrides it. `null` = none (use the default).
   */
  inheritedValueEditor: React.ComponentType<ValueEditorProps> | null;
  /**
   * Value-source selector inherited from an outer (compat) provider, captured _before_
   * {@link QueryBuilderExpressions} overrides it. `null` = none (use the default).
   */
  inheritedValueSourceSelector: React.ComponentType<ValueSourceSelectorProps> | null;
}

/** Carries the registry + inherited controls down to the expression control elements. */
export const ExpressionUIContext: Context<ExpressionUIContextValue> =
  createContext<ExpressionUIContextValue>({
    registry: defaultFunctions,
    translations: defaultTranslationsExpr,
    allowFunctionsOnLHS: false,
    inheritedFieldSelector: null,
    inheritedValueEditor: null,
    inheritedValueSourceSelector: null,
  });

/** Reads the {@link ExpressionUIContext}. */
export const useExpressionUI = (): ExpressionUIContextValue => useContext(ExpressionUIContext);
