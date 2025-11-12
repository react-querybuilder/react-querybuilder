import { clsx, type RuleGroupType, type RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import type { FullOption, QueryBuilderProps } from 'react-querybuilder';
import { standardClassnamesRE } from '../defaults';
import type { ConditionProps, Consequent, REConditionAny } from '../types';

type QueryBuilderPropsStandard = QueryBuilderProps<
  RuleGroupType,
  FullOption,
  FullOption,
  FullOption
>;

/**
 * Default header component for {@link RulesEngineConditionBuilder}.
 */
export const ConditionBuilderHeader = (props: ConditionProps): React.JSX.Element => {
  const {
    conditionPath,
    schema: {
      addCondition,
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

  // const addConsequentThisPath = React.useCallback(() => {
  //   addConsequent(conditionPath);
  // }, [conditionPath, addConsequent]);

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
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
        // handleOnClick={addConsequentThisPath}
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
};

/**
 * Default body component for {@link RulesEngineConditionBuilder}.
 */
export const RulesEngineConditionBuilderBody = (props: ConditionProps): React.JSX.Element => {
  const {
    condition,
    onConditionChange,
    schema: {
      components: {
        consequentBuilder: ConsequentBuilder,
        conditionBuilderCascade: ConditionCascade,
        queryBuilder: QueryBuilder,
      },
    },
  } = props;
  const consequentUpdater = React.useCallback(
    (consequent?: Consequent) => onConditionChange({ ...condition, consequent }),
    [condition, onConditionChange]
  );
  const defaultConsequentUpdater = React.useCallback(
    (defaultConsequent?: Consequent) => onConditionChange({ ...condition, defaultConsequent }),
    [condition, onConditionChange]
  );
  const conditionUpdater = React.useCallback(
    (antecedent: RuleGroupTypeAny) =>
      onConditionChange({ ...condition, antecedent } as REConditionAny),
    [condition, onConditionChange]
  );
  const conditionsUpdater = React.useCallback(
    (conditions: REConditionAny[]) =>
      onConditionChange({ ...condition, conditions } as REConditionAny),
    [condition, onConditionChange]
  );

  return (
    <React.Fragment>
      <QueryBuilder
        {...(props.schema.queryBuilderProps as QueryBuilderPropsStandard)}
        enableMountQueryChange={false}
        query={props.condition.antecedent as RuleGroupType}
        onQueryChange={conditionUpdater}
      />
      {props.condition.consequent && (
        <ConsequentBuilder
          conditionPath={props.conditionPath}
          consequentTypes={props.consequentTypes}
          consequent={props.condition.consequent}
          onConsequentChange={consequentUpdater}
          autoSelectConsequentType={props.autoSelectConsequentType}
          schema={props.schema}
        />
      )}
      {Array.isArray(props.condition.conditions) && props.condition.conditions.length > 0 && (
        <ConditionCascade
          conditionPath={props.conditionPath}
          onConditionsChange={conditionsUpdater}
          onDefaultConsequentChange={defaultConsequentUpdater}
          conditions={props.condition.conditions}
          defaultConsequent={props.condition.defaultConsequent}
          schema={props.schema}
        />
      )}
    </React.Fragment>
  );
};

/**
 * Analogous to an "if" or "else-if" block.
 */
export const RulesEngineConditionBuilder = (props: ConditionProps): React.JSX.Element => {
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
};
