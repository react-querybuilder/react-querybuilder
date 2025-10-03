import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { RulesEngineActionProps } from '../types';

/**
 * Default body component for {@link RulesEngineActionBuilder}.
 */
export const RulesEngineActionBuilderBody = (props: RulesEngineActionProps): React.JSX.Element => {
  const {
    action,
    actionTypes = [],
    conditionPath,
    onActionChange,
    schema: {
      classnames: { actionBuilderBody },
      components: { actionSelector: ActionSelector },
      suppressStandardClassnames,
    },
  } = props;

  const className = React.useMemo(
    () =>
      clsx(suppressStandardClassnames || standardClassnamesRE.actionBuilderBody, actionBuilderBody),
    [actionBuilderBody, suppressStandardClassnames]
  );

  const handleOnChange = React.useCallback(
    (v: string) => onActionChange({ ...action, actionType: v }),
    [onActionChange, action]
  );

  return (
    <div className={className}>
      {props.actionTypes && (
        <ActionSelector
          schema={props.schema}
          path={conditionPath}
          level={conditionPath.length}
          value={action.actionType}
          handleOnChange={handleOnChange}
          options={actionTypes}
        />
      )}
    </div>
  );
};
