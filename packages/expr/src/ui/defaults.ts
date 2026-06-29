import type { BaseTranslationWithLabel } from '@react-querybuilder/core';
import * as React from 'react';

/**
 * The shape of the `translations` prop for {@link QueryBuilderExpressions}.
 *
 * @group Props
 */
export interface TranslationsExpr {
  /** LHS toggle while the left-hand side is a plain field (click → expression). */
  exprToggleLHS: BaseTranslationWithLabel<React.ReactNode>;
  /** LHS toggle while the left-hand side is an expression (click → plain field). */
  exprToggleLHSActive: BaseTranslationWithLabel<React.ReactNode>;
  /** RHS toggle while the value is a literal/field (click → expression). */
  exprToggleRHS: BaseTranslationWithLabel<React.ReactNode>;
  /** RHS toggle while the value is an expression (click → literal/field). */
  exprToggleRHSActive: BaseTranslationWithLabel<React.ReactNode>;
}
/**
 * The full `translations` interface for {@link QueryBuilderExpressions}, with all properties required.
 *
 * @group Props
 */
export type TranslationsFullExpr = {
  [K in keyof TranslationsExpr]: { [T in keyof TranslationsExpr[K]]-?: TranslationsExpr[K][T] };
};

/**
 * Default {@link TranslationsExpr} for {@link QueryBuilderExpressions} — the LHS/RHS
 * expression-toggle labels and titles. Override per-key via the `translations` prop.
 *
 * Note: labels use Mathematical Alphanumeric Symbols (Unicode SMP) — needs a
 * math-capable font; override if target environments may lack coverage.
 */
export const defaultTranslationsExpr: TranslationsFullExpr = {
  exprToggleLHS: {
    label: '𝑥', // Plain field/operand; toggles ON to an expression
    title: 'Use a left-hand side expression',
  },
  exprToggleLHSActive: {
    label: '𝑓(𝑥)', // Left-hand side is an expression; toggles OFF to a plain field
    title: 'Use a left-hand side field',
  },
  exprToggleRHS: {
    label: '𝑥', // Plain value; toggles ON to an expression
    title: 'Use a right-hand side expression',
  },
  exprToggleRHSActive: {
    label: '𝑓(𝑥)', // Right-hand side is an expression; toggles OFF to a value
    title: 'Use a right-hand side value',
  },
};

/**
 * Stable `data-testid` values for the expression UI's toggles and nested editors.
 * Exposed so host tests can target the expression controls without hardcoding strings.
 */
export const ExprTestID = {
  exprLhsEditor: 'expr-lhs-editor',
  exprLhsToggle: 'expr-lhs-toggle',
  exprRhsEditor: 'expr-rhs-editor',
  exprRhsToggle: 'expr-rhs-toggle',
} as const;
