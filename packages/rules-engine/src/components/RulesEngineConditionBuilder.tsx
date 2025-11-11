import { clsx, type RuleGroupType, type RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import type { FullOption, QueryBuilderProps } from 'react-querybuilder';
import { standardClassnamesRE } from '../defaults';
import type { AntecedentAny, ConditionProps, Consequent } from '../types';

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
    schema: {
      classnames: { conditionBuilderHeader, blockLabel },
      components: {
        addCondition: AddCondition,
        addConsequent: AddConsequent,
        removeCondition: RemoveCondition,
      },
      translations,
      suppressStandardClassnames,
    },
  } = props;
  const wrapperClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.conditionBuilderHeader,
        conditionBuilderHeader
      ),
    [conditionBuilderHeader, suppressStandardClassnames]
  );
  const labelClassName = React.useMemo(
    () => clsx(suppressStandardClassnames || standardClassnamesRE.blockLabel, blockLabel),
    [blockLabel, suppressStandardClassnames]
  );

  const { label: blockLabelLabel, title: blockLabelTitle } =
    props.conditionPath.at(-1) === 0 ? translations.blockLabelIf : translations.blockLabelElseIf;

  return (
    <div className={wrapperClassName}>
      <div className={labelClassName} title={blockLabelTitle}>
        {blockLabelLabel}
      </div>
      <AddCondition
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
        title={translations.addSubcondition.title}
        label={translations.addSubcondition.label}
      />
      <AddConsequent
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        disabled={!!props.condition.consequent}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
        title={translations.addConsequent.title}
        label={translations.addConsequent.label}
      />
      <RemoveCondition
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
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
      onConditionChange({ ...condition, antecedent } as AntecedentAny),
    [condition, onConditionChange]
  );
  const conditionsUpdater = React.useCallback(
    (conditions: AntecedentAny[]) =>
      onConditionChange({ ...condition, conditions } as AntecedentAny),
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
