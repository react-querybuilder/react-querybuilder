import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { RulesEngineActionProps } from '../types';

/**
 * Analogous to the body of an "if" or "else-if" block.
 */
export const RulesEngineActionBuilder = (props: RulesEngineActionProps): React.JSX.Element => {
  const {
    standalone,
    schema: {
      classnames: { actionBuilder },
      suppressStandardClassnames,
      components: {
        actionBuilderHeader: ActionBuilderHeader,
        actionBuilderBody: ActionBuilderBody,
      },
    },
  } = props;
  const className = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.actionBuilder,
        suppressStandardClassnames || (standalone && standardClassnamesRE.actionBuilderStandalone),
        actionBuilder
      ),
    [actionBuilder, standalone, suppressStandardClassnames]
  );

  return (
    <div className={className}>
      <ActionBuilderHeader {...props} />
      <ActionBuilderBody {...props} />
    </div>
  );
};
