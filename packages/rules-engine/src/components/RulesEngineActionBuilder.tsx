import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { toOptions } from 'react-querybuilder';
import { standardClassnamesRE } from '../defaults';
import type { RulesEngineActionProps } from '../types';

/**
 * Default header component for {@link RulesEngineActionBuilder}.
 */
export const RulesEngineActionBuilderHeader = (
  props: RulesEngineActionProps
): React.JSX.Element => {
  const {
    onActionChange,
    schema: {
      classnames: { actionBuilderHeader },
    },
  } = props;

  const className = React.useMemo(
    () => clsx({ [standardClassnamesRE.actionBuilderHeader]: true }, actionBuilderHeader),
    [actionBuilderHeader]
  );

  const removeAction = React.useCallback(() => onActionChange(), [onActionChange]);

  return (
    <div className={className}>
      <div>{props.standalone ? 'Else' : 'Then'}</div>
      <button type="button" onClick={removeAction}>
        ⨯
      </button>
    </div>
  );
};

/**
 * Default body component for {@link RulesEngineActionBuilder}.
 */
export const RulesEngineActionBuilderBody = (props: RulesEngineActionProps): React.JSX.Element => {
  const className = React.useMemo(
    () =>
      clsx(
        { [standardClassnamesRE.actionBuilderBody]: true },
        props.schema.classnames.actionBuilderBody
      ),
    [props.schema.classnames.actionBuilderBody]
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
      <RulesEngineActionBuilderBody {...props} />
    </div>
  );
};
