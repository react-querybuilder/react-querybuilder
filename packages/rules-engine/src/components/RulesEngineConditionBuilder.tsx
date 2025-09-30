import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type {
  RulesEngineAction,
  RulesEngineConditionAny,
  RulesEngineConditionProps,
} from '../types';

/**
 * Default header component for {@link RulesEngineConditionBuilder}.
 */
export const RulesEngineConditionBuilderHeader = (
  props: RulesEngineConditionProps
): React.JSX.Element => (
  <div className={standardClassnamesRE.conditionBuilderHeader}>
    <div>{props.conditionPath.at(-1) === 0 ? 'If' : 'Else If'}</div>
    <button type="button">⨯</button>
  </div>
);

/**
 * Default body component for {@link RulesEngineConditionBuilder}.
 */
export const RulesEngineConditionBuilderBody = (
  props: RulesEngineConditionProps
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
  const defaultActionUpdater = React.useCallback(
    (defaultAction: RulesEngineAction) => onConditionChange({ ...condition, defaultAction }),
    [condition, onConditionChange]
  );
  const conditionUpdater = React.useCallback(
    (re: RulesEngineConditionAny) => onConditionChange(re),
    [onConditionChange]
  );
  const conditionsUpdater = React.useCallback(
    (conditions: RulesEngineConditionAny[]) =>
      onConditionChange({ ...condition, conditions } as RulesEngineConditionAny),
    [condition, onConditionChange]
  );

  return (
    <React.Fragment>
      <QueryBuilder
        enableMountQueryChange={false}
        fields={props.schema.fields}
        query={props.condition.condition}
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
              onConditionsChange={conditionsUpdater}
              onDefaultActionChange={defaultActionUpdater}
              conditions={props.condition.conditions}
              defaultAction={props.condition.defaultAction}
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
export const RulesEngineConditionBuilder = (
  props: RulesEngineConditionProps
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
