import { generateID } from '.';
import type { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC, RuleType } from '../types';

/**
 * Generates a valid query object
 */
const generateValidQueryObject = <T extends RuleGroupTypeAny | RuleType>(
  queryObject: T,
  path: number[] = []
): T extends RuleGroupType
  ? RuleGroupType
  : T extends RuleGroupTypeIC
  ? RuleGroupTypeIC
  : RuleType => {
  if ('combinator' in queryObject) {
    const rules = queryObject.rules.map((r, idx) => {
      const thisPath = path.concat([idx]);
      return generateValidQueryObject(r, thisPath);
    });
    return {
      ...queryObject,
      id: queryObject.id ?? `g-${generateID()}`,
      path,
      rules,
      combinator: queryObject.combinator,
      not: !!queryObject.not
    } as any;
  } else if ('rules' in queryObject) {
    const rules = queryObject.rules.map((r, idx) => {
      const thisPath = path.concat([idx]);
      return typeof r === 'string' ? r : generateValidQueryObject(r, thisPath);
    });
    return {
      ...queryObject,
      id: queryObject.id ?? `g-${generateID()}`,
      path,
      rules,
      not: !!queryObject.not
    } as any;
  }
  return {
    ...queryObject,
    path,
    id: queryObject.id ?? `r-${generateID()}`
  } as any;
};

export default generateValidQueryObject;
