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
 * Default header component for {@link ConditionBuilder}.
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
      moveCondition,
      showShiftActions,
      getDefaultConsequentType,
      evaluationMode,
      classnames: {
        conditionBuilderHeader,
        blockLabel,
        blockLabelIf,
        blockLabelIfElse,
        blockLabelWhen,
        shiftActions,
      },
      components: {
        addCondition: AddCondition,
        addConsequent: AddConsequent,
        removeCondition: RemoveCondition,
        shiftActions: ShiftActions,
      },
      translations,
      suppressStandardClassnames,
    },
  } = props;

  const isCumulative = evaluationMode === 'cumulative';
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
        isCumulative
          ? [suppressStandardClassnames || standardClassnamesRE.blockLabelWhen, blockLabelWhen]
          : isIf
            ? [suppressStandardClassnames || standardClassnamesRE.blockLabelIf, blockLabelIf]
            : [
                suppressStandardClassnames || standardClassnamesRE.blockLabelIfElse,
                blockLabelIfElse,
              ]
      ),
    [
      blockLabel,
      blockLabelIf,
      blockLabelIfElse,
      blockLabelWhen,
      isCumulative,
      isIf,
      suppressStandardClassnames,
    ]
  );

  const { label: blockLabelLabel, title: blockLabelTitle } = isCumulative
    ? translations.blockLabelWhen
    : isIf
      ? translations.blockLabelIf
      : translations.blockLabelElseIf;

  const addSubCondition = React.useCallback(() => {
    addCondition(conditionPath);
  }, [conditionPath, addCondition]);

  const ensureConsequent = React.useCallback(() => {
    if (!consequent)
      updateCondition(conditionPath, 'consequent', {
        type: getDefaultConsequentType(conditionPath, props.condition.antecedent),
      });
  }, [
    conditionPath,
    consequent,
    getDefaultConsequentType,
    props.condition.antecedent,
    updateCondition,
  ]);

  const removeThisCondition = React.useCallback(() => {
    removeCondition(conditionPath);
  }, [conditionPath, removeCondition]);

  const shiftConditionUp = React.useCallback(() => {
    moveCondition(conditionPath, 'up');
  }, [conditionPath, moveCondition]);

  const shiftConditionDown = React.useCallback(() => {
    moveCondition(conditionPath, 'down');
  }, [conditionPath, moveCondition]);

  const shiftActionsClassName = React.useMemo(
    () => clsx(suppressStandardClassnames || standardClassnamesRE.shiftActions, shiftActions),
    [shiftActions, suppressStandardClassnames]
  );

  const shiftActionsLabels = React.useMemo(
    () => ({
      shiftUp: translations.shiftActionUp.label,
      shiftDown: translations.shiftActionDown.label,
    }),
    [translations.shiftActionUp.label, translations.shiftActionDown.label]
  );

  const shiftActionsTitles = React.useMemo(
    () => ({
      shiftUp: translations.shiftActionUp.title,
      shiftDown: translations.shiftActionDown.title,
    }),
    [translations.shiftActionUp.title, translations.shiftActionDown.title]
  );

  return (
    <div className={wrapperClassName}>
      <div className={labelClassName} title={blockLabelTitle}>
        {blockLabelLabel}
      </div>
      {showShiftActions && (
        <ShiftActions
          schema={props.schema}
          path={conditionPath}
          level={conditionPath.length}
          className={shiftActionsClassName}
          labels={shiftActionsLabels}
          titles={shiftActionsTitles}
          shiftUp={shiftConditionUp}
          shiftDown={shiftConditionDown}
          shiftUpDisabled={props.shiftUpDisabled}
          shiftDownDisabled={props.shiftDownDisabled}
        />
      )}
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
 * Default body component for {@link ConditionBuilder}.
 * @group Components
 */
export const ConditionBuilderBody: React.MemoExoticComponent<
  (props: ConditionProps) => React.JSX.Element
> = React.memo(function ConditionBuilderBody(props: ConditionProps): React.JSX.Element {
  const {
    conditionPath,
    schema: {
      updateCondition,
      classnames: { conditionBuilderBody },
      suppressStandardClassnames,
      components: {
        consequentBuilder: ConsequentBuilder,
        conditionBuilderCascade: ConditionCascade,
        queryBuilder: QueryBuilder,
      },
    },
  } = props;
  const className = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.conditionBuilderBody,
        conditionBuilderBody
      ),
    [conditionBuilderBody, suppressStandardClassnames]
  );
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
    <div className={className}>
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
    </div>
  );
});

/**
 * Default condition editor for {@link RulesEngineBuilder}. Analogous to an "if" or "else-if" block.
 *
 * @group Components
 */
export const ConditionBuilder: React.MemoExoticComponent<
  (props: ConditionProps) => React.JSX.Element
> = React.memo(function ConditionBuilder(props: ConditionProps): React.JSX.Element {
  const {
    schema: {
      classnames: { conditionBuilder },
      suppressStandardClassnames,
      components: {
        conditionBuilderHeader: ConditionBuilderHeaderComponent,
        conditionBuilderBody: ConditionBuilderBodyComponent,
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
      <ConditionBuilderHeaderComponent {...props} />
      <ConditionBuilderBodyComponent {...props} />
    </div>
  );
});
