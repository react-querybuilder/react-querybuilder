import { produce } from 'immer';
import * as React from 'react';
import { standardClassnames as sc } from '../defaults';
import type {
  BaseOption,
  Field,
  FullOptionList,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
  RulesEngine,
  RulesEngineAction,
  RulesEngineCondition,
} from '../types';
import {
  isRuleGroup,
  isRulesEngineAction,
  pathsAreEqual,
  toFlatOptionArray,
  toFullOptionList,
} from '../utils';
import clsx from '../utils/clsx';
import { QueryBuilder } from './QueryBuilder.debug';

const fields: Field[] = [{ name: 'age', label: 'Age' }];

const actionTypes: FullOptionList<BaseOption> = toFullOptionList([
  { value: 'send_email', label: 'Send Email' },
  { value: 'log_event', label: 'Log Event' },
]);

export const dummyRE: RulesEngine = {
  conditions: [
    {
      id: '1',
      combinator: 'and',
      rules: [{ id: '1-0', field: 'age', operator: '>=', value: 18 }],
      action: {
        actionType: 'send_email',
        params: { to: 'user@example.com', subject: 'Welcome!', body: 'Thanks for signing up!' },
      },
      conditions: [
        {
          id: '2-1',
          combinator: 'and',
          rules: [{ id: '2-1-0', field: 'age', operator: '=', value: 18 }],
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
      id: '2',
      combinator: 'and',
      rules: [{ id: '2-0', field: 'age', operator: '<', value: 18 }],
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
};

interface RulesEngineProps {
  conditionPath?: Path;
  rulesEngine?: RulesEngine;
  actionTypes?: FullOptionList<BaseOption>;
  autoSelectActionType?: boolean;
}

export const RulesEngineBuilder = <RG extends RuleGroupTypeAny>(
  props: RulesEngineProps = {}
): React.JSX.Element => {
  const { rulesEngine = dummyRE, autoSelectActionType = false, conditionPath } = props;
  const [re, setRE] = React.useState<RulesEngine>(rulesEngine);

  return (
    <div className={'rulesEngine'}>
      {re.conditions.map((c, i) => {
        const updater = (c: RulesEngineCondition<RG> | RulesEngineAction) =>
          setRE(
            produce(re, draft => {
              // oxlint-disable-next-line no-explicit-any
              draft.conditions.splice(i, 1, c as any);
            })
          );
        return isRulesEngineAction(c) ? (
          <RulesEngineActionBuilder
            key={c.id as string}
            // oxlint-disable-next-line jsx-no-new-array-as-prop
            conditionPath={[...(conditionPath ?? []), i]}
            actionTypes={actionTypes}
            action={c}
            standalone={i === rulesEngine.conditions.length - 1}
            onActionChange={updater}
          />
        ) : (
          <RulesEngineConditionBuilder<RG>
            key={c.id as string}
            // oxlint-disable-next-line jsx-no-new-array-as-prop
            conditionPath={[...(conditionPath ?? []), i]}
            actionTypes={actionTypes}
            condition={c as RulesEngineCondition<RG>}
            isOnlyCondition={i === 0 && !isRuleGroup(rulesEngine.conditions[i + 1])}
            onConditionChange={updater}
          />
        );
      })}
    </div>
  );
};

interface RulesEngineConditionProps<RG extends RuleGroupTypeAny> {
  conditionPath: Path;
  condition: RulesEngineCondition<RG>;
  actionTypes?: FullOptionList<BaseOption>;
  isOnlyCondition: boolean;
  onConditionChange: (condition: RulesEngineCondition<RG>) => void;
}

/**
 * Analogous to an "if" or "else-if" block.
 */
export const RulesEngineConditionBuilder = <RG extends RuleGroupTypeAny>(
  props: RulesEngineConditionProps<RG>
): React.JSX.Element => {
  // const onQueryChange = React.useCallback(
  //   (query: unknown) => {
  //     console.log({ conditionPath: props.conditionPath, query });
  //   },
  //   [props.conditionPath]
  // );
  const actionUpdater = (action: RulesEngineAction) =>
    props.onConditionChange({ ...props.condition, action });

  return (
    <div className={sc.ruleGroup}>
      <div className={sc.header}>
        <div>{props.conditionPath.at(-1) === 0 ? 'If' : 'Else If'}</div>
        {!pathsAreEqual([0], props.conditionPath) && <button type="button">⨯</button>}
      </div>
      <QueryBuilder
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
              action={props.condition.action as RulesEngineAction}
              onActionChange={actionUpdater}
            />
          )}
          {props.condition.conditions && props.condition.conditions.length > 0 && (
            <RulesEngineBuilder
              conditionPath={props.conditionPath}
              actionTypes={props.actionTypes}
              key={props.condition.id}
              rulesEngine={props.condition as RulesEngine}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
};

interface RulesEngineActionProps {
  conditionPath: Path;
  actionTypes?: FullOptionList<BaseOption>;
  action: RulesEngineAction;
  standalone?: boolean;
  onActionChange: (action: RulesEngineAction) => void;
  conditionsMet?: RuleGroupTypeAny;
  conditionsFailed?: RuleGroupTypeAny;
}

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
            onChange={e => props.onActionChange({ ...props.action, actionType: e.target.value })}>
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
