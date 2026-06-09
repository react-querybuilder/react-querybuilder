import type { Path } from '@react-querybuilder/core';
import * as React from 'react';
import type { RulesEngineProps } from '../types';
import { ConditionCascade } from './ConditionCascade';
import { useRulesEngineBuilder } from './RulesEngineBuilder.useRulesEngineBuilder';

const rootConditionPath: Path = [];

export const RulesEngineBuilderInternal: React.MemoExoticComponent<
  (props: { props: RulesEngineProps }) => React.JSX.Element
> = React.memo(function RulesEngineBuilderInternal({
  props,
}: {
  props: RulesEngineProps;
}): React.JSX.Element {
  const re = useRulesEngineBuilder(props);

  const { rulesEngineBuilderHeader: RulesEngineBuilderHeader } = re.components;

  return (
    <div className={re.wrapperClassName}>
      <RulesEngineBuilderHeader
        conditionPath={rootConditionPath}
        classnames={re.headerClassName}
        schema={re.schema}
        defaultConsequent={re.rulesEngine.defaultConsequent}
      />
      <div className={re.bodyClassName}>
        <ConditionCascade
          conditionPath={rootConditionPath}
          conditions={re.rulesEngine.conditions}
          defaultConsequent={re.rulesEngine.defaultConsequent}
          schema={re.schema}
        />
      </div>
    </div>
  );
});
