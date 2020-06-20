import { nanoid } from 'nanoid';
import { isRuleGroup } from '.';
import { RuleType, RuleGroupType } from '../types';

/**
 * Generates a valid query object
 */
const generateValidQuery = (query: RuleGroupType | RuleType): RuleGroupType | RuleType => {
  if (isRuleGroup(query)) {
    return {
      id: query.id || `g-${nanoid()}`,
      rules: query.rules.map((rule) => generateValidQuery(rule)),
      combinator: query.combinator,
      not: !!query.not
    };
  }
  return {
    id: query.id || `r-${nanoid()}`,
    ...query
  };
};

export default generateValidQuery;
