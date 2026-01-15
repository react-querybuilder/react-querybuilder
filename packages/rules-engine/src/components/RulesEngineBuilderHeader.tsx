import * as React from 'react';
import type { RulesEngineBuilderHeaderProps } from '../types';

/**
 * Default header component for {@link RulesEngineBuilder}.
 *
 * @group Components
 */
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
      allowDefaultConsequents,
      allowNestedConditions,
      components: { addConsequent: AddConsequent, addCondition: AddCondition },
      translations,
    },
  } = props;

  const addConditionThisPath = React.useCallback(() => {
    addCondition([]);
  }, [addCondition]);

  const ensureDefaultConsequent = React.useCallback(() => {
    if (!defaultConsequent)
      updateCondition([], 'defaultConsequent', { type: props.schema.defaultConsequentType.value });
  }, [defaultConsequent, props.schema.defaultConsequentType.value, updateCondition]);

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
      {allowDefaultConsequents && (
        <AddConsequent
          schema={props.schema}
          path={props.conditionPath}
          level={props.conditionPath.length}
          handleOnClick={ensureDefaultConsequent}
          disabled={!!defaultConsequent}
          title={translations.addDefaultConsequent.title}
          label={translations.addDefaultConsequent.label}
        />
      )}
    </div>
  );
});
