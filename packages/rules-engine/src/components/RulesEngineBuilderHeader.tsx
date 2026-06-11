import { clsx, type RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { EvaluationMode, RulesEngineBuilderHeaderProps } from '../types';

// The root default consequent has no antecedent; consequent-type resolution falls back to the
// global default for an empty group.
const emptyAntecedent: RuleGroupTypeAny = { combinator: 'and', rules: [] };

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
      evaluationMode,
      getDefaultConsequentType,
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
      updateCondition([], 'defaultConsequent', {
        type: getDefaultConsequentType([], emptyAntecedent),
      });
  }, [defaultConsequent, getDefaultConsequentType, updateCondition]);

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
      <AddCondition
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        handleOnClick={addConditionThisPath}
        title={translations.addCondition.title}
        label={translations.addCondition.label}
      />
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
      <select
        value={evaluationMode}
        className={evaluationModeClassName}
        title={translations.evaluationMode.title}
        onChange={onEvaluationModeChange}>
        <option value="cascade" title={translations.evaluationModeCascade.title}>
          {translations.evaluationModeCascade.label}
        </option>
        <option value="cumulative" title={translations.evaluationModeCumulative.title}>
          {translations.evaluationModeCumulative.label}
        </option>
      </select>
    </div>
  );
});
