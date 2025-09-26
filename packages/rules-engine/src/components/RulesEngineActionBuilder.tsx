import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { toOptions } from 'react-querybuilder';
import { standardClassnamesRE } from '../defaults';
import type { RulesEngineActionProps } from '../types';

export const RulesEngineActionBuilderHeader = (
  props: RulesEngineActionProps
): React.JSX.Element => {
  const className = React.useMemo(
    () =>
      clsx(
        { [standardClassnamesRE.actionBuilderHeader]: true },
        props.schema.classnames.actionBuilderHeader
      ),
    [props.schema.classnames.actionBuilderHeader]
  );
  return (
    <div className={className}>
      <div>{props.standalone ? 'Else' : 'Then'}</div>
      <button type="button">⨯</button>
    </div>
  );
};

/**
 * Analogous to the body of an "if" or "else-if" block.
 */
export const RulesEngineActionBuilder = (props: RulesEngineActionProps): React.JSX.Element => {
  const className = React.useMemo(
    () =>
      clsx(
        {
          [standardClassnamesRE.actionBuilder]: true,
          [standardClassnamesRE.actionBuilderStandalone]: props.standalone,
        },
        props.schema.classnames.actionBuilder
      ),
    [props.schema.classnames.actionBuilder, props.standalone]
  );

  return (
    <div className={className}>
      <RulesEngineActionBuilderHeader {...props} />
      <div className={standardClassnamesRE.actionBuilderBody}>
        {props.actionTypes && (
          <select
            value={props.action.actionType}
            // oxlint-disable-next-line jsx-no-new-function-as-prop
            onChange={e => props.onActionChange({ ...props.action, actionType: e.target.value })}>
            {toOptions(props.actionTypes)}
          </select>
        )}
      </div>
    </div>
  );
};
