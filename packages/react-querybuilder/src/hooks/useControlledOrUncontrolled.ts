import { messages } from '../messages';
import { useRQB_INTERNAL_QueryBuilderDispatch, rqbWarn } from '../redux/_internal';
import type { RuleGroupTypeAny } from '../types';
import { usePrevious } from './usePrevious';

export interface UseControlledOrUncontrolledParams {
  defaultQuery?: RuleGroupTypeAny;
  queryProp?: RuleGroupTypeAny;
}

/**
 * Logs a warning when the component changes from controlled to uncontrolled,
 * vice versa, or both `query` and `defaultQuery` are provided.
 */
export const useControlledOrUncontrolled = (params: UseControlledOrUncontrolledParams) => {
  const dispatch = useRQB_INTERNAL_QueryBuilderDispatch();
  const { defaultQuery, queryProp } = params;
  const prevQueryPresent = usePrevious(!!queryProp);

  // istanbul ignore else
  if (process.env.NODE_ENV !== 'production') {
    if (!!queryProp && !!defaultQuery) {
      dispatch(rqbWarn(messages.errorBothQueryDefaultQuery));
    } else if (prevQueryPresent === true && !queryProp && !!defaultQuery) {
      dispatch(rqbWarn(messages.errorControlledToUncontrolled));
    } else if (prevQueryPresent === false && !!queryProp && !defaultQuery) {
      dispatch(rqbWarn(messages.errorUncontrolledToControlled));
    }
  }
};
