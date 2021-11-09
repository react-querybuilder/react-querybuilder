import { generateID } from '.';
import type { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC, RuleType } from '../types';

/**
 * Generates a valid query object
 */
const generateValidQueryObject = <T extends RuleGroupTypeAny | RuleType>(
  queryObject: T
): T extends RuleGroupType
  ? RuleGroupType
  : T extends RuleGroupTypeIC
  ? RuleGroupTypeIC
  : RuleType => {
  if ('combinator' in queryObject) {
    const rules = queryObject.rules.map((r) => {
      return generateValidQueryObject(r);
    });
    return {
      ...queryObject,
      id: queryObject.id ?? `g-${generateID()}`,
      rules,
      combinator: queryObject.combinator,
      not: !!queryObject.not
    } as any;
  } else if ('rules' in queryObject) {
    const rules = queryObject.rules.map((r) => {
      return typeof r === 'string' ? r : generateValidQueryObject(r);
    });
    return {
      ...queryObject,
      id: queryObject.id ?? `g-${generateID()}`,
      rules,
      not: !!queryObject.not
    } as any;
  }
  return {
    ...queryObject,
    id: queryObject.id ?? `r-${generateID()}`
  } as any;
};

export default generateValidQueryObject;
