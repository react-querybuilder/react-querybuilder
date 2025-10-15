import { clsx, type RuleGroupType, type RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type {
  RulesEngineAction,
  RulesEngineConditionAny,
  RulesEngineConditionProps,
} from '../types';

/**
 * Default header component for {@link RulesEngineConditionBuilder}.
 */
export const RulesEngineConditionBuilderHeader = (
  props: RulesEngineConditionProps
): React.JSX.Element => {
  const {
    schema: {
      classnames: { conditionBuilderHeader, blockLabel },
      components: {
        addCondition: AddCondition,
        addAction: AddAction,
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
      <AddAction
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        disabled={!!props.condition.action}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
        title={translations.addAction.title}
        label={translations.addAction.label}
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
export const RulesEngineConditionBuilderBody = (
  props: RulesEngineConditionProps
): React.JSX.Element => {
  const {
    condition,
    onConditionChange,
    schema: {
      components: {
        actionBuilder: ActionBuilder,
        conditionBuilderCascade: ConditionCascade,
        queryBuilder: QueryBuilder,
      },
    },
  } = props;
  const actionUpdater = React.useCallback(
    (action?: RulesEngineAction) => onConditionChange({ ...condition, action }),
    [condition, onConditionChange]
  );
  const defaultActionUpdater = React.useCallback(
    (defaultAction?: RulesEngineAction) => onConditionChange({ ...condition, defaultAction }),
    [condition, onConditionChange]
  );
  const conditionUpdater = React.useCallback(
    (rec: RuleGroupTypeAny) =>
      onConditionChange({ ...condition, condition: rec } as RulesEngineConditionAny),
    [condition, onConditionChange]
  );
  const conditionsUpdater = React.useCallback(
    (conditions: RulesEngineConditionAny[]) =>
      onConditionChange({ ...condition, conditions } as RulesEngineConditionAny),
    [condition, onConditionChange]
  );

  return (
    <React.Fragment>
      <QueryBuilder
        enableMountQueryChange={false}
        fields={props.schema.fields}
        query={props.condition.condition as RuleGroupType}
        onQueryChange={conditionUpdater}
      />
      {props.condition.action && (
        <ActionBuilder
          conditionPath={props.conditionPath}
          actionTypes={props.actionTypes}
          action={props.condition.action}
          onActionChange={actionUpdater}
          autoSelectActionType={props.autoSelectActionType}
          schema={props.schema}
        />
      )}
      {Array.isArray(props.condition.conditions) && props.condition.conditions.length > 0 && (
        <ConditionCascade
          conditionPath={props.conditionPath}
          onConditionsChange={conditionsUpdater}
          onDefaultActionChange={defaultActionUpdater}
          conditions={props.condition.conditions}
          defaultAction={props.condition.defaultAction}
          schema={props.schema}
        />
      )}
    </React.Fragment>
  );
};

/**
 * Analogous to an "if" or "else-if" block.
 */
export const RulesEngineConditionBuilder = (
  props: RulesEngineConditionProps
): React.JSX.Element => {
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
