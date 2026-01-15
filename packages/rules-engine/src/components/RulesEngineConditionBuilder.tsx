import { clsx, type RuleGroupType, type RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import type { FullOption, QueryBuilderProps } from 'react-querybuilder';
import { standardClassnamesRE } from '../defaults';
import type { ConditionProps, Consequent } from '../types';

type QueryBuilderPropsStandard = QueryBuilderProps<
  RuleGroupType,
  FullOption,
  FullOption,
  FullOption
>;

/**
 * Default header component for {@link RulesEngineConditionBuilder}.
 *
 */
export const ConditionBuilderHeader: React.MemoExoticComponent<
  (props: ConditionProps) => React.JSX.Element
> = React.memo(function ConditionBuilderHeader(props: ConditionProps): React.JSX.Element {
  const {
    condition: { consequent },
    conditionPath,
    schema: {
      addCondition,
      updateCondition,
      allowNestedConditions,
      removeCondition,
      classnames: { conditionBuilderHeader, blockLabel, blockLabelIf, blockLabelIfElse },
      components: {
        addCondition: AddCondition,
        addConsequent: AddConsequent,
        removeCondition: RemoveCondition,
      },
      translations,
      suppressStandardClassnames,
    },
  } = props;

  const isIf = conditionPath.at(-1) === 0;

  const wrapperClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.conditionBuilderHeader,
        conditionBuilderHeader
      ),
    [conditionBuilderHeader, suppressStandardClassnames]
  );
  const labelClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.blockLabel,
        blockLabel,
        isIf
          ? [suppressStandardClassnames || standardClassnamesRE.blockLabelIf, blockLabelIf]
          : [suppressStandardClassnames || standardClassnamesRE.blockLabelIfElse, blockLabelIfElse]
      ),
    [blockLabel, blockLabelIf, blockLabelIfElse, isIf, suppressStandardClassnames]
  );

  const { label: blockLabelLabel, title: blockLabelTitle } = isIf
    ? translations.blockLabelIf
    : translations.blockLabelElseIf;

  const addSubCondition = React.useCallback(() => {
    addCondition(conditionPath);
  }, [conditionPath, addCondition]);

  const ensureConsequent = React.useCallback(() => {
    if (!consequent)
      updateCondition(conditionPath, 'consequent', {
        type: props.schema.defaultConsequentType.value,
      });
  }, [conditionPath, consequent, props.schema.defaultConsequentType.value, updateCondition]);

  const removeThisCondition = React.useCallback(() => {
    removeCondition(conditionPath);
  }, [conditionPath, removeCondition]);

  return (
    <div className={wrapperClassName}>
      <div className={labelClassName} title={blockLabelTitle}>
        {blockLabelLabel}
      </div>
      {allowNestedConditions && (
        <AddCondition
          schema={props.schema}
          path={conditionPath}
          level={conditionPath.length}
          handleOnClick={addSubCondition}
          title={translations.addSubcondition.title}
          label={translations.addSubcondition.label}
        />
      )}
      <AddConsequent
        schema={props.schema}
        path={conditionPath}
        level={conditionPath.length}
        disabled={!!props.condition.consequent}
        handleOnClick={ensureConsequent}
        title={translations.addConsequent.title}
        label={translations.addConsequent.label}
      />
      <RemoveCondition
        schema={props.schema}
        path={conditionPath}
        level={conditionPath.length}
        handleOnClick={removeThisCondition}
        title={translations.removeCondition.title}
        label={translations.removeCondition.label}
      />
    </div>
  );
});

/**
 * Default body component for {@link RulesEngineConditionBuilder}.
 * @group Components
 */
export const RulesEngineConditionBuilderBody: React.MemoExoticComponent<
  (props: ConditionProps) => React.JSX.Element
> = React.memo(function RulesEngineConditionBuilderBody(props: ConditionProps): React.JSX.Element {
  const {
    conditionPath,
    schema: {
      updateCondition,
      components: {
        consequentBuilder: ConsequentBuilder,
        conditionBuilderCascade: ConditionCascade,
        queryBuilder: QueryBuilder,
      },
    },
  } = props;
  const onConsequentChange = React.useCallback(
    (consequent?: Consequent) => updateCondition(conditionPath, 'consequent', consequent),
    [conditionPath, updateCondition]
  );
  const onAntecedentChange = React.useCallback(
    (antecedent: RuleGroupTypeAny) => updateCondition(conditionPath, 'antecedent', antecedent),
    [conditionPath, updateCondition]
  );

  const consequentTypes = React.useMemo(
    () => props.schema.getConsequentTypes(props.conditionPath, props.condition.antecedent),
    [props.condition.antecedent, props.conditionPath, props.schema]
  );

  return (
    <React.Fragment>
      <QueryBuilder
        {...(props.schema.queryBuilderProps as QueryBuilderPropsStandard)}
        defaultQuery={props.condition.antecedent as RuleGroupType}
        onQueryChange={onAntecedentChange}
      />
      {props.condition.consequent && (
        <ConsequentBuilder
          conditionPath={props.conditionPath}
          consequentTypes={consequentTypes}
          consequent={props.condition.consequent}
          onConsequentChange={onConsequentChange}
          autoSelectConsequentType={props.autoSelectConsequentType}
          schema={props.schema}
        />
      )}
      {Array.isArray(props.condition.conditions) && props.condition.conditions.length > 0 && (
        <ConditionCascade
          conditionPath={props.conditionPath}
          conditions={props.condition.conditions}
          defaultConsequent={props.condition.defaultConsequent}
          schema={props.schema}
        />
      )}
    </React.Fragment>
  );
});

/**
 * Default condition editor for {@link RulesEngineBuilder}. Analogous to an "if" or "else-if" block.
 *
 * @group Components
 */
export const RulesEngineConditionBuilder: React.MemoExoticComponent<
  (props: ConditionProps) => React.JSX.Element
> = React.memo(function RulesEngineConditionBuilder(props: ConditionProps): React.JSX.Element {
  const {
    schema: {
      classnames: { conditionBuilder },
      suppressStandardClassnames,
      components: {
        conditionBuilderHeader: ConditionBuilderHeader,
        conditionBuilderBody: ConditionBuilderBody,
      },
    },
  } = props;
  const className = React.useMemo(
    () =>
      clsx(suppressStandardClassnames || standardClassnamesRE.conditionBuilder, conditionBuilder),
    [conditionBuilder, suppressStandardClassnames]
  );

  return (
    <div className={className}>
      <ConditionBuilderHeader {...props} />
      <ConditionBuilderBody {...props} />
    </div>
  );
});
