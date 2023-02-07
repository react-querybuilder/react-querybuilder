declare const __RQB_DEV__: boolean;

import type { RuleGroupTypeAny } from '@react-querybuilder/ts';
import { useEffect } from 'react';
import {
  errorBothQueryDefaultQuery,
  errorControlledToUncontrolled,
  errorUncontrolledToControlled,
} from '../../messages';
import { usePrevious } from './usePrevious';

export interface UseControlledOrUncontrolledParams {
  defaultQuery?: RuleGroupTypeAny;
  queryProp?: RuleGroupTypeAny;
  isFirstRender: boolean;
}

let didWarnBothQueryDefaultQuery = false;
let didWarnUncontrolledToControlled = false;
let didWarnControlledToUncontrolled = false;

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
    // c8 ignore else
    if (__RQB_DEV__) {
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
