import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { toOptions } from 'react-querybuilder';
import { standardClassnamesRE } from '../defaults';
import type { RulesEngineActionProps } from '../types';

/**
 * Default body component for {@link RulesEngineActionBuilder}.
 */
export const RulesEngineActionBuilderBody = (props: RulesEngineActionProps): React.JSX.Element => {
  const {
    schema: {
      classnames: { actionBuilderBody },
      suppressStandardClassnames,
    },
  } = props;
  const className = React.useMemo(
    () =>
      clsx(suppressStandardClassnames || standardClassnamesRE.actionBuilderBody, actionBuilderBody),
    [actionBuilderBody, suppressStandardClassnames]
  );
  return (
    <div className={className}>
      {props.actionTypes && (
        <select
          value={props.action.actionType}
          // oxlint-disable-next-line jsx-no-new-function-as-prop
          onChange={e => props.onActionChange({ ...props.action, actionType: e.target.value })}>
          {toOptions(props.actionTypes)}
        </select>
      )}
    </div>
  );
};
