import * as React from 'react';
import type { RulesEngineBuilderHeaderProps } from '../types';

export const RulesEngineBuilderHeader = (
  props: RulesEngineBuilderHeaderProps
): React.JSX.Element => {
  const {
    classnames,
    defaultConsequent,
    schema: {
      addCondition,
      allowNestedConditions,
      components: { addConsequent: AddConsequent, addCondition: AddCondition },
      translations,
    },
  } = props;

  const addConditionThisPath = React.useCallback(() => {
    addCondition([]);
  }, [addCondition]);

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
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
        disabled={!!defaultConsequent}
        title={translations.addConsequent.title}
        label={translations.addConsequent.label}
      />
    </div>
  );
};
