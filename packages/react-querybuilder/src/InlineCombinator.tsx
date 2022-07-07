import { standardClassnames, TestID } from './defaults';
import type { CombinatorSelectorProps, Schema } from './types';

interface InlineCombinatorProps extends CombinatorSelectorProps {
  component: Schema['controls']['combinatorSelector'];
  path: number[];
}

export const InlineCombinator = ({
  component: CombinatorSelectorComponent,
  path,
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
