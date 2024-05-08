import * as React from 'react';
import { standardClassnames, TestID } from '../defaults';
import type { InlineCombinatorProps } from '../types';

/**
 * Default `inlineCombinator` component used by {@link QueryBuilder}. A small `<div>`
 * wrapper around the `combinatorSelector` component, used when either
 * `showCombinatorsBetweenRules` or `independentCombinators` are `true`.
 */
export const InlineCombinator = ({
  component: CombinatorSelectorComponent,
  independentCombinators: _independentCombinators,
  ...props
}: InlineCombinatorProps) => (
  <div className={standardClassnames.betweenRules} data-testid={TestID.inlineCombinator}>
    <CombinatorSelectorComponent {...props} testID={TestID.combinators} />
  </div>
);
