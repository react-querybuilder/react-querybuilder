import type { Path, RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import { usePathsMemo } from 'react-querybuilder';
import type { ConditionCascadeProps, Consequent } from '../types';

// TODO: Temporary until disabled/etc. are implemented
const disabledPaths: Path[] = [];

/**
 * Renders a sequential list of if/else-if/else blocks in a rules engine.
 *
 * @group Components
 */
export const RulesEngineConditionCascade: React.MemoExoticComponent<
  <RG extends RuleGroupTypeAny>(props: ConditionCascadeProps<RG>) => React.JSX.Element
> = React.memo(function RulesEngineConditionCascade<RG extends RuleGroupTypeAny>(
  props: ConditionCascadeProps<RG>
): React.JSX.Element {
  const { conditionPath, conditions, defaultConsequent, schema } = props;
  const { updateCondition } = schema;
  const {
    consequentTypes,
    autoSelectConsequentType,
    allowDefaultConsequents,
    components: { conditionBuilder: ConditionBuilder, consequentBuilder: ConsequentBuilder },
  } = schema;

  const onDefaultConsequentChange = React.useCallback(
    (defaultConsequent?: Consequent) =>
      updateCondition(conditionPath, 'defaultConsequent', defaultConsequent),
    [conditionPath, updateCondition]
  );

  const pathsMemo = usePathsMemo({
    disabled: false,
    disabledPaths,
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
            autoSelectConsequentType={autoSelectConsequentType}
          />
        );
      })}
      {allowDefaultConsequents && defaultConsequent && (
        <ConsequentBuilder
          key="defaultConsequent"
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
});
