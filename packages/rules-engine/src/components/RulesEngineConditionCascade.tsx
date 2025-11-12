import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { produce } from 'immer';
import * as React from 'react';
import { usePathsMemo } from 'react-querybuilder';
import type { ConditionCascadeProps, REConditionAny } from '../types';

/**
 * Renders a sequential list of if/else-if/else blocks in a rules engine.
 */
export const RulesEngineConditionCascade = <RG extends RuleGroupTypeAny>(
  props: ConditionCascadeProps<RG>
): React.JSX.Element => {
  const {
    conditionPath,
    conditions,
    defaultConsequent,
    onConditionsChange,
    onDefaultConsequentChange,
    schema,
  } = props;
  const {
    consequentTypes,
    autoSelectConsequentType,
    components: { conditionBuilder: ConditionBuilder, consequentBuilder: ConsequentBuilder },
  } = schema;

  const conditionUpdater = React.useCallback(
    (c: REConditionAny, index: number) =>
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
            consequentTypes={consequentTypes}
            condition={c}
            isOnlyCondition={conditions.length === 1}
            // oxlint-disable-next-line jsx-no-new-function-as-prop
            onConditionChange={c => conditionUpdater(c, i)}
            autoSelectConsequentType={autoSelectConsequentType}
          />
        );
      })}
      {defaultConsequent && (
        <ConsequentBuilder
          key={'defaultConsequent'}
          conditionPath={conditionPath}
          schema={schema}
          consequentTypes={consequentTypes}
          consequent={defaultConsequent}
          standalone
          onConsequentChange={onDefaultConsequentChange}
          autoSelectConsequentType={autoSelectConsequentType}
        />
      )}
    </React.Fragment>
  );
};
