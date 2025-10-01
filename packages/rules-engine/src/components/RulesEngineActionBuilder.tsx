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
      classnames: { actionBuilderHeader, blockLabel },
      suppressStandardClassnames,
    },
  } = props;

  const wrapperClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.actionBuilderHeader,
        actionBuilderHeader
      ),
    [actionBuilderHeader, suppressStandardClassnames]
  );
  const labelClassName = React.useMemo(
    () => clsx(suppressStandardClassnames || standardClassnamesRE.blockLabel, blockLabel),
    [blockLabel, suppressStandardClassnames]
  );

  const removeAction = React.useCallback(() => onActionChange(), [onActionChange]);

  return (
    <div className={wrapperClassName}>
      <div className={labelClassName}>{props.standalone ? 'Else' : 'Then'}</div>
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

/**
 * Analogous to the body of an "if" or "else-if" block.
 */
export const RulesEngineActionBuilder = (props: RulesEngineActionProps): React.JSX.Element => {
  const {
    standalone,
    schema: {
      classnames: { actionBuilder },
      suppressStandardClassnames,
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
      <RulesEngineActionBuilderHeader {...props} />
      <RulesEngineActionBuilderBody {...props} />
    </div>
  );
};
