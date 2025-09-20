import { produce } from 'immer';
import * as React from 'react';
import type {
  BaseOption,
  Field,
  FullOptionList,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
} from 'react-querybuilder';
import {
  clsx,
  isRuleGroup,
  pathsAreEqual,
  QueryBuilder,
  regenerateIDs,
  standardClassnames as sc,
  toFlatOptionArray,
  toFullOptionList,
  useOptionListProp,
} from 'react-querybuilder';
import type {
  RulesEngine,
  RulesEngineAction,
  RulesEngineActionProps,
  RulesEngineCondition,
  RulesEngineConditionProps,
  RulesEngineProps,
} from '../types';
import { isRulesEngineAction } from '../utils';

const fields: Field[] = [{ name: 'age', label: 'Age' }];

const dummyActionTypes: FullOptionList<BaseOption> = toFullOptionList([
  { value: 'send_email', label: 'Send Email' },
  { value: 'log_event', label: 'Log Event' },
]);

export const dummyRE: RulesEngine = regenerateIDs({
  conditions: [
    {
      combinator: 'and',
      rules: [{ field: 'age', operator: '>=', value: 18 }],
      action: {
        actionType: 'send_email',
        params: { to: 'user@example.com', subject: 'Welcome!', body: 'Thanks for signing up!' },
      },
      conditions: [
        {
          combinator: 'and',
          rules: [{ field: 'age', operator: '=', value: 18 }],
          action: {
            actionType: 'send_email',
            params: {
              to: 'user@example.com',
              subject: 'Happy Birthday!',
              body: 'Thanks for signing up!',
            },
          },
        },
      ],
    },
    {
      combinator: 'and',
      rules: [{ field: 'age', operator: '<', value: 18 }],
      action: {
        actionType: 'send_email',
        params: {
          to: 'user@example.com',
          subject: 'Sorry!',
          body: 'You must be 18 or older to sign up.',
        },
      },
    },
    { id: '3', actionType: 'log_event' },
  ],
});

const rootPath: Path = [];

export const RulesEngineBuilder = <RG extends RuleGroupTypeAny>(
  props: RulesEngineProps = {}
): React.JSX.Element => {
  const {
    rulesEngine = dummyRE,
    autoSelectActionType = false,
    conditionPath = rootPath,
    onRulesEngineChange,
  } = props;
  const [re, setRE] = React.useState<RulesEngine>(rulesEngine);
  const onChange = React.useCallback(
    (re: RulesEngine) => {
      setRE(re);
      onRulesEngineChange?.(re);
    },
    [onRulesEngineChange]
  );
  const { optionList: actionTypes } = useOptionListProp({ optionList: dummyActionTypes });

  const updater = React.useCallback(
    (c: RulesEngineCondition<RG> | RulesEngineAction, index: number) =>
      onChange(
        produce(re, draft => {
          // oxlint-disable-next-line no-explicit-any
          draft.conditions.splice(index, 1, c as any);
        })
      ),
    [onChange, re]
  );
  return (
    <div className={'rulesEngine'}>
      {re.conditions.map((c, i) => {
        return isRulesEngineAction(c) ? (
          <RulesEngineActionBuilder
            key={c.id as string}
            // oxlint-disable-next-line jsx-no-new-array-as-prop
            conditionPath={[...conditionPath, i]}
            actionTypes={actionTypes}
            action={c}
            standalone={i === rulesEngine.conditions.length - 1}
            onActionChange={updater}
            autoSelectActionType={autoSelectActionType}
          />
        ) : (
          <RulesEngineConditionBuilder
            key={c.id as string}
            // oxlint-disable-next-line jsx-no-new-array-as-prop
            conditionPath={[...conditionPath, i]}
            actionTypes={actionTypes}
            condition={c as RulesEngineCondition<RG>}
            isOnlyCondition={i === 0 && !isRuleGroup(rulesEngine.conditions[i + 1])}
            onConditionChange={updater}
            autoSelectActionType={autoSelectActionType}
          />
        );
      })}
    </div>
  );
};

/**
 * Analogous to an "if" or "else-if" block.
 */
export const RulesEngineConditionBuilder = <RG extends RuleGroupTypeAny>(
  props: RulesEngineConditionProps<RG>
): React.JSX.Element => {
  const { condition, onConditionChange } = props;
  const actionUpdater = React.useCallback(
    (action: RulesEngineAction) =>
      onConditionChange({ ...condition, action }, props.conditionPath.at(-1)!),
    [condition, onConditionChange, props.conditionPath]
  );
  const conditionUpdater = React.useCallback(
    (re: RulesEngineCondition<RG>) => onConditionChange(re, props.conditionPath.at(-1)!),
    [onConditionChange, props.conditionPath]
  );

  return (
    <div className={sc.ruleGroup}>
      <div className={sc.header}>
        <div>{props.conditionPath.at(-1) === 0 ? 'If' : 'Else If'}</div>
        {!pathsAreEqual([0], props.conditionPath) && <button type="button">⨯</button>}
      </div>
      <QueryBuilder
        enableMountQueryChange={false}
        fields={fields}
        defaultQuery={props.condition as RuleGroupType}
        // oxlint-disable-next-line no-explicit-any
        onQueryChange={props.onConditionChange as any}
      />
      {(props.condition.action || props.condition.conditions) && (
        <React.Fragment>
          {props.condition.action && (
            <RulesEngineActionBuilder
              conditionPath={props.conditionPath}
              actionTypes={props.actionTypes}
              action={props.condition.action}
              onActionChange={actionUpdater}
              autoSelectActionType={props.autoSelectActionType}
            />
          )}
          {Array.isArray(props.condition.conditions) && props.condition.conditions.length > 0 && (
            <RulesEngineBuilder
              conditionPath={props.conditionPath}
              actionTypes={props.actionTypes}
              key={props.condition.id}
              rulesEngine={props.condition as RulesEngine}
              autoSelectActionType={props.autoSelectActionType}
              // oxlint-disable-next-line no-explicit-any
              onRulesEngineChange={conditionUpdater as any}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
};

/**
 * Analogous to the body of an "if" or "else-if" block.
 */
export const RulesEngineActionBuilder = (props: RulesEngineActionProps): React.JSX.Element => {
  const className = clsx(sc.ruleGroup, 'rulesEngine-action', {
    'rulesEngine-action-standalone': props.standalone,
  });
  return (
    <div className={className}>
      <div className={sc.header}>
        <div>{props.standalone ? 'Else' : 'Then'}</div>
        <button type="button">⨯</button>
      </div>
      <div className={sc.rule}>
        {props.actionTypes && (
          <select
            value={props.action.actionType}
            // oxlint-disable-next-line jsx-no-new-function-as-prop
            onChange={e =>
              props.onActionChange(
                { ...props.action, actionType: e.target.value },
                props.conditionPath.at(-1)!
              )
            }>
            {toFlatOptionArray(props.actionTypes).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <pre>
        <code>{JSON.stringify(props.action)}</code>
      </pre>
    </div>
  );
};
