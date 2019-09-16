import nanoid from 'nanoid';
import { isRuleGroup } from '.';

/**
 * Generates a valid query object
 * @param {RuleGroupType} query Unvalidated query
 * @returns {RuleGroupType}
 */
const generateValidQuery = (query) => {
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
