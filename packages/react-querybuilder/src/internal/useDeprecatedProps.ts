declare const __DEV__: boolean;

import { useEffect } from 'react';
import { errorDeprecatedRuleGroupProps, errorDeprecatedRuleProps } from './messages';

let didWarnUsingDeprecatedRuleProps = false;
let didWarnUsingDeprecatedRuleGroupProps = false;

export const useDeprecatedProps = (type: 'rule' | 'ruleGroup', newPropPresent: boolean) => {
  useEffect(() => {
    if (__DEV__ && type === 'rule' && !newPropPresent && !didWarnUsingDeprecatedRuleProps) {
      console.error(errorDeprecatedRuleProps);
      didWarnUsingDeprecatedRuleProps = true;
    }
    if (
      __DEV__ &&
      type === 'ruleGroup' &&
      !newPropPresent &&
      !didWarnUsingDeprecatedRuleGroupProps
    ) {
      console.error(errorDeprecatedRuleGroupProps);
      didWarnUsingDeprecatedRuleGroupProps = true;
    }
  }, [newPropPresent, type]);
};
