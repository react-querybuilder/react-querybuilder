import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import * as React from 'react';
import type { RuleGroupTypeAny } from '../types';

// type OnRuleAddProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> = {
//   rule: RuleType;
//   parentPath: number[];
//   context?: any;
//   combinators: OptionList<Combinator>;
//   debugMode?: boolean;
//   onAddRule?: QueryBuilderProps<RG>['onAddRule'];
//   onLog?: QueryBuilderProps<RG>['onLog'];
//   queryDisabled?: boolean;
// };

export const useCreateReduxSlice = (initialState: RuleGroupTypeAny) =>
  React.useMemo(
    (): Slice<RuleGroupTypeAny> =>
      createSlice({
        name: 'query',
        initialState,
        reducers: {
          setReduxQuery(state, action: PayloadAction<RuleGroupTypeAny>) {
            (state as any) = action.payload;
          },
          // addRule(
          //   queryLocal,
          //   {
          //     payload: {
          //       parentPath,
          //       queryDisabled,
          //       debugMode,
          //       rule,
          //       onAddRule = r => r,
          //       context,
          //       onLog = console.log,
          //       combinators,
          //     },
          //   }: PayloadAction<OnRuleAddProps<RuleGroupTypeAny>>
          // ) {
          //   if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
          //     // istanbul ignore else
          //     if (debugMode) {
          //       onLog({ type: LogType.parentPathDisabled, rule, parentPath, query: queryLocal });
          //     }
          //     return;
          //   }
          //   const newRule = onAddRule(rule, parentPath, queryLocal, context);
          //   if (!newRule) {
          //     // istanbul ignore else
          //     if (debugMode) {
          //       onLog({ type: LogType.onAddRuleFalse, rule, parentPath, query: queryLocal });
          //     }
          //     return;
          //   }
          //   const newQuery = add(queryLocal, newRule, parentPath, {
          //     combinators,
          //     combinatorPreceding: newRule.combinatorPreceding ?? undefined,
          //   });
          //   if (debugMode) {
          //     onLog({ type: LogType.add, query: queryLocal, newQuery, newRule, parentPath });
          //   }
          //   queryLocal = newQuery;
          // },
          // addGroup(_state, _action: PayloadAction) {},
          // removeRuleOrGroup(_state, _action: PayloadAction) {},
          // changeProp(_state, _action: PayloadAction) {},
          // moveRuleOrGroup(_state, _action: PayloadAction) {},
        },
      }),
    [initialState]
  );
// onRuleRemove: onRuleOrGroupRemove,
// onGroupRemove: onRuleOrGroupRemove,
