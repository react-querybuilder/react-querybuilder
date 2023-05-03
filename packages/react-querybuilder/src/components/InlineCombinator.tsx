import * as React from 'react';
import { standardClassnames, TestID } from '../defaults';
import type { InlineCombinatorProps } from '../types';

export const InlineCombinator = ({
  component: CombinatorSelectorComponent,
  independentCombinators: _independentCombinators,
  ...props
}: InlineCombinatorProps) => (
  <div className={standardClassnames.betweenRules} data-testid={TestID.inlineCombinator}>
    <CombinatorSelectorComponent {...props} testID={TestID.combinators} />
  </div>
);

InlineCombinator.displayName = 'InlineCombinator';
