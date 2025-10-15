import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { produce } from 'immer';
import * as React from 'react';
import { usePathsMemo } from 'react-querybuilder';
import type { RulesEngineConditionAny, RulesEngineConditionCascadeProps } from '../types';

/**
 * Renders a sequential list of if/else-if/else blocks in a rules engine.
 */
export const RulesEngineConditionCascade = <RG extends RuleGroupTypeAny>(
  props: RulesEngineConditionCascadeProps<RG>
): React.JSX.Element => {
  const {
    conditionPath,
    conditions,
    defaultAction,
    onConditionsChange,
    onDefaultActionChange,
    schema,
  } = props;
  const {
    actionTypes,
    autoSelectActionType,
    components: { conditionBuilder: ConditionBuilder, actionBuilder: ActionBuilder },
  } = schema;

  const conditionUpdater = React.useCallback(
    (c: RulesEngineConditionAny, index: number) =>
      onConditionsChange(
        produce(conditions, draft => {
          // oxlint-disable-next-line no-explicit-any
          draft.splice(index, 1, c as any);
        })
      ),
    [onConditionsChange, conditions]
  );

  const pathsMemo = usePathsMemo({
    disabled: false,
    disabledPaths: [],
    nestedArray: conditions,
    path: conditionPath,
  });

  return (
    <React.Fragment>
      {conditions.map((c, i) => {
        const thisPathMemo = pathsMemo[i];
        const thisPath = thisPathMemo.path;
        // TODO: implement `disabled`/`disabledPaths`/etc.
        // const thisPathDisabled = thisPathMemo.disabled || (typeof c !== 'string' && c.disabled);

        return (
          <ConditionBuilder
            key={c.id}
            conditionPath={thisPath}
            schema={schema}
            actionTypes={actionTypes}
            condition={c}
            isOnlyCondition={conditions.length === 1}
            // oxlint-disable-next-line jsx-no-new-function-as-prop
            onConditionChange={c => conditionUpdater(c, i)}
            autoSelectActionType={autoSelectActionType}
          />
        );
      })}
      {defaultAction && (
        <ActionBuilder
          key={'defaultAction'}
          conditionPath={conditionPath}
          schema={schema}
          actionTypes={actionTypes}
          action={defaultAction}
          standalone
          onActionChange={onDefaultActionChange}
          autoSelectActionType={autoSelectActionType}
        />
      )}
    </React.Fragment>
  );
};
