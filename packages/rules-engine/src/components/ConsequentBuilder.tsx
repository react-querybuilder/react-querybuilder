import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { ConsequentProps } from '../types';

/**
 * Default consequent editor for {@link RulesEngineBuilder}.
 * Analogous to the body of an "if" or "else-if" block.
 *
 * @group Components
 */
export const ConsequentBuilder: React.MemoExoticComponent<
  (props: ConsequentProps) => React.JSX.Element
> = React.memo(function ConsequentBuilder(props: ConsequentProps): React.JSX.Element {
  const {
    standalone,
    schema: {
      classnames: { consequentBuilder },
      suppressStandardClassnames,
      components: {
        consequentBuilderHeader: ConsequentBuilderHeader,
        consequentBuilderBody: ConsequentBuilderBody,
      },
    },
  } = props;
  const className = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.consequentBuilder,
        suppressStandardClassnames ||
          (standalone && standardClassnamesRE.consequentBuilderStandalone),
        consequentBuilder
      ),
    [consequentBuilder, standalone, suppressStandardClassnames]
  );

  return (
    <div className={className}>
      <ConsequentBuilderHeader {...props} />
      <ConsequentBuilderBody {...props} />
    </div>
  );
});
