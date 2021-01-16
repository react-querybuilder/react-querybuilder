import short from 'short-uuid';
import { isRuleGroup } from '.';
import { RuleType, RuleGroupType } from '../types';

const translator = short();

/**
 * Generates a valid query object
 */
const generateValidQuery = (query: RuleGroupType | RuleType): RuleGroupType | RuleType => {
  if (isRuleGroup(query)) {
    return {
      id: query.id || `g-${translator.new()}`,
      rules: query.rules.map((rule) => generateValidQuery(rule)),
      combinator: query.combinator,
      not: !!query.not
    };
  }
  return {
    id: query.id || `r-${translator.new()}`,
    ...query
  };
};

export default generateValidQuery;
