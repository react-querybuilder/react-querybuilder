import * as React from 'react';
import { standardClassnames, TestID } from '../defaults';
import type { InlineCombinatorProps } from '../types';
import { clsx } from '../utils/clsx';

/**
 * Default `inlineCombinator` component used by {@link QueryBuilder}. A small `<div>`
 * wrapper around the `combinatorSelector` component, used when either
 * `showCombinatorsBetweenRules` or `independentCombinators` are `true`.
 *
 * @group Components
 */
export const InlineCombinator = (allProps: InlineCombinatorProps): React.JSX.Element => {
  const { component: CombinatorSelectorComponent, ...props } = allProps;

  const className = clsx(
    props.schema.suppressStandardClassnames || standardClassnames.betweenRules,
    props.schema.classNames.betweenRules
  );

  return (
    <div className={className} data-testid={TestID.inlineCombinator}>
      <CombinatorSelectorComponent {...props} testID={TestID.combinators} />
    </div>
  );
};
