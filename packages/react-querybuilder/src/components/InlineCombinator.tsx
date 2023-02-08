import type { InlineCombinatorProps } from '@react-querybuilder/ts';
import { standardClassnames, TestID } from '../defaults';

export const InlineCombinator = ({
  component: CombinatorSelectorComponent,
  path,
  independentCombinators: _independentCombinators,
  ...props
}: InlineCombinatorProps) => (
  <div
    key="no-dnd"
    className={standardClassnames.betweenRules}
    data-testid={TestID.inlineCombinator}>
    <CombinatorSelectorComponent {...props} path={path} testID={TestID.combinators} />
  </div>
);

InlineCombinator.displayName = 'InlineCombinator';
