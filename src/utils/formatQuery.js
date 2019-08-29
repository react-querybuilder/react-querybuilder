import { isRuleGroup } from '.';

/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 * @param {RuleGroup} ruleGroup
 * @param {"json"|"sql"} format
 * @param {Function} valueProcessor
 */
const formatQuery = (ruleGroup, format, valueProcessor) => {
  if (format.toLowerCase() === 'json') {
    return JSON.stringify(ruleGroup, null, 2);
  } else if (format.toLowerCase() === 'sql') {
    const valueProc =
      valueProcessor ||
      ((field, operator, value) => {
        let val = `"${value}"`;
        if (operator.toLowerCase() === 'null' || operator.toLowerCase() === 'notnull') {
          val = '';
        } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'notin') {
          val = `(${value
            .split(',')
            .map((v) => `"${v.trim()}"`)
            .join(', ')})`;
        } else if (typeof value === 'boolean') {
          val = `${value}`.toUpperCase();
        }
        return val;
      });

    const processRule = (rule) => {
      const value = valueProc(rule.field, rule.operator, rule.value);

      let operator = rule.operator;
      if (rule.operator.toLowerCase() === 'null') {
        operator = 'is null';
      } else if (rule.operator.toLowerCase() === 'notnull') {
        operator = 'is not null';
      } else if (rule.operator.toLowerCase() === 'notin') {
        operator = 'not in';
      }

      return `${rule.field} ${operator} ${value}`.trim();
    };

    const processRuleGroup = (rg) => {
      const processedRules = rg.rules.map((rule) => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        return processRule(rule);
      });
      return '(' + processedRules.join(` ${rg.combinator} `) + ')';
    };

    return processRuleGroup(ruleGroup);
  } else {
    return '';
  }
};

export default formatQuery;
