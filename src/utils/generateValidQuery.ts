import { generateID, isRuleGroup } from '.';
import { RuleGroupType, RuleType } from '../types';

/**
 * Generates a valid query object
 */
const generateValidQuery = (query: RuleGroupType | RuleType): RuleGroupType | RuleType => {
  if (isRuleGroup(query)) {
    return {
      id: query.id || `g-${generateID()}`,
      rules: query.rules.map((rule) => generateValidQuery(rule)),
      combinator: query.combinator,
      not: !!query.not
    };
  }
  return {
    id: query.id || `r-${generateID()}`,
    ...query
  };
};

export default generateValidQuery;
