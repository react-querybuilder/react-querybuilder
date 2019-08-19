import uniqueId from 'uuid/v4';
import { isRuleGroup } from '.';

/**
 * Generates a valid query object
 * @param {RuleGroupType} query Unvalidated query
 * @returns {RuleGroupType}
 */
const generateValidQuery = (query) => {
  if (isRuleGroup(query)) {
    return {
      id: query.id || `g-${uniqueId()}`,
      rules: query.rules.map((rule) => generateValidQuery(rule)),
      combinator: query.combinator
    };
  }
  return {
    id: query.id || `r-${uniqueId()}`,
    ...query
  };
};

export default generateValidQuery;
