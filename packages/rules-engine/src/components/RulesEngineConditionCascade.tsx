import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { isRuleGroup } from '@react-querybuilder/core';
import { produce } from 'immer';
import * as React from 'react';
import { usePathsMemo } from 'react-querybuilder';
import type {
  RulesEngineAction,
  RulesEngineCondition,
  RulesEngineConditionCascadeProps,
} from '../types';
import { isRulesEngineAction } from '../utils';

/**
 * Renders a sequential list of if/else-if/else blocks in a rules engine.
 */
export const RulesEngineConditionCascade = <RG extends RuleGroupTypeAny>(
  props: RulesEngineConditionCascadeProps<RG>
): React.JSX.Element => {
  const { conditionPath, conditions, onChange, schema } = props;
  const {
    actionTypes,
    autoSelectActionType,
    components: { conditionBuilder: ConditionBuilder, actionBuilder: ActionBuilder },
  } = schema;

  const updater = React.useCallback(
    (c: RulesEngineCondition<RG> | RulesEngineAction, index: number) =>
      onChange(
        produce(conditions, draft => {
          // oxlint-disable-next-line no-explicit-any
          draft.splice(index, 1, c as any);
        })
      ),
    [onChange, conditions]
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

        return isRulesEngineAction(c) ? (
          <ActionBuilder
            key={c.id}
            conditionPath={thisPath}
            schema={schema}
            actionTypes={actionTypes}
            action={c}
            standalone={i === conditions.length - 1}
            // oxlint-disable-next-line jsx-no-new-function-as-prop
            onActionChange={a => updater(a, i)}
            autoSelectActionType={autoSelectActionType}
          />
        ) : (
          <ConditionBuilder
            key={c.id}
            conditionPath={thisPath}
            schema={schema}
            actionTypes={actionTypes}
            condition={c}
            isOnlyCondition={i === 0 && !isRuleGroup(conditions[i + 1])}
            // oxlint-disable-next-line jsx-no-new-function-as-prop
            onConditionChange={c => updater(c, i)}
            autoSelectActionType={autoSelectActionType}
          />
        );
      })}
    </React.Fragment>
  );
};
