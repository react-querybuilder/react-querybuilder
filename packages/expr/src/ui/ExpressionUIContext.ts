import type { Context } from 'react';
import { createContext, useContext } from 'react';
import type { ActionProps, FieldSelectorProps, ValueEditorProps } from 'react-querybuilder';
import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry } from '../types';
import { defaultTranslationsExpr } from './defaults';
import type { TranslationsFullExpr } from './defaults';

/** Value carried by {@link ExpressionUIContext}. */
export interface ExpressionUIContextValue {
  /** Function registry available to the expression editors. */
  registry: ExpressionFunctionRegistry;
  /** Titles and labels for expression UI elements. */
  translations: TranslationsFullExpr;
  /** Whether to display the expression toggle for field selectors. */
  showFieldExpressionToggle?: boolean;
  /** Whether to display the expression toggle for value editors. */
  showValueExpressionToggle?: boolean;
  /**
   * Action element inherited from an outer (compat) provider, captured _before_
   * {@link QueryBuilderExpressions} overrides it. `null` = none (use the default).
   */
  inheritedActionElement: React.ComponentType<ActionProps> | null;
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
}

/** Carries the registry + inherited controls down to the expression control elements. */
export const ExpressionUIContext: Context<ExpressionUIContextValue> =
  createContext<ExpressionUIContextValue>({
    registry: defaultFunctions,
    translations: defaultTranslationsExpr,
    inheritedActionElement: null,
    inheritedFieldSelector: null,
    inheritedValueEditor: null,
  });

/** Reads the {@link ExpressionUIContext}. */
export const useExpressionUI = (): ExpressionUIContextValue => useContext(ExpressionUIContext);
