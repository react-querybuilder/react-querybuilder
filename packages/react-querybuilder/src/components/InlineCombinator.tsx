import type { InlineCombinatorProps } from '@react-querybuilder/ts';
import { standardClassnames, TestID } from '../defaults';

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
