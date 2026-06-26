import type { Context } from 'react';
import { createContext, useContext } from 'react';
import type { FieldSelectorProps, ValueEditorProps } from 'react-querybuilder';
import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry } from '../types';

/** Value carried by {@link ExpressionUIContext}. */
export interface ExpressionUIContextValue {
  /** Function registry available to the expression editors. */
  registry: ExpressionFunctionRegistry;
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
    inheritedFieldSelector: null,
    inheritedValueEditor: null,
  });

/** Reads the {@link ExpressionUIContext}. */
export const useExpressionUI = (): ExpressionUIContextValue => useContext(ExpressionUIContext);
