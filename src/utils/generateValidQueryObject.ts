import { generateID, isRuleGroup } from '.';
import { RuleGroupType, RuleType } from '../types';

/**
 * Generates a valid query object
 */
const generateValidQueryObject = <T extends RuleGroupType | RuleType>(
  queryObject: T,
  path: number[] = []
): T => {
  if (isRuleGroup(queryObject)) {
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
    };
  }
  return {
    ...queryObject,
    path,
    id: queryObject.id ?? `r-${generateID()}`
  };
};

export default generateValidQueryObject;
