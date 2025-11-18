import type { Path, RuleGroupType, RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import type { RulesEngineProps } from '../types';
import { useRulesEngineBuilder } from './RulesEngineBuilder.useRulesEngineBuilder';
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';

const rootConditionPath: Path = [];

export const RulesEngineBuilderInternal = <RG extends RuleGroupTypeAny = RuleGroupType>({
  props,
}: {
  props: RulesEngineProps;
}): React.JSX.Element => {
  const re = useRulesEngineBuilder<RG>(props);

  const { rulesEngineBuilderHeader: RulesEngineBuilderHeader } = re.components;

  return (
    <div className={re.wrapperClassName}>
      <RulesEngineBuilderHeader
        conditionPath={rootConditionPath}
        classnames={re.headerClassName}
        schema={re.schema}
        defaultConsequent={re.rulesEngine.defaultConsequent}
      />
      <RulesEngineConditionCascade
        conditionPath={rootConditionPath}
        onConditionsChange={re.onChange}
        onDefaultConsequentChange={re.onDefaultConsequentChange}
        // @ts-expect-error TODO
        conditions={re.rulesEngine.conditions}
        defaultConsequent={re.rulesEngine.defaultConsequent}
        schema={re.schema}
      />
    </div>
  );
};
