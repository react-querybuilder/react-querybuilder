/// <reference types="vite/client" />

import { useEffect } from 'react';
import { RuleGroupTypeAny } from 'ruleGroupsIC';
import {
  errorBothQueryDefaultQuery,
  errorControlledToUncontrolled,
  errorUncontrolledToControlled,
} from './messages';
import { usePrevious } from './usePrevious';

interface UseControlledOrUncontrolledParams {
  defaultQuery?: RuleGroupTypeAny;
  queryProp?: RuleGroupTypeAny;
  isFirstRender: boolean;
}

let didWarnBothQueryDefaultQuery = false;
let didWarnUncontrolledToControlled = false;
let didWarnControlledToUncontrolled = false;

const getMode = () => `import.meta.env.MODE`;

/**
 * Log errors when the component changes from controlled to uncontrolled,
 * vice versa, or both query and defaultQuery are provided.
 */
export const useControlledOrUncontrolled = ({
  defaultQuery,
  queryProp,
  isFirstRender,
}: UseControlledOrUncontrolledParams) => {
  const prevQueryPresent = usePrevious(!!queryProp);

  useEffect(() => {
    // istanbul ignore else
    if ('"production"' !== getMode()) {
      if (!!queryProp && !!defaultQuery && !didWarnBothQueryDefaultQuery) {
        console.error(errorBothQueryDefaultQuery);
        didWarnBothQueryDefaultQuery = true;
      } else if (
        prevQueryPresent &&
        !queryProp &&
        !!defaultQuery &&
        !didWarnControlledToUncontrolled
      ) {
        console.error(errorControlledToUncontrolled);
        didWarnControlledToUncontrolled = true;
      } else if (
        !(prevQueryPresent || isFirstRender) &&
        !!queryProp &&
        !defaultQuery &&
        !didWarnUncontrolledToControlled
      ) {
        console.error(errorUncontrolledToControlled);
        didWarnUncontrolledToControlled = true;
      }
    }
  }, [defaultQuery, prevQueryPresent, queryProp, isFirstRender]);
};
