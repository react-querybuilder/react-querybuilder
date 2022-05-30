declare const __RQB_DEV__: boolean;

import { useEffect } from 'react';
import { errorDeprecatedRuleGroupProps, errorDeprecatedRuleProps } from './messages';

let didWarnUsingDeprecatedRuleProps = false;
let didWarnUsingDeprecatedRuleGroupProps = false;

export const useDeprecatedProps = (type: 'rule' | 'ruleGroup', newPropPresent: boolean) => {
  useEffect(() => {
    if (__RQB_DEV__ && type === 'rule' && !newPropPresent && !didWarnUsingDeprecatedRuleProps) {
      console.error(errorDeprecatedRuleProps);
      didWarnUsingDeprecatedRuleProps = true;
    }
    if (
      __RQB_DEV__ &&
      type === 'ruleGroup' &&
      !newPropPresent &&
      !didWarnUsingDeprecatedRuleGroupProps
    ) {
      console.error(errorDeprecatedRuleGroupProps);
      didWarnUsingDeprecatedRuleGroupProps = true;
    }
  }, [newPropPresent, type]);
};
