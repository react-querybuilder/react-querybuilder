import * as React from 'react';
import type { RulesEngineBuilderHeaderProps } from '../types';

export const RulesEngineBuilderHeader: React.MemoExoticComponent<
  (props: RulesEngineBuilderHeaderProps) => React.JSX.Element
> = React.memo(function RulesEngineBuilderHeader(
  props: RulesEngineBuilderHeaderProps
): React.JSX.Element {
  const {
    classnames,
    defaultConsequent,
    schema: {
      addCondition,
      updateCondition,
      allowNestedConditions,
      components: { addConsequent: AddConsequent, addCondition: AddCondition },
      translations,
    },
  } = props;

  const addConditionThisPath = React.useCallback(() => {
    addCondition([]);
  }, [addCondition]);

  const ensureDefaultConsequent = React.useCallback(() => {
    if (!defaultConsequent) updateCondition([], 'defaultConsequent', { type: 'TODO' });
  }, [defaultConsequent, updateCondition]);

  return (
    <div className={classnames}>
      {allowNestedConditions && (
        <AddCondition
          schema={props.schema}
          path={props.conditionPath}
          level={props.conditionPath.length}
          handleOnClick={addConditionThisPath}
          title={translations.addCondition.title}
          label={translations.addCondition.label}
        />
      )}
      <AddConsequent
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        handleOnClick={ensureDefaultConsequent}
        disabled={!!defaultConsequent}
        title={translations.addDefaultConsequent.title}
        label={translations.addDefaultConsequent.label}
      />
    </div>
  );
});
