import type { BaseTranslation, BaseTranslationWithLabel } from '@react-querybuilder/core';

/**
 * The shape of the `translations` prop for {@link QueryBuilderExpressions}.
 *
 * @group Props
 */
export interface TranslationsExpr {
  /** Accessible title for the left-hand side function-wrapper selector. */
  exprLhsFunction: BaseTranslation;
  /** Label for the wrapper selector's "no function" option (field used as-is). */
  exprLhsNone: BaseTranslationWithLabel;
  /** Label for the `expression` option in the value-source selector. */
  valueSourceExpression: BaseTranslationWithLabel;
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
 * Default {@link TranslationsExpr} for {@link QueryBuilderExpressions} — the LHS
 * function-wrapper selector title/option and the `expression` value-source label.
 * Override per-key via the `translations` prop.
 */
export const defaultTranslationsExpr: TranslationsFullExpr = {
  exprLhsFunction: {
    title: 'Wrap the field in a function',
  },
  exprLhsNone: {
    label: '—',
    title: 'No function (use the field directly)',
  },
  valueSourceExpression: {
    label: 'expression',
    title: 'Compare against an expression',
  },
};

/**
 * Stable `data-testid` values for the expression UI's selectors and nested editor.
 * Exposed so host tests can target the expression controls without hardcoding strings.
 */
export const ExprTestID = {
  exprLhsFnSelector: 'expr-lhs-fn-selector',
  exprLhsArgEditor: 'expr-lhs-arg-editor',
  exprRhsEditor: 'expr-rhs-editor',
} as const;
