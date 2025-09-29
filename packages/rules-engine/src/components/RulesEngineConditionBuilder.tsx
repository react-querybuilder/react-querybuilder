import { pathsAreEqual } from '@react-querybuilder/core';
import * as React from 'react';
import type { RuleGroupTypeAny } from 'react-querybuilder';
import { standardClassnamesRE } from '../defaults';
import type {
  RulesEngineAction,
  RulesEngineCondition,
  RulesEngineConditionProps,
  RulesEngineConditions,
} from '../types';

/**
 * Default header component for {@link RulesEngineConditionBuilder}.
 */
export const RulesEngineConditionBuilderHeader = <RG extends RuleGroupTypeAny>(
  props: RulesEngineConditionProps<RG>
): React.JSX.Element => (
  <div className={standardClassnamesRE.conditionBuilderHeader}>
    <div>{props.conditionPath.at(-1) === 0 ? 'If' : 'Else If'}</div>
    {!pathsAreEqual([0], props.conditionPath) && <button type="button">⨯</button>}
  </div>
);

/**
 * Default body component for {@link RulesEngineConditionBuilder}.
 */
export const RulesEngineConditionBuilderBody = <RG extends RuleGroupTypeAny>(
  props: RulesEngineConditionProps<RG>
): React.JSX.Element => {
  const {
    condition,
    onConditionChange,
    schema: {
      components: {
        actionBuilder: ActionBuilder,
        conditionBuilderCascade: ConditionCascade,
        queryBuilder: QueryBuilder,
      },
    },
  } = props;
  const actionUpdater = React.useCallback(
    (action: RulesEngineAction) => onConditionChange({ ...condition, action }),
    [condition, onConditionChange]
  );
  const conditionUpdater = React.useCallback(
    (re: RulesEngineCondition<RG>) => onConditionChange(re),
    [onConditionChange]
  );
  const conditionsUpdater = React.useCallback(
    (conditions: RulesEngineConditions<RG>) => onConditionChange({ ...condition, conditions }),
    [condition, onConditionChange]
  );

  return (
    <React.Fragment>
      <QueryBuilder
        enableMountQueryChange={false}
        fields={props.schema.fields}
        query={props.condition}
        // @ts-expect-error TODO
        onQueryChange={conditionUpdater}
      />
      {(props.condition.action || props.condition.conditions) && (
        <React.Fragment>
          {props.condition.action && (
            <ActionBuilder
              conditionPath={props.conditionPath}
              actionTypes={props.actionTypes}
              action={props.condition.action}
              onActionChange={actionUpdater}
              autoSelectActionType={props.autoSelectActionType}
              schema={props.schema}
            />
          )}
          {Array.isArray(props.condition.conditions) && props.condition.conditions.length > 0 && (
            <ConditionCascade
              conditionPath={props.conditionPath}
              onChange={conditionsUpdater}
              conditions={props.condition.conditions}
              schema={props.schema}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

/**
 * Analogous to an "if" or "else-if" block.
 */
export const RulesEngineConditionBuilder = <RG extends RuleGroupTypeAny>(
  props: RulesEngineConditionProps<RG>
): React.JSX.Element => {
  const {
    schema: {
      components: {
        conditionBuilderHeader: ConditionBuilderHeader,
        conditionBuilderBody: ConditionBuilderBody,
      },
    },
  } = props;

  return (
    <div className={standardClassnamesRE.conditionBuilder}>
      <ConditionBuilderHeader {...props} />
      <ConditionBuilderBody {...props} />
    </div>
  );
};
