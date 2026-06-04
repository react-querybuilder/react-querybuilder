import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { EvaluationMode, RulesEngineBuilderHeaderProps } from '../types';

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
    conditionPath,
    schema: {
      addCondition,
      updateCondition,
      allowDefaultConsequents,
      allowNestedConditions,
      evaluationMode,
      suppressStandardClassnames,
      classnames: classnamesRE,
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

  const onEvaluationModeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      updateCondition(conditionPath, 'evaluationMode', event.target.value as EvaluationMode);
    },
    [conditionPath, updateCondition]
  );

  const evaluationModeClassName = clsx(
    suppressStandardClassnames || standardClassnamesRE.evaluationMode,
    classnamesRE.evaluationMode
  );

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
      <label className={evaluationModeClassName} title={translations.evaluationMode.title}>
        {translations.evaluationMode.label}
        <select value={evaluationMode} onChange={onEvaluationModeChange}>
          <option value="cascade" title={translations.evaluationModeCascade.title}>
            {translations.evaluationModeCascade.label}
          </option>
          <option value="cumulative" title={translations.evaluationModeCumulative.title}>
            {translations.evaluationModeCumulative.label}
          </option>
        </select>
      </label>
    </div>
  );
});
